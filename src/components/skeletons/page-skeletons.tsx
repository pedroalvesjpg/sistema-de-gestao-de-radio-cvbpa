import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Peças de loading compartilhadas pelos `loading.tsx`. A ideia é espelhar o
 * esqueleto real de cada tela (mesmas alturas e colunas) pra não haver salto de
 * layout quando o conteúdo chega — em 4G de evento essa tela fica visível.
 */

/** Cabeçalho `h1 + contador` com a régua inferior que todas as listas usam. */
export function HeaderSkeleton({
  comContador = false,
  comAcao = false,
}: {
  comContador?: boolean;
  comAcao?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
      <div className="flex items-baseline gap-4">
        <Skeleton className="h-9 w-52" />
        {comContador && <Skeleton className="h-4 w-8" />}
      </div>
      {comAcao && <Skeleton className="h-9 w-32" />}
    </div>
  );
}

/** Casca de tabela com cabeçalho e linhas de altura fixa. */
export function TabelaSkeleton({
  colunas,
  linhas = 6,
}: {
  colunas: number;
  linhas?: number;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <div className="flex gap-4 border-b border-border px-4 py-3">
        {Array.from({ length: colunas }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-3", i === 0 ? "w-28" : "w-20", "shrink-0")}
          />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: linhas }).map((_, linha) => (
          <div key={linha} className="flex items-center gap-4 px-4 py-4">
            {Array.from({ length: colunas }).map((_, col) => (
              <Skeleton
                key={col}
                className={cn("h-4", col === 0 ? "w-28" : "w-20", "shrink-0")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Faixa de números (KPIs do dashboard, stats do evento). */
export function StatsSkeleton({
  celulas = 3,
  className,
}: {
  celulas?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 divide-y divide-border overflow-hidden rounded-md border border-border bg-background sm:divide-x sm:divide-y-0",
        celulas === 3 && "sm:grid-cols-3",
        className,
      )}
    >
      {Array.from({ length: celulas }).map((_, i) => (
        <div key={i} className="px-6 py-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-8 w-12" />
        </div>
      ))}
    </div>
  );
}

/** Barra de abas + campo de busca que aparece acima das listas filtráveis. */
export function FiltrosSkeleton({ abas = 3 }: { abas?: number }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex gap-6">
        {Array.from({ length: abas }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      <Skeleton className="h-9 w-full sm:w-64" />
    </div>
  );
}

/** Linhas de formulário: rótulo curto + campo. */
export function FormSkeleton({ campos = 3 }: { campos?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: campos }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-40" />
    </div>
  );
}
