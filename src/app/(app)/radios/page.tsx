import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { fmtData } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BuscaForm,
  Paginacao,
  TAMANHO_PAGINA,
  lerFiltros,
} from "@/components/tabela/busca-paginacao";
import { NovoRadioDialog } from "./novo-radio-dialog";
import { RadioActionsMenu } from "./radio-actions-menu";

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function RadiosPage({ searchParams }: Props) {
  const session = await requireUser();
  const isAdmin = session.user.role === "ADMIN";
  const { q, page, skip } = lerFiltros(await searchParams);

  const busca = { contains: q, mode: "insensitive" as const };
  const where = q
    ? {
        OR: [
          { numeroPatrimonio: busca },
          { numeroSerie: busca },
          { marca: busca },
          { modelo: busca },
          { acessorios: busca },
        ],
      }
    : {};

  const [radios, total] = await Promise.all([
    prisma.radio.findMany({
      where,
      orderBy: { numeroPatrimonio: "asc" },
      take: TAMANHO_PAGINA,
      skip,
      select: {
        id: true,
        numeroPatrimonio: true,
        numeroSerie: true,
        marca: true,
        modelo: true,
        acessorios: true,
        criadoEm: true,
      },
    }),
    prisma.radio.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
        <div className="flex items-baseline gap-4">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Rádios
          </h1>
          <span className="font-mono text-sm font-medium tabular-nums text-muted-foreground">
            {total}
          </span>
        </div>
        <NovoRadioDialog />
      </div>

      <BuscaForm q={q} placeholder="Patrimônio, série, marca, modelo…" />

      {radios.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-16 text-center">
          <div className="font-display text-base font-bold">
            {q ? "Nenhum rádio encontrado" : "Nenhum rádio cadastrado"}
          </div>
          <div className="max-w-xs text-sm text-muted-foreground">
            Cadastre o primeiro rádio do patrimônio pra começar.
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-background">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-bold uppercase tracking-wide">
                    Patrimônio
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wide">
                    Marca / modelo
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wide">
                    Nº série
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wide">
                    Acessórios
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wide">
                    Cadastrado em
                  </TableHead>
                  {isAdmin && (
                    <TableHead className="w-12 text-right">
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {radios.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-sm font-bold uppercase tracking-wider">
                      {r.numeroPatrimonio}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{r.marca}</span>{" "}
                      <span className="text-muted-foreground">{r.modelo}</span>
                    </TableCell>
                    <TableCell className="font-mono tabular-nums text-muted-foreground">
                      {r.numeroSerie}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {r.acessorios || "—"}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {fmtData(r.criadoEm)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <RadioActionsMenu radio={r} isAdmin={isAdmin} />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Paginacao page={page} total={total} q={q} rotulo="rádio" />
    </div>
  );
}
