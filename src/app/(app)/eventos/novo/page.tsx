import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NovoEventoForm } from "./novo-evento-form";

export default async function NovoEventoPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href="/"
        className="inline-flex text-sm text-muted-foreground hover:text-foreground"
      >
        ← Voltar aos eventos
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Novo evento</CardTitle>
          <CardDescription>
            Defina o nome e o período em que rádios serão emprestados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NovoEventoForm />
        </CardContent>
      </Card>
    </div>
  );
}
