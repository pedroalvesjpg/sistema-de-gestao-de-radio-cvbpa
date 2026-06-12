"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";

type CriarRegistroInput = {
  modeloRadio: string;
  codigoRadio: string;
  equipe: string;
  nomeResponsavel: string;
  rgResponsavel: string;
  observacao?: string;
};

type ParsedRegistro =
  | { ok: true; data: {
      modeloRadio: string;
      codigoRadio: string;
      equipe: string;
      nomeResponsavel: string;
      rgResponsavel: string;
      observacao: string | null;
    } }
  | { ok: false; error: string };

function validarRegistro(input: CriarRegistroInput): ParsedRegistro {
  const modeloRadio = input.modeloRadio.trim();
  const codigoRadio = input.codigoRadio.trim();
  const equipe = input.equipe.trim();
  const nomeResponsavel = input.nomeResponsavel.trim();
  const rgResponsavel = input.rgResponsavel.trim();
  const observacao = input.observacao?.trim() || null;

  if (!modeloRadio || !codigoRadio || !equipe || !nomeResponsavel || !rgResponsavel) {
    return { ok: false, error: "Preencha modelo, código, equipe, nome e RG." };
  }
  return {
    ok: true,
    data: { modeloRadio, codigoRadio, equipe, nomeResponsavel, rgResponsavel, observacao },
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

  await prisma.registro.create({
    data: {
      eventoId,
      ...parsed.data,
      // TODO: upload real pro Supabase Storage; por enquanto placeholder.
      urlFotoRg: "placeholder://rg",
      urlFotoRadioSaida: "placeholder://radio-saida",
      criadoPorId: Number(session.user.id),
    },
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

  revalidatePath(`/eventos/${registro.eventoId}`);
  return { ok: true } as const;
}

export async function desvincularRegistro(registroId: number) {
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

  revalidatePath(`/eventos/${registro.eventoId}`);
  return { ok: true } as const;
}

type CriarDevolucaoInput = {
  possuiAvaria: boolean;
  observacao?: string;
  devolvidoPor?: string;
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

  await prisma.devolucao.create({
    data: {
      registroId,
      // TODO: upload real pro Supabase Storage; por enquanto placeholder.
      urlFotoRadioDevolucao: "placeholder://radio-devolucao",
      possuiAvaria: input.possuiAvaria,
      observacao: input.observacao?.trim() || null,
      devolvidoPor: input.devolvidoPor?.trim() || null,
      criadoPorId: Number(session.user.id),
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

  await prisma.devolucao.delete({ where: { registroId } });

  revalidatePath(`/eventos/${registro.eventoId}`);
  return { ok: true } as const;
}
