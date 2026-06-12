"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import type { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";

const ROLES: readonly Role[] = ["ADMIN", "COMUM"];

type CriarUsuarioInput = {
  nome: string;
  email: string;
  senha: string;
  role: Role;
  cargo?: string | null;
};

export async function criarUsuario(input: CriarUsuarioInput) {
  await requireAdmin();

  const nome = input.nome.trim();
  const email = input.email.trim().toLowerCase();
  const senha = input.senha;
  const cargo = input.cargo?.trim() || null;

  if (!nome) return { error: "Nome obrigatório." } as const;
  if (!email) return { error: "Email obrigatório." } as const;
  if (senha.length < 6) {
    return { error: "Senha deve ter pelo menos 6 caracteres." } as const;
  }
  if (!ROLES.includes(input.role)) {
    return { error: "Papel inválido." } as const;
  }

  try {
    const senhaHash = await hash(senha, 10);
    await prisma.user.create({
      data: { nome, email, senhaHash, role: input.role, cargo },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return { error: "Já existe um usuário com esse email." } as const;
    }
    throw e;
  }

  revalidatePath("/usuarios");
  return { ok: true } as const;
}

export async function alterarRole(userId: number, novaRole: Role) {
  const session = await requireAdmin();

  if (!ROLES.includes(novaRole)) {
    return { error: "Papel inválido." } as const;
  }
  if (Number(session.user.id) === userId && novaRole !== "ADMIN") {
    return { error: "Você não pode rebaixar a si mesmo." } as const;
  }

  await prisma.user.update({ where: { id: userId }, data: { role: novaRole } });
  revalidatePath("/usuarios");
  return { ok: true } as const;
}

export async function deletarUsuario(userId: number) {
  const session = await requireAdmin();

  if (Number(session.user.id) === userId) {
    return { error: "Você não pode excluir a si mesmo." } as const;
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2003"
    ) {
      return {
        error:
          "Esse usuário tem eventos ou registros vinculados. Rebaixe para Operador em vez de excluir, pra preservar o histórico.",
      } as const;
    }
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return { error: "Usuário não encontrado." } as const;
    }
    throw e;
  }

  revalidatePath("/usuarios");
  return { ok: true } as const;
}
