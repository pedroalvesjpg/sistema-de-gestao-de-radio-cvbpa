"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
              <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z" />
            </svg>
          </div>
          <CardTitle className="text-base">
            Nenhum evento {isAdmin ? "cadastrado" : "disponível"}
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? "Crie o primeiro evento para começar a registrar rádios."
              : "Volte quando a coordenação abrir um novo evento."}
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-1 overflow-x-auto overflow-y-hidden px-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <TabsList>
              <TabsTrigger value="todos">
                Todos <CountBadge>{eventos.length}</CountBadge>
              </TabsTrigger>
              <TabsTrigger value="atual">
                Em andamento <CountBadge>{counts.atual}</CountBadge>
              </TabsTrigger>
              <TabsTrigger value="futuro">
                Próximos <CountBadge>{counts.futuro}</CountBadge>
              </TabsTrigger>
              <TabsTrigger value="passado">
                Encerrados <CountBadge>{counts.passado}</CountBadge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar evento pelo nome…"
            className="pl-8"
          />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhum evento encontrado com esses critérios.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((evento) => (
            <EventoCard key={evento.id} evento={evento} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventoCard({ evento, isAdmin }: { evento: Evento; isAdmin: boolean }) {
  const total = evento._count.registros;
  const emAberto = evento.registros.filter((r) => !r.devolucao).length;
  const status = statusEvento(evento);
  const disabled = !isAdmin && status === "passado";

  const inner = (
    <Card
      className={cn(
        "h-full transition",
        disabled
          ? "opacity-60"
          : "group-hover:border-primary/40 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring",
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg leading-tight">{evento.nome}</CardTitle>
          <EventoStatusBadge evento={evento} />
        </div>
        <CardDescription>
          {fmtData(evento.dataInicio)} → {fmtData(evento.dataFim)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-6 text-sm">
        <div>
          <div className="text-2xl font-bold leading-none">{total}</div>
          <div className="text-xs text-muted-foreground">
            {total === 1 ? "rádio" : "rádios"}
          </div>
        </div>
        {total > 0 && !disabled && (
          <div>
            <div className="text-2xl font-bold leading-none text-primary">
              {emAberto}
            </div>
            <div className="text-xs text-muted-foreground">em aberto</div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (disabled) {
    return (
      <div
        aria-disabled="true"
        title="Eventos encerrados só ficam disponíveis para administradores."
        className="cursor-not-allowed select-none"
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/eventos/${evento.id}`}
      className="group focus-visible:outline-none"
    >
      {inner}
    </Link>
  );
}

function CountBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1.5 hidden h-4 min-w-[1rem] items-center justify-center rounded-full bg-muted px-1 text-[10px] font-semibold text-muted-foreground sm:inline-flex">
      {children}
    </span>
  );
}
