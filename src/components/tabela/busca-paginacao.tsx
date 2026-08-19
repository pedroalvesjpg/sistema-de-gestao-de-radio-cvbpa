import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Busca e paginação em Server Component, no mesmo padrão da auditoria: o
 * estado mora na URL, então a página é linkável e não precisa de JS para
 * filtrar. As listas de cadastro cresciam sem nenhum dos dois — achar um rádio
 * entre dezenas era rolar a tabela inteira.
 */

export const TAMANHO_PAGINA = 20;

/** Lê `q` e `page` dos searchParams, já normalizados. */
export function lerFiltros(sp: { q?: string; page?: string }) {
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  return { q, page, skip: (page - 1) * TAMANHO_PAGINA };
}

export function BuscaForm({
  placeholder,
  q,
}: {
  placeholder: string;
  q: string;
}) {
  return (
    <form className="flex gap-2 sm:max-w-md">
      {/* Voltar para a página 1: filtrar e continuar na página 4 costuma
          cair num vazio e parecer que a busca não achou nada. */}
      <input type="hidden" name="page" value="1" />
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          name="q"
          defaultValue={q}
          placeholder={placeholder}
          aria-label={placeholder}
          className="pl-9"
        />
      </div>
      <Button type="submit" variant="outline">
        Buscar
      </Button>
      {q && (
        <Button
          type="button"
          variant="ghost"
          render={<Link href="?" />}
          nativeButton={false}
        >
          Limpar
        </Button>
      )}
    </form>
  );
}

export function Paginacao({
  page,
  total,
  q,
  rotulo,
}: {
  page: number;
  total: number;
  q: string;
  /** Singular do que está sendo contado: "rádio", "recebedor", "usuário". */
  rotulo: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / TAMANHO_PAGINA));
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
        Página {page} de {totalPages} · {total}{" "}
        {total === 1 ? rotulo : `${rotulo}s`}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          render={page > 1 ? <Link href={href(page - 1)} /> : undefined}
          nativeButton={page <= 1}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          render={
            page < totalPages ? <Link href={href(page + 1)} /> : undefined
          }
          nativeButton={page >= totalPages}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
