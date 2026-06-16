"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { registrarAcao } from "@/lib/audit";
import type { RecebedorValues } from "@/lib/schemas/recebedor";

function sanitize(input: RecebedorValues) {
  return {
    nome: input.nome.trim(),
    rg: input.rg.trim(),
    departamento: input.departamento.trim(),
    cargo: input.cargo.trim(),
    foneContato: input.foneContato.trim(),
  };
}

function validar(data: ReturnType<typeof sanitize>) {
  if (!data.nome) return "Nome obrigatório.";
  if (!data.rg) return "RG obrigatório.";
  if (!data.departamento) return "Departamento obrigatório.";
  if (!data.cargo) return "Cargo obrigatório.";
  if (!data.foneContato) return "Telefone obrigatório.";
  return null;
}

export async function criarRecebedor(input: RecebedorValues) {
  const session = await requireUser();
  const data = sanitize(input);

  const erro = validar(data);
  if (erro) return { error: erro } as const;

  const criado = await prisma.recebedor.create({
    data: { ...data, criadoPorId: Number(session.user.id) },
    select: { id: true },
  });

  await registrarAcao({
    acao: "RECEBEDOR_CRIADO",
    entidade: "Recebedor",
    entidadeId: criado.id,
    resumo: `Cadastrou recebedor ${data.nome} (${data.departamento})`,
    detalhes: data,
  });

  revalidatePath("/recebedores");
  return { ok: true, id: criado.id } as const;
}

export async function editarRecebedor(
  recebedorId: number,
  input: RecebedorValues,
) {
  await requireUser();
  const data = sanitize(input);

  const erro = validar(data);
  if (erro) return { error: erro } as const;

  const antes = await prisma.recebedor.findUnique({
    where: { id: recebedorId },
    select: {
      nome: true,
      rg: true,
      departamento: true,
      cargo: true,
      foneContato: true,
    },
  });
  if (!antes) return { error: "Recebedor não encontrado." } as const;

  await prisma.recebedor.update({ where: { id: recebedorId }, data });

  await registrarAcao({
    acao: "RECEBEDOR_ATUALIZADO",
    entidade: "Recebedor",
    entidadeId: recebedorId,
    resumo: `Editou recebedor ${data.nome}`,
    detalhes: { antes, depois: data },
  });

  revalidatePath("/recebedores");
  return { ok: true } as const;
}

export async function deletarRecebedor(recebedorId: number) {
  await requireUser();

  const recebedor = await prisma.recebedor.findUnique({
    where: { id: recebedorId },
    select: { nome: true, departamento: true },
  });
  if (!recebedor) return { error: "Recebedor não encontrado." } as const;

  try {
    await prisma.recebedor.delete({ where: { id: recebedorId } });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2003"
    ) {
      return {
        error:
          "Esse recebedor já foi usado em algum registro — não pode ser excluído sem perder o histórico.",
      } as const;
    }
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return { error: "Recebedor não encontrado." } as const;
    }
    throw e;
  }

  await registrarAcao({
    acao: "RECEBEDOR_DELETADO",
    entidade: "Recebedor",
    entidadeId: recebedorId,
    resumo: `Excluiu recebedor ${recebedor.nome} (${recebedor.departamento})`,
    detalhes: recebedor,
  });

  revalidatePath("/recebedores");
  return { ok: true } as const;
}
