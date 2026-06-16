"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { registrarAcao } from "@/lib/audit";
import type { RadioValues } from "@/lib/schemas/radio";

function sanitize(input: RadioValues) {
  return {
    numeroPatrimonio: input.numeroPatrimonio.trim(),
    numeroSerie: input.numeroSerie.trim(),
    marca: input.marca.trim(),
    modelo: input.modelo.trim(),
    acessorios: input.acessorios?.trim() || null,
  };
}

export async function criarRadio(input: RadioValues) {
  const session = await requireUser();
  const data = sanitize(input);

  if (!data.numeroPatrimonio) return { error: "Número do patrimônio obrigatório." } as const;
  if (!data.numeroSerie) return { error: "Número de série obrigatório." } as const;
  if (!data.marca) return { error: "Marca obrigatória." } as const;
  if (!data.modelo) return { error: "Modelo obrigatório." } as const;

  let novoId: number;
  try {
    const criado = await prisma.radio.create({
      data: { ...data, criadoPorId: Number(session.user.id) },
      select: { id: true },
    });
    novoId = criado.id;
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        error: `Já existe um rádio com o patrimônio "${data.numeroPatrimonio}".`,
      } as const;
    }
    throw e;
  }

  await registrarAcao({
    acao: "RADIO_CRIADO",
    entidade: "Radio",
    entidadeId: novoId,
    resumo: `Cadastrou rádio ${data.numeroPatrimonio} (${data.marca} ${data.modelo})`,
    detalhes: data,
  });

  revalidatePath("/radios");
  return { ok: true } as const;
}

export async function editarRadio(radioId: number, input: RadioValues) {
  await requireUser();
  const data = sanitize(input);

  if (!data.numeroPatrimonio) return { error: "Número do patrimônio obrigatório." } as const;
  if (!data.numeroSerie) return { error: "Número de série obrigatório." } as const;
  if (!data.marca) return { error: "Marca obrigatória." } as const;
  if (!data.modelo) return { error: "Modelo obrigatório." } as const;

  const antes = await prisma.radio.findUnique({
    where: { id: radioId },
    select: {
      numeroPatrimonio: true,
      numeroSerie: true,
      marca: true,
      modelo: true,
      acessorios: true,
    },
  });
  if (!antes) return { error: "Rádio não encontrado." } as const;

  try {
    await prisma.radio.update({ where: { id: radioId }, data });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        error: `Já existe um rádio com o patrimônio "${data.numeroPatrimonio}".`,
      } as const;
    }
    throw e;
  }

  await registrarAcao({
    acao: "RADIO_ATUALIZADO",
    entidade: "Radio",
    entidadeId: radioId,
    resumo: `Editou rádio ${data.numeroPatrimonio}`,
    detalhes: { antes, depois: data },
  });

  revalidatePath("/radios");
  return { ok: true } as const;
}

export async function deletarRadio(radioId: number) {
  await requireUser();

  const radio = await prisma.radio.findUnique({
    where: { id: radioId },
    select: { numeroPatrimonio: true, marca: true, modelo: true },
  });
  if (!radio) return { error: "Rádio não encontrado." } as const;

  try {
    await prisma.radio.delete({ where: { id: radioId } });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2003"
    ) {
      return {
        error:
          "Esse rádio já foi usado em algum registro — não pode ser excluído sem perder o histórico.",
      } as const;
    }
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return { error: "Rádio não encontrado." } as const;
    }
    throw e;
  }

  await registrarAcao({
    acao: "RADIO_DELETADO",
    entidade: "Radio",
    entidadeId: radioId,
    resumo: `Excluiu rádio ${radio.numeroPatrimonio} (${radio.marca} ${radio.modelo})`,
    detalhes: radio,
  });

  revalidatePath("/radios");
  return { ok: true } as const;
}
