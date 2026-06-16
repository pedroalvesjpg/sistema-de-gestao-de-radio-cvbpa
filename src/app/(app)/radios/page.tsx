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
import { NovoRadioDialog } from "./novo-radio-dialog";
import { RadioActionsMenu } from "./radio-actions-menu";

export default async function RadiosPage() {
  await requireUser();

  const radios = await prisma.radio.findMany({
    orderBy: { numeroPatrimonio: "asc" },
    select: {
      id: true,
      numeroPatrimonio: true,
      numeroSerie: true,
      marca: true,
      modelo: true,
      acessorios: true,
      criadoEm: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
        <div className="flex items-baseline gap-4">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Rádios
          </h1>
          <span className="font-mono text-sm font-medium tabular-nums text-muted-foreground">
            {radios.length}
          </span>
        </div>
        <NovoRadioDialog />
      </div>

      {radios.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-16 text-center">
          <div className="font-display text-base font-bold">
            Nenhum rádio cadastrado
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
                  <TableHead className="w-12 text-right">
                    <span className="sr-only">Ações</span>
                  </TableHead>
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
                    <TableCell className="text-right">
                      <RadioActionsMenu radio={r} />
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
