import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Freio de força bruta para login e pedido de acesso.
 *
 * Vive no banco, não em memória: a app roda em serverless e um contador em
 * processo não sobrevive entre instâncias nem entre cold starts.
 *
 * Contamos por email **e** por IP. Só por email, quem espalha tentativas por
 * vários endereços passa livre; só por IP, uma rede compartilhada (o wi-fi do
 * evento) puniria todo mundo junto.
 */

const JANELA_MS = 15 * 60 * 1000;
const MAX_FALHAS = 7;

export function chavesDeTentativa(
  email: string,
  ip: string | null,
  escopo: "login" | "solicitacao" = "login",
) {
  // Escopos separados: um pedido de acesso não pode consumir o limite de
  // login do mesmo email, nem o contrário.
  const chaves = [`${escopo}:email:${email.trim().toLowerCase()}`];
  if (ip) chaves.push(`${escopo}:ip:${ip}`);
  return chaves;
}

/** IP do cliente atrás do proxy da Vercel. */
export async function ipDaRequisicao(): Promise<string | null> {
  const h = await headers();
  const encaminhado = h.get("x-forwarded-for");
  // O primeiro da lista é o cliente; o resto são os proxies do caminho.
  return encaminhado?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}

export async function excedeuTentativas(chaves: string[]): Promise<boolean> {
  if (chaves.length === 0) return false;
  const desde = new Date(Date.now() - JANELA_MS);

  const porChave = await prisma.tentativaLogin.groupBy({
    by: ["chave"],
    where: { chave: { in: chaves }, criadoEm: { gte: desde } },
    _count: { _all: true },
  });

  return porChave.some((c) => c._count._all >= MAX_FALHAS);
}

/** Uma tentativa consumida. Serve tanto para falha de login quanto para
 *  pedido de acesso enviado — o que conta é o volume por chave. */
export async function registrarTentativa(chaves: string[]): Promise<void> {
  if (chaves.length === 0) return;
  try {
    await prisma.tentativaLogin.createMany({
      data: chaves.map((chave) => ({ chave })),
    });
    // Faxina oportunista: sem isso a tabela cresce para sempre.
    await prisma.tentativaLogin.deleteMany({
      where: { criadoEm: { lt: new Date(Date.now() - JANELA_MS) } },
    });
  } catch (err) {
    // Falha no registro não pode derrubar o login de quem acertou a senha.
    console.error("[rate-limit] falha ao registrar tentativa:", err);
  }
}

export async function limparTentativas(chaves: string[]): Promise<void> {
  if (chaves.length === 0) return;
  try {
    await prisma.tentativaLogin.deleteMany({
      where: { chave: { in: chaves } },
    });
  } catch (err) {
    console.error("[rate-limit] falha ao limpar tentativas:", err);
  }
}

export const MENSAGEM_BLOQUEIO =
  "Muitas tentativas seguidas. Espere 15 minutos e tente de novo.";
