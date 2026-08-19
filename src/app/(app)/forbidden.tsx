import Link from "next/link";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Resposta a `forbidden()` — disparado por `requireAdmin` quando um operador
 * tenta uma rota ou ação restrita à coordenação. Renderiza com 403, dentro do
 * shell do app: a pessoa está logada, só não tem permissão para isto.
 */
export default function Forbidden() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-border py-20 text-center">
      <ShieldOff className="size-8 text-muted-foreground" aria-hidden />
      <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Erro 403
      </span>
      <h1 className="font-display text-2xl font-extrabold tracking-tight">
        Essa área é da coordenação
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Seu acesso é de operador. Você registra saídas e devoluções e cadastra
        rádios e recebedores — editar ou excluir cadastro, gerenciar eventos e
        usuários ficam com quem tem papel de administrador.
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Se você precisa desse acesso, peça à coordenação para ajustar seu papel.
      </p>
      <Button render={<Link href="/" />} nativeButton={false} className="mt-2">
        Voltar para os eventos
      </Button>
    </div>
  );
}
