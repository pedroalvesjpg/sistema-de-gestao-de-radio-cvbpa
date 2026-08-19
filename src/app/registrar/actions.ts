"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  MENSAGEM_BLOQUEIO,
  chavesDeTentativa,
  excedeuTentativas,
  ipDaRequisicao,
  registrarTentativa,
} from "@/lib/rate-limit";
import { SENHA_MIN } from "@/lib/schemas/auth";
import type { SolicitacaoValues } from "@/lib/schemas/solicitacao";

export async function solicitarAcesso(input: SolicitacaoValues) {
  // Endpoint público e que escreve no banco: entra no mesmo freio do login.
  const ip = await ipDaRequisicao();
  const chaves = chavesDeTentativa(input.email, ip, "solicitacao");
  if (await excedeuTentativas(chaves)) {
    return { error: MENSAGEM_BLOQUEIO } as const;
  }

  const nome = input.nome.trim();
  const email = input.email.trim().toLowerCase();
  const cargo = input.cargo.trim() || null;
  const justificativa = input.justificativa?.trim() || null;

  if (!nome) return { error: "Informe seu nome completo." } as const;
  if (!email) return { error: "Informe seu email." } as const;
  if (input.senha.length < SENHA_MIN) {
    return {
      error: `A senha deve ter pelo menos ${SENHA_MIN} caracteres.`,
    } as const;
  }
  if (input.senha !== input.confirmar) {
    return { error: "As senhas não coincidem." } as const;
  }

  const [jaTemConta, pedidoPendente] = await Promise.all([
    prisma.user.count({ where: { email } }),
    prisma.solicitacaoAcesso.count({ where: { email, status: "PENDENTE" } }),
  ]);

  // Ser claro aqui revela que o email tem conta. Numa ferramenta interna de
  // uma equipe pequena isso é aceitável: o custo de deixar a pessoa no escuro,
  // reenviando pedido que nunca chega, é maior que o risco de enumeração.
  if (jaTemConta > 0) {
    return {
      error:
        "Já existe uma conta com esse email. Tente entrar, ou peça à coordenação para redefinir sua senha.",
    } as const;
  }
  if (pedidoPendente > 0) {
    return {
      error: "Você já tem um pedido aguardando avaliação da coordenação.",
    } as const;
  }

  const senhaHash = await hash(input.senha, 10);
  await prisma.solicitacaoAcesso.create({
    data: { nome, email, senhaHash, cargo, justificativa },
  });

  // Conta como tentativa: sem isso o freio não alcança quem despeja pedidos.
  await registrarTentativa(chaves);

  return { ok: true } as const;
}
