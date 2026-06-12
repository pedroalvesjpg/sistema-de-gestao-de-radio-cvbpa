"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fmtDataHora } from "@/lib/format";
import { DevolucaoForm } from "./devolucao-form";
import { RegistroActionsMenu } from "./registro-actions-menu";

type Registro = {
  id: number;
  modeloRadio: string;
  codigoRadio: string;
  equipe: string;
  nomeResponsavel: string;
  rgResponsavel: string;
  observacao: string | null;
  criadoEm: Date;
  criadoPor: { nome: string };
  devolucao: {
    id: number;
    possuiAvaria: boolean;
    observacao: string | null;
    devolvidoPor: string | null;
    criadoEm: Date;
  } | null;
};

type FilterTab = "todos" | "abertos" | "devolvidos";

export function RadiosList({
  registros,
  podeEscrever,
}: {
  registros: Registro[];
  podeEscrever: boolean;
}) {
  const [tab, setTab] = useState<FilterTab>("todos");
  const [query, setQuery] = useState("");

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return registros.filter((r) => {
      if (tab === "abertos" && r.devolucao) return false;
      if (tab === "devolvidos" && !r.devolucao) return false;
      if (q) {
        const haystack =
          `${r.modeloRadio} ${r.codigoRadio} ${r.equipe} ${r.nomeResponsavel} ${r.rgResponsavel}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [registros, query, tab]);

  const total = registros.length;
  const abertos = registros.filter((r) => !r.devolucao).length;
  const devolvidos = total - abertos;

  if (total === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Nenhum rádio registrado ainda neste evento.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-1 overflow-x-auto overflow-y-hidden px-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
            <TabsList>
              <TabsTrigger value="todos">
                Todos <CountBadge>{total}</CountBadge>
              </TabsTrigger>
              <TabsTrigger value="abertos">
                Em aberto <CountBadge>{abertos}</CountBadge>
              </TabsTrigger>
              <TabsTrigger value="devolvidos">
                Devolvidos <CountBadge>{devolvidos}</CountBadge>
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
            placeholder="Buscar por modelo, código, equipe, responsável…"
            className="pl-8"
          />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhum rádio encontrado com esses critérios.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtrados.map((registro) => (
            <RegistroCard
              key={registro.id}
              registro={registro}
              podeEscrever={podeEscrever}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RegistroCard({
  registro,
  podeEscrever,
}: {
  registro: Registro;
  podeEscrever: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">
              {registro.modeloRadio}{" "}
              <span className="text-muted-foreground">·</span>{" "}
              <span className="font-mono">#{registro.codigoRadio}</span>
            </CardTitle>
            <CardDescription className="mt-1">{registro.equipe}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DevolucaoStatusBadge devolucao={registro.devolucao} />
            {podeEscrever && <RegistroActionsMenu registro={registro} />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 text-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Responsável">
            <span className="font-medium text-foreground">
              {registro.nomeResponsavel}
            </span>{" "}
            <span className="text-muted-foreground">
              ({registro.rgResponsavel})
            </span>
          </Field>
          <Field label="Registrado por">
            {registro.criadoPor.nome}
            <span className="text-muted-foreground">
              {" "}
              em {fmtDataHora(registro.criadoEm)}
            </span>
          </Field>
        </div>
        {registro.observacao && (
          <Field label="Observação">{registro.observacao}</Field>
        )}

        {registro.devolucao ? (
          <div className="rounded-md border bg-secondary/40 p-3 text-sm">
            <div className="font-medium">
              Devolvido em {fmtDataHora(registro.devolucao.criadoEm)}
              {registro.devolucao.devolvidoPor &&
                ` por ${registro.devolucao.devolvidoPor}`}
            </div>
            {registro.devolucao.observacao && (
              <p className="mt-1 text-muted-foreground">
                {registro.devolucao.observacao}
              </p>
            )}
          </div>
        ) : (
          podeEscrever && (
            <div className="flex justify-end pt-1">
              <DevolucaoForm
                registroId={registro.id}
                registroLabel={`${registro.modeloRadio} #${registro.codigoRadio} · ${registro.equipe}`}
                responsavelPadrao={registro.nomeResponsavel}
              />
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function DevolucaoStatusBadge({
  devolucao,
}: {
  devolucao: { possuiAvaria: boolean } | null;
}) {
  if (!devolucao) {
    return (
      <Badge className="border-transparent bg-primary/10 text-primary hover:bg-primary/10">
        Em aberto
      </Badge>
    );
  }
  if (devolucao.possuiAvaria) {
    return (
      <Badge className="border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100">
        Devolvido c/ avaria
      </Badge>
    );
  }
  return (
    <Badge className="border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
      Devolvido
    </Badge>
  );
}

function CountBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1.5 hidden h-4 min-w-[1rem] items-center justify-center rounded-full bg-muted px-1 text-[10px] font-semibold text-muted-foreground sm:inline-flex">
      {children}
    </span>
  );
}
