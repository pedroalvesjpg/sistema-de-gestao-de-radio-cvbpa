import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guards";
import { NovoEventoForm } from "./novo-evento-form";

export default async function NovoEventoPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/"
        className="inline-flex items-center text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Eventos
      </Link>
      <div className="border-b border-border pb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Novo evento
        </h1>
      </div>
      <NovoEventoForm />
    </div>
  );
}
