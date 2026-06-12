import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { fmtData } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrocarSenhaForm } from "./trocar-senha-form";

export default async function PerfilPage() {
  const session = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: {
      nome: true,
      email: true,
      cargo: true,
      role: true,
      criadoEm: true,
    },
  });
  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        Não conseguimos carregar seus dados.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight">
          Meu perfil
        </h1>
        <p className="text-sm text-muted-foreground">
          Seus dados e configurações de conta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da conta</CardTitle>
          <CardDescription>
            Para alterar nome, email ou cargo, peça à coordenação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Field label="Nome" value={user.nome} />
          <Separator />
          <Field label="Email" value={user.email} />
          <Separator />
          <Field label="Cargo" value={user.cargo || "—"} />
          <Separator />
          <Field
            label="Papel"
            value={
              <Badge
                variant={user.role === "ADMIN" ? "default" : "secondary"}
              >
                {user.role === "ADMIN" ? "Administrador" : "Operador"}
              </Badge>
            }
          />
          <Separator />
          <Field label="Membro desde" value={fmtData(user.criadoEm)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar senha</CardTitle>
          <CardDescription>
            Você precisa informar sua senha atual para confirmar a mudança.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrocarSenhaForm />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
