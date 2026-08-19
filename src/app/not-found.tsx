import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

/**
 * 404 de endereço que não casa com nenhuma rota. Fica fora do grupo `(app)`,
 * então renderiza sem a navegação — quem chega aqui pode nem estar logado.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-5 bg-background px-6 py-16 text-center">
      <Logo variant="mark" className="h-12 w-12" />
      <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Erro 404
      </span>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        Página não encontrada
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Esse endereço não existe no RADCOM. Confira o link ou volte para o
        início.
      </p>
      <Button render={<Link href="/" />} nativeButton={false} className="mt-2">
        Ir para o início
      </Button>
    </main>
  );
}
