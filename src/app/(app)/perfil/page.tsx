import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { fmtData } from "@/lib/format";
import { cn } from "@/lib/utils";
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

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="border-b border-border pb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Meu perfil
        </h1>
      </div>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-lg font-extrabold tracking-tight">
            Dados da conta
          </h2>
          <p className="text-xs text-muted-foreground">
            Pra alterar, peça à coordenação.
          </p>
        </div>
        <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-background">
          <Field label="Nome" value={user.nome} />
          <Field label="Email" value={user.email} />
          <Field label="Cargo" value={user.cargo || "—"} />
          <Field
            label="Papel"
            value={
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide",
                  isAdmin ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isAdmin ? "bg-primary" : "bg-muted-foreground/50",
                  )}
                />
                {isAdmin ? "Administrador" : "Operador"}
              </span>
            }
          />
          <Field label="Membro desde" value={fmtData(user.criadoEm)} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-extrabold tracking-tight">
          Alterar senha
        </h2>
        <TrocarSenhaForm />
      </section>
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
    <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-4">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}
