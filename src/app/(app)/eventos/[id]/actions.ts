"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { registrarAcao } from "@/lib/audit";
import { deleteFoto } from "@/lib/storage";

type CriarRegistroInput = {
  radioId: number;
  recebedorId: number;
  observacao?: string;
  urlFotoRg: string;
  urlFotoRadioSaida: string;
};

export async function criarRegistro(
  eventoId: number,
  input: CriarRegistroInput,
) {
  const session = await requireUser();

  const evento = await prisma.evento.findUnique({ where: { id: eventoId } });
  if (!evento) return { error: "Evento não encontrado." } as const;
  if (evento.dataFim < new Date()) {
    return {
      error: "Evento já encerrado — não é possível registrar saída.",
    } as const;
  }

  const urlFotoRg = input.urlFotoRg.trim();
  const urlFotoRadioSaida = input.urlFotoRadioSaida.trim();
  const observacao = input.observacao?.trim() || null;

  if (!urlFotoRg || !urlFotoRadioSaida) {
    return { error: "Faça upload da foto do RG e do rádio." } as const;
  }

  const [radio, recebedor] = await Promise.all([
    prisma.radio.findUnique({
      where: { id: input.radioId },
      select: { id: true, numeroPatrimonio: true, marca: true, modelo: true },
    }),
    prisma.recebedor.findUnique({
      where: { id: input.recebedorId },
      select: { id: true, nome: true, departamento: true },
    }),
  ]);
  if (!radio) return { error: "Rádio não encontrado." } as const;
  if (!recebedor) return { error: "Recebedor não encontrado." } as const;

  // Rádio só pode estar em um registro sem devolução por vez.
  const emUso = await prisma.registro.findFirst({
    where: { radioId: radio.id, devolucao: { is: null } },
    select: { evento: { select: { nome: true } } },
  });
  if (emUso) {
    return {
      error: `Esse rádio ainda está em campo no evento "${emUso.evento.nome}".`,
    } as const;
  }

  const registro = await prisma.registro.create({
    data: {
      eventoId,
      radioId: radio.id,
      recebedorId: recebedor.id,
      urlFotoRg,
      urlFotoRadioSaida,
      observacao,
      criadoPorId: Number(session.user.id),
    },
    select: { id: true },
  });

  await registrarAcao({
    acao: "REGISTRO_CRIADO",
    entidade: "Registro",
    entidadeId: registro.id,
    resumo: `Registrou saída de ${radio.numeroPatrimonio} (${radio.marca} ${radio.modelo}) para ${recebedor.nome} (${recebedor.departamento}) no evento "${evento.nome}"`,
    detalhes: {
      eventoId,
      radioId: radio.id,
      recebedorId: recebedor.id,
      observacao,
      urlFotoRg,
      urlFotoRadioSaida,
    },
  });

  revalidatePath(`/eventos/${eventoId}`);
  return { ok: true } as const;
}

export async function desvincularRegistro(registroId: number) {
  const session = await requireUser();
  const isAdmin = session.user.role === "ADMIN";

  const registro = await prisma.registro.findUnique({
    where: { id: registroId },
    include: {
      evento: true,
      devolucao: true,
      radio: { select: { numeroPatrimonio: true } },
      recebedor: { select: { nome: true } },
    },
  });
  if (!registro) return { error: "Registro não encontrado." } as const;
  if (!isAdmin && registro.evento.dataFim < new Date()) {
    return { error: "Evento já encerrado." } as const;
  }

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

  deleteFoto(registro.urlFotoRg).catch(() => {});
  deleteFoto(registro.urlFotoRadioSaida).catch(() => {});
  if (registro.devolucao) {
    deleteFoto(registro.devolucao.urlFotoRadioDevolucao).catch(() => {});
  }

  await registrarAcao({
    acao: "REGISTRO_DESVINCULADO",
    entidade: "Registro",
    entidadeId: registroId,
    resumo: `Desvinculou ${registro.radio.numeroPatrimonio} (${registro.recebedor.nome}) de "${registro.evento.nome}"${registro.devolucao ? " (tinha devolução, foi apagada junto)" : ""}`,
    detalhes: {
      eventoId: registro.eventoId,
      eventoNome: registro.evento.nome,
      radioId: registro.radioId,
      recebedorId: registro.recebedorId,
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

export async function criarDevolucao(
  registroId: number,
  input: CriarDevolucaoInput,
) {
  const session = await requireUser();

  const registro = await prisma.registro.findUnique({
    where: { id: registroId },
    include: {
      evento: true,
      devolucao: true,
      radio: { select: { numeroPatrimonio: true } },
    },
  });
  if (!registro) return { error: "Registro não encontrado." } as const;
  if (registro.devolucao) {
    return { error: "Esse rádio já foi devolvido." } as const;
  }
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
    resumo: `Marcou devolução de ${registro.radio.numeroPatrimonio}${input.possuiAvaria ? " (COM AVARIA)" : ""}`,
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
    include: {
      evento: true,
      devolucao: true,
      radio: { select: { numeroPatrimonio: true } },
    },
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
    radioPatrimonio: registro.radio.numeroPatrimonio,
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
    resumo: `Cancelou devolução de ${registro.radio.numeroPatrimonio}${registro.devolucao.possuiAvaria ? " (que estava marcada com AVARIA)" : ""}`,
    detalhes: snapshot,
  });

  revalidatePath(`/eventos/${registro.eventoId}`);
  return { ok: true } as const;
}
