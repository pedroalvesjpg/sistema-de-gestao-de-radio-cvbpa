"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

type Input = {
  email: string;
  password: string;
  callbackUrl?: string;
};

export async function loginAction({ email, password, callbackUrl }: Input) {
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
