import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Renderiza dentro do shell do app (com navegação), para quem já está logado e
 * caiu num recurso que não existe — evento apagado, link antigo no WhatsApp.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-border py-20 text-center">
      <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Erro 404
      </span>
      <h1 className="font-display text-2xl font-extrabold tracking-tight">
        Não encontramos essa página
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        O endereço pode estar errado, ou o evento que você procura foi excluído
        pela coordenação.
      </p>
      <Button render={<Link href="/" />} nativeButton={false} className="mt-2">
        Voltar para os eventos
      </Button>
    </div>
  );
}
