import Link from "next/link";
import { AlertTriangle, CalendarClock, Radio, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { fmtData } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export async function AdminDashboard({ userName }: { userName: string }) {
  const now = new Date();
  const primeiroNome = userName.trim().split(/\s+/)[0] ?? userName;

  const [eventosAtivos, radiosEmAberto, totalAvarias, pendencias] =
    await Promise.all([
      prisma.evento.count({
        where: { dataInicio: { lte: now }, dataFim: { gte: now } },
      }),
      prisma.registro.count({
        where: { devolucao: null, evento: { dataFim: { gte: now } } },
      }),
      prisma.devolucao.count({ where: { possuiAvaria: true } }),
      prisma.evento.findMany({
        where: {
          dataFim: { lt: now },
          registros: { some: { devolucao: null } },
        },
        select: {
          id: true,
          nome: true,
          dataFim: true,
          registros: {
            where: { devolucao: null },
            select: { id: true },
          },
        },
        orderBy: { dataFim: "desc" },
        take: 5,
      }),
    ]);

  return (
    <section className="space-y-6">
      <div className="border-l-4 border-primary pl-4">
        <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight">
          Olá, {primeiroNome}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aqui você acompanha eventos, rádios em aberto e pendências da operação.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={CalendarClock}
          label="Eventos em andamento"
          value={eventosAtivos}
          accent="default"
        />
        <StatCard
          icon={Radio}
          label="Rádios em aberto"
          value={radiosEmAberto}
          accent="primary"
        />
        <StatCard
          icon={AlertTriangle}
          label="Avarias registradas"
          value={totalAvarias}
          accent="warning"
          subtitle="Total no histórico"
        />
      </div>

      {pendencias.length > 0 && <PendenciasCard pendencias={pendencias} />}
    </section>
  );
}

type AccentColor = "default" | "primary" | "warning";

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent: AccentColor;
  subtitle?: string;
}) {
  const accentClasses: Record<AccentColor, string> = {
    default: "bg-secondary text-foreground",
    primary: "bg-primary/10 text-primary",
    warning: "bg-amber-100 text-amber-800",
  };

  const valueClasses: Record<AccentColor, string> = {
    default: "text-foreground",
    primary: "text-primary",
    warning: "text-amber-700",
  };

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div
            className={cn(
              "mt-2 text-3xl font-bold leading-none",
              valueClasses[accent],
            )}
          >
            {value}
          </div>
          {subtitle && (
            <div className="mt-1.5 text-xs text-muted-foreground">
              {subtitle}
            </div>
          )}
        </div>
        <div
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full",
            accentClasses[accent],
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

type Pendencia = {
  id: number;
  nome: string;
  dataFim: Date;
  registros: { id: number }[];
};

function PendenciasCard({ pendencias }: { pendencias: Pendencia[] }) {
  return (
    <Card className="border-l-4 border-l-amber-500 bg-amber-50/50">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div>
            <h3 className="font-semibold leading-tight">
              Eventos encerrados com pendências
            </h3>
            <p className="text-sm text-muted-foreground">
              Esses eventos terminaram com rádios ainda não devolvidos. Resolva
              caso a caso (marcar devolução tardia ou desvincular o registro).
            </p>
          </div>
        </div>
        <Separator className="bg-amber-200" />
        <ul className="space-y-1.5">
          {pendencias.map((p) => (
            <li key={p.id}>
              <Link
                href={`/eventos/${p.id}`}
                className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-amber-100/50"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-medium">{p.nome}</span>
                  <span className="text-xs text-muted-foreground">
                    encerrado em {fmtData(p.dataFim)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-amber-700">
                  {p.registros.length} em aberto
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
