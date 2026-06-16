import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { fmtData, statusEvento } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EventoStatusBadge } from "@/components/eventos/status-badge";
import { RegistroDialog } from "./registro-dialog";
import { RadiosList } from "./radios-list";
import { EventoActionsMenu } from "./evento-actions-menu";

type Props = { params: Promise<{ id: string }> };

export default async function EventoPage({ params }: Props) {
  const { id } = await params;
  const eventoId = Number(id);
  if (Number.isNaN(eventoId)) notFound();

  const session = await requireUser();
  const isAdmin = session.user.role === "ADMIN";

  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    include: {
      registros: {
        orderBy: { criadoEm: "desc" },
        include: {
          devolucao: true,
          criadoPor: { select: { nome: true } },
          radio: {
            select: {
              id: true,
              numeroPatrimonio: true,
              marca: true,
              modelo: true,
            },
          },
          recebedor: {
            select: {
              id: true,
              nome: true,
              rg: true,
              departamento: true,
            },
          },
        },
      },
    },
  });
  if (!evento) notFound();

  const status = statusEvento(evento);
  if (!isAdmin && status === "passado") redirect("/");

  const podeEscrever = status !== "passado";
  const total = evento.registros.length;
  const emAberto = evento.registros.filter((r) => !r.devolucao).length;
  const devolvidos = total - emAberto;

  // Pra UX: já carrega opções de rádio e recebedor caso o usuário vá registrar
  // saída. Server-side valida disponibilidade do rádio no submit.
  const [radios, recebedores] = podeEscrever
    ? await Promise.all([
        prisma.radio.findMany({
          orderBy: { numeroPatrimonio: "asc" },
          select: {
            id: true,
            numeroPatrimonio: true,
            marca: true,
            modelo: true,
          },
        }),
        prisma.recebedor.findMany({
          orderBy: { nome: "asc" },
          select: { id: true, nome: true, departamento: true },
        }),
      ])
    : [[], []];

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Eventos
      </Link>

      <div className="border-b border-border pb-6">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-extrabold tracking-tight">
                {evento.nome}
              </h1>
              <EventoStatusBadge evento={evento} />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              {fmtData(evento.dataInicio)} → {fmtData(evento.dataFim)}
            </p>
          </div>
          {isAdmin && (
            <EventoActionsMenu
              evento={{
                id: evento.id,
                nome: evento.nome,
                dataInicio: evento.dataInicio,
                dataFim: evento.dataFim,
              }}
            />
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-md border border-border bg-background">
          <StatCell label="Total" value={total} />
          <StatCell label="Em aberto" value={emAberto} tone="primary" />
          <StatCell label="Devolvidos" value={devolvidos} muted />
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-extrabold tracking-tight">
            Rádios
          </h2>
          {podeEscrever && (
            <RegistroDialog
              eventoId={evento.id}
              radios={radios}
              recebedores={recebedores}
            />
          )}
        </div>
        <RadiosList registros={evento.registros} podeEscrever={podeEscrever} />
      </section>
    </div>
  );
}

function StatCell({
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
    <div className="px-4 py-3 sm:px-6 sm:py-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-display text-2xl font-black leading-none tabular-nums",
          tone === "primary" && "text-primary",
          muted && "text-foreground/60",
        )}
      >
        {value}
      </div>
    </div>
  );
}
