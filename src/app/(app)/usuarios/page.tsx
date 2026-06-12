import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { fmtData } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NovoUsuarioDialog } from "./novo-usuario-dialog";
import { UsuarioActionsMenu } from "./usuario-actions-menu";

export default async function UsuariosPage() {
  const session = await requireAdmin();
  const meuId = Number(session.user.id);

  const usuarios = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { nome: "asc" }],
    select: {
      id: true,
      nome: true,
      email: true,
      cargo: true,
      role: true,
      criadoEm: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight">
            Usuários
          </h1>
          <p className="text-sm text-muted-foreground">
            Quem tem acesso ao sistema. {usuarios.length}{" "}
            {usuarios.length === 1 ? "pessoa cadastrada" : "pessoas cadastradas"}.
          </p>
        </div>
        <NovoUsuarioDialog />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Cadastrado em</TableHead>
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
                    <TableCell className="font-medium">
                      {u.nome}
                      {isSelf && (
                        <span className="ml-2 text-xs text-muted-foreground">
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
                      <Badge
                        variant={u.role === "ADMIN" ? "default" : "secondary"}
                      >
                        {u.role === "ADMIN" ? "Administrador" : "Operador"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
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
        </CardContent>
      </Card>
    </div>
  );
}
