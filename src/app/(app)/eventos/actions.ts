"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { registrarAcao } from "@/lib/audit";

type EventoInput = {
  nome: string;
  dataInicio: string;
  dataFim: string;
};

type ParseResult =
  | { ok: true; nome: string; dataInicio: Date; dataFim: Date }
  | { ok: false; error: string };

function validarInput(input: EventoInput): ParseResult {
  const nome = input.nome.trim();
  if (!nome) return { ok: false, error: "Informe o nome do evento." };

  const dataInicio = new Date(input.dataInicio);
  const dataFim = new Date(input.dataFim);
  if (Number.isNaN(dataInicio.getTime()) || Number.isNaN(dataFim.getTime())) {
    return { ok: false, error: "Datas inválidas." };
  }
  if (dataFim < dataInicio) {
    return { ok: false, error: "Data de fim não pode ser antes da data de início." };
  }
  return { ok: true, nome, dataInicio, dataFim };
}

export async function criarEvento(input: EventoInput) {
  const session = await requireAdmin();
  const parsed = validarInput(input);
  if (!parsed.ok) return { error: parsed.error } as const;

  const evento = await prisma.evento.create({
    data: {
      nome: parsed.nome,
      dataInicio: parsed.dataInicio,
      dataFim: parsed.dataFim,
      criadoPorId: Number(session.user.id),
    },
  });

  await registrarAcao({
    acao: "EVENTO_CRIADO",
    entidade: "Evento",
    entidadeId: evento.id,
    resumo: `Criou evento "${parsed.nome}"`,
    detalhes: { nome: parsed.nome, dataInicio: parsed.dataInicio, dataFim: parsed.dataFim },
  });

  revalidatePath("/");
  return { ok: true, eventoId: evento.id } as const;
}

export async function editarEvento(eventoId: number, input: EventoInput) {
  await requireAdmin();
  const parsed = validarInput(input);
  if (!parsed.ok) return { error: parsed.error } as const;

  const antes = await prisma.evento.findUnique({
    where: { id: eventoId },
    select: { nome: true, dataInicio: true, dataFim: true },
  });
  if (!antes) return { error: "Evento não encontrado." } as const;

  try {
    await prisma.evento.update({
      where: { id: eventoId },
      data: {
        nome: parsed.nome,
        dataInicio: parsed.dataInicio,
        dataFim: parsed.dataFim,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return { error: "Evento não encontrado." } as const;
    }
    throw e;
  }

  await registrarAcao({
    acao: "EVENTO_ATUALIZADO",
    entidade: "Evento",
    entidadeId: eventoId,
    resumo: `Editou evento "${parsed.nome}"`,
    detalhes: { antes, depois: { nome: parsed.nome, dataInicio: parsed.dataInicio, dataFim: parsed.dataFim } },
  });

  revalidatePath("/");
  revalidatePath(`/eventos/${eventoId}`);
  return { ok: true } as const;
}

export async function deletarEvento(eventoId: number) {
  await requireAdmin();

  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    select: { nome: true, dataInicio: true, dataFim: true },
  });
  if (!evento) return { error: "Evento não encontrado." } as const;

  try {
    await prisma.evento.delete({ where: { id: eventoId } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2003") {
        return {
          error:
            "Esse evento tem rádios registrados. Desvincule os registros antes de excluir.",
        } as const;
      }
      if (e.code === "P2025") {
        return { error: "Evento não encontrado." } as const;
      }
    }
    throw e;
  }

  await registrarAcao({
    acao: "EVENTO_DELETADO",
    entidade: "Evento",
    entidadeId: eventoId,
    resumo: `Excluiu evento "${evento.nome}"`,
    detalhes: evento,
  });

  revalidatePath("/");
  return { ok: true } as const;
}
