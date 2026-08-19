"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import type { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { registrarAcao } from "@/lib/audit";
import { SENHA_MIN } from "@/lib/schemas/auth";

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
  if (senha.length < SENHA_MIN) {
    return {
      error: `Senha deve ter pelo menos ${SENHA_MIN} caracteres.`,
    } as const;
  }
  if (!ROLES.includes(input.role)) {
    return { error: "Papel inválido." } as const;
  }

  let novoId: number;
  try {
    const senhaHash = await hash(senha, 10);
    const criado = await prisma.user.create({
      data: { nome, email, senhaHash, role: input.role, cargo },
      select: { id: true },
    });
    novoId = criado.id;
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return { error: "Já existe um usuário com esse email." } as const;
    }
    throw e;
  }

  await registrarAcao({
    acao: "USER_CRIADO",
    entidade: "User",
    entidadeId: novoId,
    resumo: `Criou usuário ${nome} (${email}) como ${input.role === "ADMIN" ? "Administrador" : "Operador"}`,
    detalhes: { nome, email, role: input.role, cargo },
  });

  revalidatePath("/usuarios");
  return { ok: true } as const;
}

type EditarUsuarioInput = {
  nome: string;
  email: string;
  cargo?: string | null;
};

export async function editarUsuario(userId: number, input: EditarUsuarioInput) {
  await requireAdmin();

  const nome = input.nome.trim();
  const email = input.email.trim().toLowerCase();
  const cargo = input.cargo?.trim() || null;

  if (!nome) return { error: "Nome obrigatório." } as const;
  if (!email) return { error: "Email obrigatório." } as const;

  const antes = await prisma.user.findUnique({
    where: { id: userId },
    select: { nome: true, email: true, cargo: true },
  });
  if (!antes) return { error: "Usuário não encontrado." } as const;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { nome, email, cargo },
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

  await registrarAcao({
    acao: "USER_ATUALIZADO",
    entidade: "User",
    entidadeId: userId,
    resumo: `Editou ${nome}`,
    detalhes: { antes, depois: { nome, email, cargo } },
  });

  revalidatePath("/usuarios");
  return { ok: true } as const;
}

export async function resetarSenhaUsuario(userId: number, novaSenha: string) {
  await requireAdmin();

  if (novaSenha.length < SENHA_MIN) {
    return {
      error: `Senha deve ter pelo menos ${SENHA_MIN} caracteres.`,
    } as const;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { nome: true },
  });
  if (!user) return { error: "Usuário não encontrado." } as const;

  const senhaHash = await hash(novaSenha, 10);
  await prisma.user.update({ where: { id: userId }, data: { senhaHash } });

  await registrarAcao({
    acao: "USER_SENHA_RESETADA",
    entidade: "User",
    entidadeId: userId,
    resumo: `Resetou senha de ${user.nome}`,
  });

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

  const antes = await prisma.user.findUnique({
    where: { id: userId },
    select: { nome: true, role: true },
  });
  if (!antes) return { error: "Usuário não encontrado." } as const;

  await prisma.user.update({ where: { id: userId }, data: { role: novaRole } });

  await registrarAcao({
    acao: "USER_ROLE_ALTERADO",
    entidade: "User",
    entidadeId: userId,
    resumo: `${novaRole === "ADMIN" ? "Promoveu" : "Rebaixou"} ${antes.nome}`,
    detalhes: { de: antes.role, para: novaRole },
  });

  revalidatePath("/usuarios");
  return { ok: true } as const;
}

export async function deletarUsuario(userId: number) {
  const session = await requireAdmin();

  if (Number(session.user.id) === userId) {
    return { error: "Você não pode excluir a si mesmo." } as const;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { nome: true, email: true, role: true, cargo: true },
  });
  if (!user) return { error: "Usuário não encontrado." } as const;

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

  await registrarAcao({
    acao: "USER_DELETADO",
    entidade: "User",
    entidadeId: userId,
    resumo: `Excluiu ${user.nome} (${user.email})`,
    detalhes: user,
  });

  revalidatePath("/usuarios");
  return { ok: true } as const;
}

/**
 * Aprova um pedido de acesso: cria o `User` reaproveitando a senha que a
 * própria pessoa escolheu ao pedir, então ela entra sem ninguém combinar
 * senha por fora. Tudo numa transação — pedido marcado e conta criada juntos,
 * ou nada.
 */
export async function aprovarSolicitacao(solicitacaoId: number, role: Role) {
  const session = await requireAdmin();

  if (!ROLES.includes(role)) {
    return { error: "Papel inválido." } as const;
  }

  const pedido = await prisma.solicitacaoAcesso.findUnique({
    where: { id: solicitacaoId },
  });
  if (!pedido) return { error: "Pedido não encontrado." } as const;
  if (pedido.status !== "PENDENTE") {
    return { error: "Esse pedido já foi avaliado." } as const;
  }

  let novoId: number;
  try {
    novoId = await prisma.$transaction(async (tx) => {
      const criado = await tx.user.create({
        data: {
          nome: pedido.nome,
          email: pedido.email,
          senhaHash: pedido.senhaHash,
          cargo: pedido.cargo,
          role,
        },
        select: { id: true },
      });

      await tx.solicitacaoAcesso.update({
        where: { id: solicitacaoId },
        data: {
          status: "APROVADA",
          decididoEm: new Date(),
          decididoPorId: Number(session.user.id),
          decididoPorNome: session.user.name ?? "(sem nome)",
        },
      });

      return criado.id;
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        error: "Já existe um usuário com esse email — o pedido virou duplicado.",
      } as const;
    }
    throw e;
  }

  await registrarAcao({
    acao: "SOLICITACAO_APROVADA",
    entidade: "SolicitacaoAcesso",
    entidadeId: solicitacaoId,
    resumo: `Aprovou acesso de ${pedido.nome} (${pedido.email}) como ${role === "ADMIN" ? "Administrador" : "Operador"}`,
    detalhes: {
      usuarioCriadoId: novoId,
      nome: pedido.nome,
      email: pedido.email,
      cargo: pedido.cargo,
      role,
    },
  });

  revalidatePath("/usuarios");
  return { ok: true } as const;
}

export async function rejeitarSolicitacao(
  solicitacaoId: number,
  motivo?: string,
) {
  const session = await requireAdmin();

  const pedido = await prisma.solicitacaoAcesso.findUnique({
    where: { id: solicitacaoId },
    select: { nome: true, email: true, status: true },
  });
  if (!pedido) return { error: "Pedido não encontrado." } as const;
  if (pedido.status !== "PENDENTE") {
    return { error: "Esse pedido já foi avaliado." } as const;
  }

  const motivoLimpo = motivo?.trim() || null;

  await prisma.solicitacaoAcesso.update({
    where: { id: solicitacaoId },
    data: {
      status: "REJEITADA",
      decididoEm: new Date(),
      decididoPorId: Number(session.user.id),
      decididoPorNome: session.user.name ?? "(sem nome)",
      motivoRecusa: motivoLimpo,
    },
  });

  await registrarAcao({
    acao: "SOLICITACAO_REJEITADA",
    entidade: "SolicitacaoAcesso",
    entidadeId: solicitacaoId,
    resumo: `Recusou acesso de ${pedido.nome} (${pedido.email})`,
    detalhes: {
      nome: pedido.nome,
      email: pedido.email,
      motivoRecusa: motivoLimpo,
    },
  });

  revalidatePath("/usuarios");
  return { ok: true } as const;
}
