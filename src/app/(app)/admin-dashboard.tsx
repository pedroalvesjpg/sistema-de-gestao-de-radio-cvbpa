import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fmtData, primeiroNome } from "@/lib/format";
import { cn } from "@/lib/utils";

export async function AdminDashboard({ userName }: { userName: string }) {
  const now = new Date();

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
    <section className="space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Olá, {primeiroNome(userName)}.
        </h1>
      </div>

      <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-md border border-border bg-background sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Kpi label="Eventos ao vivo" value={eventosAtivos} />
        <Kpi label="Rádios em campo" value={radiosEmAberto} tone="primary" />
        <Kpi label="Avarias no histórico" value={totalAvarias} muted />
      </div>

      {pendencias.length > 0 && <PendenciasLista pendencias={pendencias} />}
    </section>
  );
}

function Kpi({
  label,
  value,
  tone,
  muted,
}: {
  label: string;
  value: number;
  tone?: "primary";
  muted?: boolean;
}) {
  return (
    <div className="px-6 py-5">
      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 font-display text-4xl font-black leading-none tabular-nums",
          tone === "primary" && "text-primary",
          muted && "text-foreground/60",
        )}
      >
        {value}
      </div>
    </div>
  );
}

type Pendencia = {
  id: number;
  nome: string;
  dataFim: Date;
  registros: { id: number }[];
};

function PendenciasLista({ pendencias }: { pendencias: Pendencia[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-amber-300/70 bg-amber-50/60">
      <div className="border-b border-amber-300/70 px-4 py-2.5">
        <span className="text-xs font-bold uppercase tracking-wide text-amber-900">
          Eventos encerrados com pendências
        </span>
      </div>
      <ul className="divide-y divide-amber-200">
        {pendencias.map((p) => (
          <li key={p.id}>
            <Link
              href={`/eventos/${p.id}`}
              className="flex items-baseline justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-amber-100/50"
            >
              <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                <span className="truncate font-semibold">{p.nome}</span>
                <span className="text-xs text-muted-foreground">
                  encerrado em {fmtData(p.dataFim)}
                </span>
              </div>
              <span className="shrink-0 font-semibold tabular-nums text-amber-800">
                {p.registros.length} em aberto
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
