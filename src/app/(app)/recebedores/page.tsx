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
import { NovoRecebedorDialog } from "./novo-recebedor-dialog";
import { RecebedorActionsMenu } from "./recebedor-actions-menu";

export default async function RecebedoresPage() {
  await requireUser();

  const recebedores = await prisma.recebedor.findMany({
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      rg: true,
      departamento: true,
      cargo: true,
      foneContato: true,
      criadoEm: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
        <div className="flex items-baseline gap-4">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Recebedores
          </h1>
          <span className="font-mono text-sm font-medium tabular-nums text-muted-foreground">
            {recebedores.length}
          </span>
        </div>
        <NovoRecebedorDialog />
      </div>

      {recebedores.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-16 text-center">
          <div className="font-display text-base font-bold">
            Nenhum recebedor cadastrado
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
                  <TableHead className="w-12 text-right">
                    <span className="sr-only">Ações</span>
                  </TableHead>
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
                    <TableCell className="text-right">
                      <RecebedorActionsMenu recebedor={r} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
