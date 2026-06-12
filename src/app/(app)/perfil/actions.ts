"use server";

import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { registrarAcao } from "@/lib/audit";

type TrocarSenhaInput = {
  senhaAtual: string;
  novaSenha: string;
};

export async function trocarPropriaSenha(input: TrocarSenhaInput) {
  const session = await requireUser();
  const userId = Number(session.user.id);

  if (input.novaSenha.length < 6) {
    return { error: "A nova senha deve ter pelo menos 6 caracteres." } as const;
  }
  if (input.novaSenha === input.senhaAtual) {
    return { error: "A nova senha precisa ser diferente da atual." } as const;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { senhaHash: true, nome: true },
  });
  if (!user) return { error: "Sessão inválida." } as const;

  const okAtual = await compare(input.senhaAtual, user.senhaHash);
  if (!okAtual) {
    return { error: "Senha atual incorreta." } as const;
  }

  const senhaHash = await hash(input.novaSenha, 10);
  await prisma.user.update({ where: { id: userId }, data: { senhaHash } });

  await registrarAcao({
    acao: "USER_PROPRIA_SENHA_TROCADA",
    entidade: "User",
    entidadeId: userId,
    resumo: `${user.nome} trocou a própria senha`,
  });

  return { ok: true } as const;
}
