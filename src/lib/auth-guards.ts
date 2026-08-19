import { forbidden, redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

// Sem sessão é redirect pro login; com sessão mas sem papel é 403 via
// `forbidden()`. O redirect silencioso pra "/" que havia antes escondia o
// motivo e parecia bug. Renderiza src/app/(app)/forbidden.tsx — depende da
// flag `experimental.authInterrupts` no next.config.ts.
export async function requireAdmin() {
  const session = await requireUser();
  if (session.user.role !== "ADMIN") forbidden();
  return session;
}
