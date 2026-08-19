"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const opcoes = [
  { valor: "light", rotulo: "Claro", Icone: Sun },
  { valor: "dark", rotulo: "Escuro", Icone: Moon },
  { valor: "system", rotulo: "Sistema", Icone: Monitor },
] as const;

/**
 * Vive dentro do menu do usuário. Fica montado só depois da hidratação: no
 * servidor não dá para saber o tema resolvido, e marcar o botão errado no
 * primeiro passe pisca na tela.
 */
/** `false` no servidor, `true` depois da hidratação — sem efeito nem setState. */
const semInscricao = () => () => {};
function useMontado() {
  return useSyncExternalStore(
    semInscricao,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const montado = useMontado();

  return (
    <div className="px-2 py-1.5">
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Aparência
      </div>
      <div
        role="group"
        aria-label="Aparência"
        className="grid grid-cols-3 gap-1 rounded-md border border-border p-0.5"
      >
        {opcoes.map(({ valor, rotulo, Icone }) => {
          const ativo = montado && theme === valor;
          return (
            <button
              key={valor}
              type="button"
              onClick={() => setTheme(valor)}
              aria-pressed={ativo}
              className={cn(
                "flex flex-col items-center gap-1 rounded-sm px-1 py-1.5 text-[10px] font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                ativo
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <Icone className="size-3.5" aria-hidden />
              {rotulo}
            </button>
          );
        })}
      </div>
    </div>
  );
}
