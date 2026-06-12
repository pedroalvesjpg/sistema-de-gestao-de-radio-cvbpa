import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { statusEvento } from "@/lib/format";

type Status = ReturnType<typeof statusEvento>;

const styles: Record<Status, string> = {
  atual: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  futuro: "bg-navy/10 text-navy hover:bg-navy/10",
  passado: "bg-muted text-muted-foreground hover:bg-muted",
};

const labels: Record<Status, string> = {
  atual: "Em andamento",
  futuro: "Próximo",
  passado: "Encerrado",
};

export function EventoStatusBadge({
  evento,
  className,
}: {
  evento: { dataInicio: Date; dataFim: Date };
  className?: string;
}) {
  const status = statusEvento(evento);
  return (
    <Badge
      variant="secondary"
      className={cn("border-transparent font-medium", styles[status], className)}
    >
      {labels[status]}
    </Badge>
  );
}
