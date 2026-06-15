"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EventoStatusBadge } from "@/components/eventos/status-badge";
import { cn } from "@/lib/utils";
import { fmtData, statusEvento } from "@/lib/format";

type Evento = {
  id: number;
  nome: string;
  dataInicio: Date;
  dataFim: Date;
  _count: { registros: number };
  registros: { devolucao: { id: number } | null }[];
};

type StatusFilter = "todos" | "atual" | "futuro" | "passado";

const filterLabels: Record<StatusFilter, string> = {
  todos: "Todos",
  atual: "Ao vivo",
  futuro: "Próximos",
  passado: "Encerrados",
};

export function EventosList({
  eventos,
  isAdmin,
}: {
  eventos: Evento[];
  isAdmin: boolean;
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const now = new Date();
    return eventos.reduce(
      (acc, e) => {
        const s = statusEvento(e, now);
        acc[s] += 1;
        return acc;
      },
      { atual: 0, futuro: 0, passado: 0 },
    );
  }, [eventos]);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = new Date();
    return eventos.filter((e) => {
      const s = statusEvento(e, now);
      if (statusFilter !== "todos" && s !== statusFilter) return false;
      if (q && !e.nome.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [eventos, statusFilter, query]);

  if (eventos.length === 0) {
    return (
      <EmptyState
        title={`Nenhum evento ${isAdmin ? "cadastrado" : "disponível"}`}
        desc={
          isAdmin
            ? "Crie o primeiro evento para começar a registrar rádios."
            : "Volte quando a coordenação abrir um novo evento."
        }
      />
    );
  }

  const totalByFilter: Record<StatusFilter, number> = {
    todos: eventos.length,
    ...counts,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="-mx-1 flex overflow-x-auto px-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <div className="flex gap-6">
            {(Object.keys(filterLabels) as StatusFilter[]).map((f) => {
              const active = statusFilter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "relative whitespace-nowrap pb-2 text-sm font-bold uppercase tracking-wide transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {filterLabels[f]}
                  <span className="ml-1.5 font-semibold tabular-nums text-muted-foreground/70">
                    {totalByFilter[f]}
                  </span>
                  {active && (
                    <span className="absolute inset-x-0 -bottom-px h-[2px] bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar evento…"
            className="pl-9"
          />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          title="Nenhum evento"
          desc="Nada bate com esses filtros."
        />
      ) : (
        <ul className="overflow-hidden rounded-md border border-border bg-background">
          {filtrados.map((evento, idx) => (
            <EventoRow
              key={evento.id}
              evento={evento}
              isAdmin={isAdmin}
              first={idx === 0}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function EventoRow({
  evento,
  isAdmin,
  first,
}: {
  evento: Evento;
  isAdmin: boolean;
  first: boolean;
}) {
  const total = evento._count.registros;
  const emAberto = evento.registros.filter((r) => !r.devolucao).length;
  const status = statusEvento(evento);
  const disabled = !isAdmin && status === "passado";
  const isLive = status === "atual";

  const content = (
    <div
      className={cn(
        "group relative flex items-center gap-4 px-4 py-4 transition-colors sm:px-6",
        !first && "border-t border-border",
        !disabled && "hover:bg-secondary/60",
        disabled && "opacity-60",
      )}
    >
      {isLive && (
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-primary"
          aria-hidden
        />
      )}

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="truncate font-display text-lg font-bold leading-tight">
            {evento.nome}
          </span>
          <EventoStatusBadge evento={evento} />
        </div>
        <div className="flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
          {fmtData(evento.dataInicio)} → {fmtData(evento.dataFim)}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-6">
        <Metric label="Saídas" value={total} />
        {total > 0 && !disabled && (
          <Metric
            label="Em aberto"
            value={emAberto}
            tone={emAberto > 0 ? "primary" : "muted"}
          />
        )}
        {!disabled && (
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        )}
      </div>
    </div>
  );

  if (disabled) {
    return (
      <li
        aria-disabled
        title="Eventos encerrados só ficam disponíveis para administradores."
        className="cursor-not-allowed select-none"
      >
        {content}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={`/eventos/${evento.id}`}
        className="block focus:outline-none focus-visible:bg-secondary"
      >
        {content}
      </Link>
    </li>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "primary" | "muted";
}) {
  return (
    <div className="text-right">
      <div
        className={cn(
          "text-xl font-black leading-none tabular-nums",
          tone === "primary" && "text-primary",
          tone === "muted" && "text-muted-foreground",
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border py-16 text-center">
      <div className="text-muted-foreground/60">
        <svg
          viewBox="0 0 24 24"
          className="h-9 w-9"
          fill="currentColor"
          aria-hidden
        >
          <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z" />
        </svg>
      </div>
      <div className="font-display text-base font-bold">{title}</div>
      <div className="max-w-xs text-sm text-muted-foreground">{desc}</div>
    </div>
  );
}
