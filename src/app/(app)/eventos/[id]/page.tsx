import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { fmtData, statusEvento } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EventoStatusBadge } from "@/components/eventos/status-badge";
import { RegistroForm } from "./registro-form";
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
        include: { devolucao: true, criadoPor: { select: { nome: true } } },
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

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          href="/"
          className="inline-flex text-sm text-muted-foreground hover:text-foreground"
        >
          ← Eventos
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight">
                {evento.nome}
              </h1>
              <EventoStatusBadge evento={evento} />
            </div>
            <p className="text-sm text-muted-foreground">
              {fmtData(evento.dataInicio)} → {fmtData(evento.dataFim)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-6 rounded-lg border bg-card px-5 py-3 text-sm">
              <Stat label="Total" value={total} />
              <Separator orientation="vertical" className="h-auto" />
              <Stat label="Em aberto" value={emAberto} highlight />
              <Separator orientation="vertical" className="h-auto" />
              <Stat label="Devolvidos" value={devolvidos} />
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
        </div>
      </div>

      {podeEscrever && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar saída de rádio</CardTitle>
            <CardDescription>
              Vincula um rádio a uma equipe e ao responsável que o retirou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegistroForm eventoId={evento.id} />
          </CardContent>
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-montserrat)] text-lg font-bold">
          Rádios entregues
        </h2>
        <RadiosList registros={evento.registros} podeEscrever={podeEscrever} />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div>
      <div
        className={
          "text-xl font-bold leading-none " +
          (highlight ? "text-primary" : "text-foreground")
        }
      >
        {value}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
