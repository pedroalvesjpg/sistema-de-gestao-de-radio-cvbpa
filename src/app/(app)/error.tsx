"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Erros dentro das páginas do app. Não cobre o `(app)/layout.tsx` acima dele —
 * esse é pego por `src/app/error.tsx`.
 *
 * A causa de longe mais provável em campo é rede: 4G ruim no meio do evento ou
 * o pooler do Supabase indisponível. Por isso o texto fala em tentar de novo em
 * vez de sugerir que a pessoa fez algo errado.
 */
export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[app] erro não tratado:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-border py-20 text-center">
      <TriangleAlert className="size-8 text-muted-foreground" aria-hidden />
      <h1 className="font-display text-2xl font-extrabold tracking-tight">
        Algo deu errado ao carregar
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Quase sempre é a conexão. Tente de novo — nenhum registro foi perdido, e
        o que já estava salvo continua salvo.
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
    </div>
  );
}
