import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { fmtData, statusEvento } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getSignedUrl } from "@/lib/storage";
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
          criadoPor: { select: { nome: true, fotoPerfilUrl: true } },
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
  const encerrado = status === "passado";
  // Operador entra em evento encerrado, mas só lê — é o histórico da operação,
  // e esconder isso dele não protegia nada: só deixava a home vazia fora de
  // evento. A escrita continua barrada aqui e nas server actions.
  const somenteLeitura = encerrado && !isAdmin;
  // Saída nova só em evento aberto — `criarRegistro` recusa em qualquer caso.
  const podeRegistrarSaida = !encerrado;
  // Fechar pendência (devolver, desvincular, cancelar) continua liberado para a
  // coordenação depois do evento: é assim que um rádio que voltou tarde baixa.
  const podeGerenciarRegistros = !encerrado || isAdmin;

  const total = evento.registros.length;
  const emAberto = evento.registros.filter((r) => !r.devolucao).length;
  const devolvidos = total - emAberto;

  const fotoPaths = Array.from(
    new Set(
      evento.registros
        .map((r) => r.criadoPor.fotoPerfilUrl)
        .filter((p): p is string => !!p),
    ),
  );
  const fotoUrlByPath = new Map(
    await Promise.all(
      fotoPaths.map(async (p) => [p, await getSignedUrl(p)] as const),
    ),
  );
  const registrosComFoto = evento.registros.map((r) => ({
    ...r,
    criadoPor: {
      nome: r.criadoPor.nome,
      fotoUrl: r.criadoPor.fotoPerfilUrl
        ? (fotoUrlByPath.get(r.criadoPor.fotoPerfilUrl) ?? null)
        : null,
    },
  }));

  const [radios, totalRadios] = podeRegistrarSaida
    ? await Promise.all([
        prisma.radio.findMany({
          // Só os livres. Oferecer um rádio que está em campo só levava o
          // operador a preencher o formulário inteiro — duas fotos — para
          // receber a recusa no envio e perder tudo.
          where: { registros: { none: { devolucao: { is: null } } } },
          orderBy: { numeroPatrimonio: "asc" },
          select: {
            id: true,
            numeroPatrimonio: true,
            marca: true,
            modelo: true,
          },
        }),
        prisma.radio.count(),
      ])
    : [[], 0];

  // Recebedores servem também para corrigir um registro já feito, o que a
  // coordenação pode fazer mesmo depois do evento encerrado.
  const recebedores = podeGerenciarRegistros
    ? await prisma.recebedor.findMany({
        orderBy: { nome: "asc" },
        select: { id: true, nome: true, departamento: true },
      })
    : [];

  const radiosEmCampo = totalRadios - radios.length;

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
          {podeRegistrarSaida && (
            <RegistroDialog
              eventoId={evento.id}
              radios={radios}
              recebedores={recebedores}
              radiosEmCampo={radiosEmCampo}
            />
          )}
        </div>

        {somenteLeitura && <AvisoSomenteLeitura emAberto={emAberto} />}
        {encerrado && isAdmin && emAberto > 0 && <AvisoBaixaTardia />}

        <RadiosList
          registros={registrosComFoto}
          recebedores={recebedores}
          podeEscrever={podeGerenciarRegistros}
        />
      </section>
    </div>
  );
}

function AvisoSomenteLeitura({ emAberto }: { emAberto: number }) {
  return (
    <div className="flex gap-3 rounded-md border border-border bg-secondary/40 px-5 py-4">
      <Lock
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Somente leitura
        </div>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Evento encerrado. O histórico fica aqui para consulta, mas não é mais
          possível registrar saída nem devolução.
          {emAberto > 0 &&
            " Se um rádio voltou depois do evento, peça a um administrador para lançar a devolução."}
        </p>
      </div>
    </div>
  );
}

function AvisoBaixaTardia() {
  return (
    // Tudo em token de identidade: `accent` já é o lavado de vermelho do app
    // (#fff1f1 no claro), e `primary` é o vermelho da Cruz Vermelha. Assim o
    // aviso acompanha os dois temas sem cor solta no meio do caminho.
    <div className="relative overflow-hidden rounded-md border border-primary/30 bg-accent px-5 py-4">
      {/* Mesma régua que marca "em aberto" na lista e no evento ao vivo. */}
      <span
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-primary"
        aria-hidden
      />
      <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
        Baixa tardia
      </div>
      <p className="mt-1 max-w-prose text-sm text-accent-foreground/80">
        ATENÇÃO: O evento encerrou com rádio em aberto. Ainda é possível
        registrar a devolução, mas vai ser registrada como lançamento tardio.
      </p>
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
