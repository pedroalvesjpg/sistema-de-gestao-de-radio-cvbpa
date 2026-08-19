"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import {
  MENSAGEM_BLOQUEIO,
  chavesDeTentativa,
  excedeuTentativas,
  ipDaRequisicao,
} from "@/lib/rate-limit";

type Input = {
  email: string;
  password: string;
  callbackUrl?: string;
};

export async function loginAction({ email, password, callbackUrl }: Input) {
  // Quem passa pela tela merece saber que está bloqueado, e não levar
  // "senha inválida" e continuar tentando. O `authorize` também barra — lá é
  // a trava de verdade, aqui é a mensagem honesta.
  const chaves = chavesDeTentativa(email, await ipDaRequisicao());
  if (await excedeuTentativas(chaves)) {
    return { error: MENSAGEM_BLOQUEIO } as const;
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email ou senha inválidos." } as const;
    }
    throw error;
  }
}
