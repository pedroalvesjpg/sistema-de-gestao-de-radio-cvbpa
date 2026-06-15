import { cn } from "@/lib/utils";
import { statusEvento } from "@/lib/format";

type Status = ReturnType<typeof statusEvento>;

const config: Record<Status, { label: string; dot: string; text: string }> = {
  atual: { label: "Ao vivo", dot: "bg-primary", text: "text-primary" },
  futuro: { label: "Próximo", dot: "bg-navy", text: "text-navy" },
  passado: {
    label: "Encerrado",
    dot: "bg-muted-foreground/40",
    text: "text-muted-foreground",
  },
};

export function EventoStatusBadge({
  evento,
  className,
}: {
  evento: { dataInicio: Date; dataFim: Date };
  className?: string;
}) {
  const status = statusEvento(evento);
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide",
        c.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}
