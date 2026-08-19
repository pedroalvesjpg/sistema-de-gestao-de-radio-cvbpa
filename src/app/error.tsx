"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

/**
 * Rede de segurança acima do grupo `(app)`. Existe porque um `error.tsx` não
 * cobre o layout do próprio segmento, e o `(app)/layout.tsx` faz trabalho que
 * pode falhar: revalida a sessão no banco, busca o usuário e assina a URL da
 * foto no Supabase. Sem esta camada, essas falhas cairiam no `global-error`,
 * que renderiza sem os estilos do app.
 */
export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[root] erro não tratado:", error);
  }, [error]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-5 bg-background px-6 py-16 text-center">
      <Logo variant="mark" className="h-12 w-12" />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        O RADCOM não conseguiu carregar
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Pode ser a conexão ou uma instabilidade momentânea do servidor. Tente de
        novo em alguns segundos.
      </p>
      <Button onClick={() => retry()} className="mt-2">
        <RotateCcw />
        Tentar de novo
      </Button>
      {error.digest && (
        <p className="pt-2 font-mono text-xs text-muted-foreground/70">
          Código do erro: {error.digest}
        </p>
      )}
    </main>
  );
}
