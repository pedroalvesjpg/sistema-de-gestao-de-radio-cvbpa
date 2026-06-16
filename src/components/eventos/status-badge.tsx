import { cn } from "@/lib/utils";
import { statusEvento } from "@/lib/format";

type Status = ReturnType<typeof statusEvento>;

const eventoConfig: Record<Status, { label: string; dot: string; text: string }> = {
  atual: { label: "Ao vivo", dot: "bg-primary", text: "text-primary" },
  futuro: { label: "Próximo", dot: "bg-navy", text: "text-navy" },
  passado: {
    label: "Encerrado",
    dot: "bg-muted-foreground/40",
    text: "text-muted-foreground",
  },
};

/**
 * Pílula institucional: bolinha colorida + texto em uppercase tracking-wide.
 * Base para qualquer badge da identidade CV (status de evento, papel, devolução).
 */
export function DotBadge({
  dot,
  text,
  children,
  className,
}: {
  dot: string;
  text: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide",
        text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {children}
    </span>
  );
}

export function EventoStatusBadge({
  evento,
  className,
}: {
  evento: { dataInicio: Date; dataFim: Date };
  className?: string;
}) {
  const c = eventoConfig[statusEvento(evento)];
  return (
    <DotBadge dot={c.dot} text={c.text} className={className}>
      {c.label}
    </DotBadge>
  );
}

/** Badge de papel (ADMIN vs COMUM) — vermelho institucional vs cinza. */
export function PapelBadge({
  role,
  className,
}: {
  role: "ADMIN" | "COMUM";
  className?: string;
}) {
  const isAdmin = role === "ADMIN";
  return (
    <DotBadge
      dot={isAdmin ? "bg-primary" : "bg-muted-foreground/50"}
      text={isAdmin ? "text-primary" : "text-muted-foreground"}
      className={className}
    >
      {isAdmin ? "Administrador" : "Operador"}
    </DotBadge>
  );
}
