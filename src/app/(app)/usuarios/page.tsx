import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { fmtData } from "@/lib/format";
import { PapelBadge } from "@/components/eventos/status-badge";
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
import { NovoUsuarioDialog } from "./novo-usuario-dialog";
import { UsuarioActionsMenu } from "./usuario-actions-menu";
import { SolicitacoesList } from "./solicitacoes-list";

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function UsuariosPage({ searchParams }: Props) {
  const session = await requireAdmin();
  const meuId = Number(session.user.id);
  const { q, page, skip } = lerFiltros(await searchParams);

  const busca = { contains: q, mode: "insensitive" as const };
  const where = q
    ? { OR: [{ nome: busca }, { email: busca }, { cargo: busca }] }
    : {};

  const [usuarios, total, solicitacoes] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ role: "asc" }, { nome: "asc" }],
      take: TAMANHO_PAGINA,
      skip,
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        role: true,
        criadoEm: true,
      },
    }),
    prisma.user.count({ where }),
    prisma.solicitacaoAcesso.findMany({
      where: { status: "PENDENTE" },
      orderBy: { criadoEm: "asc" },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        criadoEm: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
        <div className="flex items-baseline gap-4">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Usuários
          </h1>
          <span className="font-mono text-sm font-medium tabular-nums text-muted-foreground">
            {total}
          </span>
        </div>
        <NovoUsuarioDialog />
      </div>

      <SolicitacoesList solicitacoes={solicitacoes} />

      <BuscaForm q={q} placeholder="Nome, email ou cargo…" />

      <div className="overflow-hidden rounded-md border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-bold uppercase tracking-wide">
                Nome
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wide">
                Email
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wide">
                Cargo
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wide">
                Papel
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wide">
                Cadastrado em
              </TableHead>
              <TableHead className="w-12 text-right">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => {
              const isSelf = u.id === meuId;
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-semibold">
                    {u.nome}
                    {isSelf && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (você)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.cargo || "—"}
                  </TableCell>
                  <TableCell>
                    <PapelBadge role={u.role} />
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {fmtData(u.criadoEm)}
                  </TableCell>
                  <TableCell className="text-right">
                    <UsuarioActionsMenu user={u} isSelf={isSelf} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Paginacao page={page} total={total} q={q} rotulo="usuário" />
    </div>
  );
}
