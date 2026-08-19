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
import { NovoRecebedorDialog } from "./novo-recebedor-dialog";
import { RecebedorActionsMenu } from "./recebedor-actions-menu";

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function RecebedoresPage({ searchParams }: Props) {
  const session = await requireUser();
  const isAdmin = session.user.role === "ADMIN";
  const { q, page, skip } = lerFiltros(await searchParams);

  const busca = { contains: q, mode: "insensitive" as const };
  const where = q
    ? {
        OR: [
          { nome: busca },
          { rg: busca },
          { departamento: busca },
          { cargo: busca },
          { foneContato: busca },
        ],
      }
    : {};

  const [recebedores, total] = await Promise.all([
    prisma.recebedor.findMany({
      where,
      orderBy: { nome: "asc" },
      take: TAMANHO_PAGINA,
      skip,
      select: {
        id: true,
        nome: true,
        rg: true,
        departamento: true,
        cargo: true,
        foneContato: true,
        criadoEm: true,
      },
    }),
    prisma.recebedor.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
        <div className="flex items-baseline gap-4">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Recebedores
          </h1>
          <span className="font-mono text-sm font-medium tabular-nums text-muted-foreground">
            {total}
          </span>
        </div>
        <NovoRecebedorDialog />
      </div>

      <BuscaForm q={q} placeholder="Nome, RG, departamento, telefone…" />

      {recebedores.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-16 text-center">
          <div className="font-display text-base font-bold">
            {q ? "Nenhum recebedor encontrado" : "Nenhum recebedor cadastrado"}
          </div>
          <div className="max-w-xs text-sm text-muted-foreground">
            Cadastre o primeiro recebedor pra começar a registrar saídas.
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-background">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-bold uppercase tracking-wide">
                    Nome
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wide">
                    RG
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wide">
                    Departamento
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wide">
                    Cargo
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wide">
                    Telefone
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
                {recebedores.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-semibold">{r.nome}</TableCell>
                    <TableCell className="font-mono tabular-nums text-muted-foreground">
                      {r.rg}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.departamento}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.cargo}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums text-muted-foreground">
                      {r.foneContato}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {fmtData(r.criadoEm)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <RecebedorActionsMenu recebedor={r} isAdmin={isAdmin} />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Paginacao page={page} total={total} q={q} rotulo="recebedor" />
    </div>
  );
}
