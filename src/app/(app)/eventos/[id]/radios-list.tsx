"use client";

import { useMemo, useState } from "react";
import { Images, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FotoViewer } from "@/components/foto/foto-viewer";
import { DotBadge } from "@/components/eventos/status-badge";
import { cn } from "@/lib/utils";
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
  urlFotoRg: string;
  urlFotoRadioSaida: string;
  criadoEm: Date;
  criadoPor: { nome: string };
  devolucao: {
    id: number;
    possuiAvaria: boolean;
    observacao: string | null;
    devolvidoPor: string | null;
    urlFotoRadioDevolucao: string;
    criadoEm: Date;
  } | null;
};

type FilterTab = "abertos" | "devolvidos" | "avarias";

const filterLabels: Record<FilterTab, string> = {
  abertos: "Em aberto",
  devolvidos: "Devolvidos",
  avarias: "Com avaria",
};

export function RadiosList({
  registros,
  podeEscrever,
}: {
  registros: Registro[];
  podeEscrever: boolean;
}) {
  const [tab, setTab] = useState<FilterTab>("abertos");
  const [query, setQuery] = useState("");

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return registros.filter((r) => {
      if (tab === "abertos" && r.devolucao) return false;
      if (tab === "devolvidos" && (!r.devolucao || r.devolucao.possuiAvaria))
        return false;
      if (tab === "avarias" && (!r.devolucao || !r.devolucao.possuiAvaria))
        return false;
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
  const avarias = registros.filter(
    (r) => r.devolucao && r.devolucao.possuiAvaria,
  ).length;
  const devolvidosOk = total - abertos - avarias;

  if (total === 0) {
    return (
      <EmptyState title="Nenhum rádio registrado" desc="A primeira saída aparece aqui." />
    );
  }

  const totalByTab: Record<FilterTab, number> = {
    abertos,
    devolvidos: devolvidosOk,
    avarias,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="-mx-1 flex overflow-x-auto px-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <div className="flex gap-6">
            {(Object.keys(filterLabels) as FilterTab[]).map((f) => {
              const active = tab === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTab(f)}
                  className={cn(
                    "relative whitespace-nowrap pb-2 text-sm font-bold uppercase tracking-wide transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {filterLabels[f]}
                  <span className="ml-1.5 font-semibold tabular-nums text-muted-foreground/70">
                    {totalByTab[f]}
                  </span>
                  {active && (
                    <span className="absolute inset-x-0 -bottom-px h-[2px] bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Modelo, código, equipe, responsável…"
            className="pl-9"
          />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState title="Nenhum rádio encontrado" desc="Nada bate com esses filtros." />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-background">
          {filtrados.map((registro) => (
            <RegistroRow
              key={registro.id}
              registro={registro}
              podeEscrever={podeEscrever}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function RegistroRow({
  registro,
  podeEscrever,
}: {
  registro: Registro;
  podeEscrever: boolean;
}) {
  const [fotosOpen, setFotosOpen] = useState(false);

  const fotos = [
    { label: "RG do responsável", path: registro.urlFotoRg },
    { label: "Rádio na entrega", path: registro.urlFotoRadioSaida },
    ...(registro.devolucao
      ? [
          {
            label: "Rádio na devolução",
            path: registro.devolucao.urlFotoRadioDevolucao,
          },
        ]
      : []),
  ];

  const isAberto = !registro.devolucao;

  return (
    <li className="relative p-5 sm:p-6">
      {isAberto && (
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-primary"
          aria-hidden
        />
      )}

      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-display text-lg font-bold leading-tight">
              {registro.modeloRadio}{" "}
              <span className="text-muted-foreground">·</span>{" "}
              <span className="font-mono">#{registro.codigoRadio}</span>
            </span>
            <DevolucaoStatus devolucao={registro.devolucao} />
          </div>
          <div className="text-sm text-muted-foreground">{registro.equipe}</div>
        </div>
        {podeEscrever && <RegistroActionsMenu registro={registro} />}
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Field label="Responsável">
          <span className="font-semibold text-foreground">
            {registro.nomeResponsavel}
          </span>{" "}
          <span className="text-muted-foreground">
            (RG {registro.rgResponsavel})
          </span>
        </Field>
        <Field label="Saída registrada">
          <span className="text-foreground">{registro.criadoPor.nome}</span>
          <span className="text-muted-foreground">
            {" "}
            · {fmtDataHora(registro.criadoEm)}
          </span>
        </Field>
        {registro.observacao && (
          <Field label="Observação" className="sm:col-span-2">
            {registro.observacao}
          </Field>
        )}
      </div>

      {registro.devolucao && (
        <div className="mt-4 rounded-md border border-border bg-secondary/40 p-3 text-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Devolução
          </div>
          <div className="mt-1">
            <span className="font-semibold">
              {fmtDataHora(registro.devolucao.criadoEm)}
            </span>
            {registro.devolucao.devolvidoPor && (
              <span className="text-muted-foreground">
                {" "}
                · por {registro.devolucao.devolvidoPor}
              </span>
            )}
          </div>
          {registro.devolucao.observacao && (
            <p className="mt-1 text-muted-foreground">
              {registro.devolucao.observacao}
            </p>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setFotosOpen(true)}
        >
          <Images />
          Ver fotos ({fotos.length})
        </Button>
        {isAberto && podeEscrever && (
          <DevolucaoForm
            registroId={registro.id}
            registroLabel={`${registro.modeloRadio} #${registro.codigoRadio} · ${registro.equipe}`}
            responsavelPadrao={registro.nomeResponsavel}
          />
        )}
      </div>

      <FotoViewer
        open={fotosOpen}
        onOpenChange={setFotosOpen}
        titulo={`${registro.modeloRadio} #${registro.codigoRadio} · ${registro.equipe}`}
        fotos={fotos}
      />
    </li>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function DevolucaoStatus({
  devolucao,
}: {
  devolucao: { possuiAvaria: boolean } | null;
}) {
  if (!devolucao) {
    return <DotBadge dot="bg-primary" text="text-primary">Em aberto</DotBadge>;
  }
  if (devolucao.possuiAvaria) {
    return (
      <DotBadge dot="bg-amber-600" text="text-amber-800">
        Devolvido c/ avaria
      </DotBadge>
    );
  }
  return (
    <DotBadge dot="bg-emerald-600" text="text-emerald-800">Devolvido</DotBadge>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-12 text-center">
      <div className="font-display text-base font-bold">{title}</div>
      <div className="text-sm text-muted-foreground">{desc}</div>
    </div>
  );
}
