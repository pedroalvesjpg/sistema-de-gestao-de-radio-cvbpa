import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { Button } from "@/components/ui/button";
import { AdminDashboard } from "./admin-dashboard";
import { EventosList } from "./eventos-list";
import { UserWelcome } from "./user-welcome";

export default async function HomePage() {
  const { user } = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const userName = user.name ?? "";

  // Antes a home trazia TODOS os registros de TODOS os eventos só para o
  // cliente fazer `.filter().length`. Com 1 evento era irrelevante; depois de
  // alguns Círios seria a tabela inteira trafegando a cada visita. Agora o
  // banco devolve dois números por evento.
  const [eventos, emAbertoPorEvento] = await Promise.all([
    prisma.evento.findMany({
      orderBy: { dataInicio: "desc" },
      include: { _count: { select: { registros: true } } },
    }),
    prisma.registro.groupBy({
      by: ["eventoId"],
      where: { devolucao: { is: null } },
      _count: { _all: true },
    }),
  ]);

  const abertosPorEvento = new Map(
    emAbertoPorEvento.map((g) => [g.eventoId, g._count._all]),
  );
  const eventosComContagem = eventos.map((e) => ({
    id: e.id,
    nome: e.nome,
    dataInicio: e.dataInicio,
    dataFim: e.dataFim,
    totalRegistros: e._count.registros,
    registrosEmAberto: abertosPorEvento.get(e.id) ?? 0,
  }));

  return (
    <div className="space-y-8">
      {isAdmin ? (
        <AdminDashboard userName={userName} />
      ) : (
        <UserWelcome userName={userName} />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            Eventos
          </h2>
          {isAdmin && (
            <Button
              render={<Link href="/eventos/novo" />}
              nativeButton={false}
            >
              Novo evento
            </Button>
          )}
        </div>

        <EventosList eventos={eventosComContagem} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
