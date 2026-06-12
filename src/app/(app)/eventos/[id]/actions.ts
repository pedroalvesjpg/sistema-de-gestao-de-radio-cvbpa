"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { registrarAcao } from "@/lib/audit";
import { deleteFoto } from "@/lib/storage";

type CriarRegistroInput = {
  modeloRadio: string;
  codigoRadio: string;
  equipe: string;
  nomeResponsavel: string;
  rgResponsavel: string;
  observacao?: string;
  urlFotoRg: string;
  urlFotoRadioSaida: string;
};

type ParsedRegistro =
  | { ok: true; data: {
      modeloRadio: string;
      codigoRadio: string;
      equipe: string;
      nomeResponsavel: string;
      rgResponsavel: string;
      observacao: string | null;
      urlFotoRg: string;
      urlFotoRadioSaida: string;
    } }
  | { ok: false; error: string };

function validarRegistro(input: CriarRegistroInput): ParsedRegistro {
  const modeloRadio = input.modeloRadio.trim();
  const codigoRadio = input.codigoRadio.trim();
  const equipe = input.equipe.trim();
  const nomeResponsavel = input.nomeResponsavel.trim();
  const rgResponsavel = input.rgResponsavel.trim();
  const observacao = input.observacao?.trim() || null;
  const urlFotoRg = input.urlFotoRg.trim();
  const urlFotoRadioSaida = input.urlFotoRadioSaida.trim();

  if (!modeloRadio || !codigoRadio || !equipe || !nomeResponsavel || !rgResponsavel) {
    return { ok: false, error: "Preencha modelo, código, equipe, nome e RG." };
  }
  if (!urlFotoRg || !urlFotoRadioSaida) {
    return { ok: false, error: "Faça upload da foto do RG e do rádio." };
  }
  return {
    ok: true,
    data: {
      modeloRadio,
      codigoRadio,
      equipe,
      nomeResponsavel,
      rgResponsavel,
      observacao,
      urlFotoRg,
      urlFotoRadioSaida,
    },
  };
}

export async function criarRegistro(eventoId: number, input: CriarRegistroInput) {
  const session = await requireUser();

  const evento = await prisma.evento.findUnique({ where: { id: eventoId } });
  if (!evento) return { error: "Evento não encontrado." } as const;
  if (evento.dataFim < new Date()) {
    return { error: "Evento já encerrado — não é possível registrar saída." } as const;
  }

  const parsed = validarRegistro(input);
  if (!parsed.ok) return { error: parsed.error } as const;

  const registro = await prisma.registro.create({
    data: {
      eventoId,
      ...parsed.data,
      criadoPorId: Number(session.user.id),
    },
    select: { id: true },
  });

  await registrarAcao({
    acao: "REGISTRO_CRIADO",
    entidade: "Registro",
    entidadeId: registro.id,
    resumo: `Registrou saída de ${parsed.data.modeloRadio} #${parsed.data.codigoRadio} para ${parsed.data.nomeResponsavel} (${parsed.data.equipe}) no evento "${evento.nome}"`,
    detalhes: { eventoId, ...parsed.data },
  });

  revalidatePath(`/eventos/${eventoId}`);
  return { ok: true } as const;
}

export async function editarRegistro(registroId: number, input: CriarRegistroInput) {
  const session = await requireUser();
  const isAdmin = session.user.role === "ADMIN";

  const registro = await prisma.registro.findUnique({
    where: { id: registroId },
    include: { evento: true },
  });
  if (!registro) return { error: "Registro não encontrado." } as const;

  if (!isAdmin && registro.evento.dataFim < new Date()) {
    return { error: "Evento já encerrado." } as const;
  }

  const parsed = validarRegistro(input);
  if (!parsed.ok) return { error: parsed.error } as const;

  await prisma.registro.update({
    where: { id: registroId },
    data: parsed.data,
  });

  // Limpa fotos antigas do storage se foram trocadas (não awaitar — fire & forget).
  if (registro.urlFotoRg !== parsed.data.urlFotoRg) {
    deleteFoto(registro.urlFotoRg).catch(() => {});
  }
  if (registro.urlFotoRadioSaida !== parsed.data.urlFotoRadioSaida) {
    deleteFoto(registro.urlFotoRadioSaida).catch(() => {});
  }

  await registrarAcao({
    acao: "REGISTRO_EDITADO",
    entidade: "Registro",
    entidadeId: registroId,
    resumo: `Editou registro ${parsed.data.modeloRadio} #${parsed.data.codigoRadio}`,
    detalhes: {
      antes: {
        modeloRadio: registro.modeloRadio,
        codigoRadio: registro.codigoRadio,
        equipe: registro.equipe,
        nomeResponsavel: registro.nomeResponsavel,
        rgResponsavel: registro.rgResponsavel,
        observacao: registro.observacao,
        urlFotoRg: registro.urlFotoRg,
        urlFotoRadioSaida: registro.urlFotoRadioSaida,
      },
      depois: parsed.data,
    },
  });

  revalidatePath(`/eventos/${registro.eventoId}`);
  return { ok: true } as const;
}

export async function desvincularRegistro(registroId: number) {
  const session = await requireUser();
  const isAdmin = session.user.role === "ADMIN";

  const registro = await prisma.registro.findUnique({
    where: { id: registroId },
    include: { evento: true, devolucao: true },
  });
  if (!registro) return { error: "Registro não encontrado." } as const;
  if (!isAdmin && registro.evento.dataFim < new Date()) {
    return { error: "Evento já encerrado." } as const;
  }

  // Apaga devolução junto se existir (1:1).
  try {
    await prisma.$transaction([
      prisma.devolucao.deleteMany({ where: { registroId } }),
      prisma.registro.delete({ where: { id: registroId } }),
    ]);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return { error: "Registro não encontrado." } as const;
    }
    throw e;
  }

  // Limpa fotos do storage após o delete do DB.
  deleteFoto(registro.urlFotoRg).catch(() => {});
  deleteFoto(registro.urlFotoRadioSaida).catch(() => {});
  if (registro.devolucao) {
    deleteFoto(registro.devolucao.urlFotoRadioDevolucao).catch(() => {});
  }

  await registrarAcao({
    acao: "REGISTRO_DESVINCULADO",
    entidade: "Registro",
    entidadeId: registroId,
    resumo: `Desvinculou ${registro.modeloRadio} #${registro.codigoRadio} de "${registro.evento.nome}"${registro.devolucao ? " (tinha devolução, foi apagada junto)" : ""}`,
    detalhes: {
      eventoId: registro.eventoId,
      eventoNome: registro.evento.nome,
      modeloRadio: registro.modeloRadio,
      codigoRadio: registro.codigoRadio,
      equipe: registro.equipe,
      nomeResponsavel: registro.nomeResponsavel,
      rgResponsavel: registro.rgResponsavel,
      observacao: registro.observacao,
      tinhaDevolucao: !!registro.devolucao,
      devolucao: registro.devolucao
        ? {
            possuiAvaria: registro.devolucao.possuiAvaria,
            devolvidoPor: registro.devolucao.devolvidoPor,
            observacao: registro.devolucao.observacao,
            criadoEm: registro.devolucao.criadoEm,
          }
        : null,
    },
  });

  revalidatePath(`/eventos/${registro.eventoId}`);
  return { ok: true } as const;
}

type CriarDevolucaoInput = {
  possuiAvaria: boolean;
  observacao?: string;
  devolvidoPor?: string;
  urlFotoRadioDevolucao: string;
};

export async function criarDevolucao(registroId: number, input: CriarDevolucaoInput) {
  const session = await requireUser();

  const registro = await prisma.registro.findUnique({
    where: { id: registroId },
    include: { evento: true, devolucao: true },
  });
  if (!registro) return { error: "Registro não encontrado." } as const;
  if (registro.devolucao) return { error: "Esse rádio já foi devolvido." } as const;
  if (registro.evento.dataFim < new Date()) {
    return { error: "Evento já encerrado." } as const;
  }

  const observacao = input.observacao?.trim() || null;
  const devolvidoPor = input.devolvidoPor?.trim() || null;
  const urlFotoRadioDevolucao = input.urlFotoRadioDevolucao.trim();

  if (!urlFotoRadioDevolucao) {
    return { error: "Faça upload da foto do rádio na devolução." } as const;
  }

  const devolucao = await prisma.devolucao.create({
    data: {
      registroId,
      urlFotoRadioDevolucao,
      possuiAvaria: input.possuiAvaria,
      observacao,
      devolvidoPor,
      criadoPorId: Number(session.user.id),
    },
    select: { id: true },
  });

  await registrarAcao({
    acao: "DEVOLUCAO_CRIADA",
    entidade: "Devolucao",
    entidadeId: devolucao.id,
    resumo: `Marcou devolução de ${registro.modeloRadio} #${registro.codigoRadio}${input.possuiAvaria ? " (COM AVARIA)" : ""}`,
    detalhes: {
      registroId,
      eventoId: registro.eventoId,
      possuiAvaria: input.possuiAvaria,
      devolvidoPor,
      observacao,
      urlFotoRadioDevolucao,
    },
  });

  revalidatePath(`/eventos/${registro.eventoId}`);
  return { ok: true } as const;
}

export async function cancelarDevolucao(registroId: number) {
  const session = await requireUser();
  const isAdmin = session.user.role === "ADMIN";

  const registro = await prisma.registro.findUnique({
    where: { id: registroId },
    include: { evento: true, devolucao: true },
  });
  if (!registro) return { error: "Registro não encontrado." } as const;
  if (!registro.devolucao) {
    return { error: "Esse rádio ainda não foi devolvido." } as const;
  }
  if (!isAdmin && registro.evento.dataFim < new Date()) {
    return { error: "Evento já encerrado." } as const;
  }

  const snapshot = {
    registroId,
    eventoId: registro.eventoId,
    eventoNome: registro.evento.nome,
    modeloRadio: registro.modeloRadio,
    codigoRadio: registro.codigoRadio,
    possuiAvaria: registro.devolucao.possuiAvaria,
    devolvidoPor: registro.devolucao.devolvidoPor,
    observacao: registro.devolucao.observacao,
    urlFotoRadioDevolucao: registro.devolucao.urlFotoRadioDevolucao,
    criadoEmDevolucao: registro.devolucao.criadoEm,
  };

  const fotoPath = registro.devolucao.urlFotoRadioDevolucao;
  await prisma.devolucao.delete({ where: { registroId } });
  deleteFoto(fotoPath).catch(() => {});

  await registrarAcao({
    acao: "DEVOLUCAO_CANCELADA",
    entidade: "Devolucao",
    entidadeId: registro.devolucao.id,
    resumo: `Cancelou devolução de ${registro.modeloRadio} #${registro.codigoRadio}${registro.devolucao.possuiAvaria ? " (que estava marcada com AVARIA)" : ""}`,
    detalhes: snapshot,
  });

  revalidatePath(`/eventos/${registro.eventoId}`);
  return { ok: true } as const;
}
