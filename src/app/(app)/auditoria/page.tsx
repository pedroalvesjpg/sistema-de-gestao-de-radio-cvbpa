import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { fmtDataHora } from "@/lib/format";
import { RotuloAcao, type AcaoAudit } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 25;

const ENTIDADES = ["", "User", "Evento", "Registro", "Devolucao"] as const;
const ACOES = Object.keys(RotuloAcao) as AcaoAudit[];

type Props = {
  searchParams: Promise<{
    ator?: string;
    acao?: string;
    entidade?: string;
    page?: string;
  }>;
};

export default async function AuditoriaPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const ator = (sp.ator ?? "").trim();
  const acao = (sp.acao ?? "").trim();
  const entidade = (sp.entidade ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const where = {
    AND: [
      ator
        ? { actorNome: { contains: ator, mode: "insensitive" as const } }
        : {},
      acao ? { acao } : {},
      entidade ? { entidade } : {},
    ],
  };

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = !!(ator || acao || entidade);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-4 border-b border-border pb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Auditoria
        </h1>
        <span className="font-mono text-sm font-medium tabular-nums text-muted-foreground">
          {total}
        </span>
      </div>

      <form className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <Input
          name="ator"
          defaultValue={ator}
          placeholder="Buscar por nome do ator…"
        />
        <select
          name="acao"
          defaultValue={acao}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Toda ação</option>
          {ACOES.map((a) => (
            <option key={a} value={a}>
              {RotuloAcao[a]}
            </option>
          ))}
        </select>
        <select
          name="entidade"
          defaultValue={entidade}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {ENTIDADES.map((e) => (
            <option key={e} value={e}>
              {e || "Toda entidade"}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button type="submit">Filtrar</Button>
          {hasFilters && (
            <Button
              type="button"
              variant="outline"
              render={<Link href="/auditoria" />}
              nativeButton={false}
            >
              Limpar
            </Button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-md border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44 text-xs font-bold uppercase tracking-wide">
                Data / hora
              </TableHead>
              <TableHead className="w-40 text-xs font-bold uppercase tracking-wide">
                Ator
              </TableHead>
              <TableHead className="w-52 text-xs font-bold uppercase tracking-wide">
                Ação
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wide">
                Resumo
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum log encontrado com esses filtros.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="align-top">
                  <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                    {fmtDataHora(log.criadoEm)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="font-semibold">{log.actorNome}</div>
                    {!log.actorId && (
                      <div className="text-xs text-muted-foreground">
                        (conta excluída)
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {RotuloAcao[log.acao as AcaoAudit] ?? log.acao}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{log.resumo}</div>
                    {log.detalhes && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
                          Detalhes
                        </summary>
                        <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                          {JSON.stringify(log.detalhes, null, 2)}
                        </pre>
                      </details>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Página {page} de {totalPages} · {total}{" "}
            {total === 1 ? "registro" : "registros"}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              render={
                page > 1 ? (
                  <Link
                    href={buildHref({ ator, acao, entidade, page: page - 1 })}
                  />
                ) : undefined
              }
              nativeButton={page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              render={
                page < totalPages ? (
                  <Link
                    href={buildHref({ ator, acao, entidade, page: page + 1 })}
                  />
                ) : undefined
              }
              nativeButton={page >= totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function buildHref(params: {
  ator?: string;
  acao?: string;
  entidade?: string;
  page?: number;
}) {
  const sp = new URLSearchParams();
  if (params.ator) sp.set("ator", params.ator);
  if (params.acao) sp.set("acao", params.acao);
  if (params.entidade) sp.set("entidade", params.entidade);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `/auditoria?${qs}` : "/auditoria";
}
