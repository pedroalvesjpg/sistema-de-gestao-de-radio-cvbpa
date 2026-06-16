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

  const eventos = await prisma.evento.findMany({
    orderBy: { dataInicio: "desc" },
    include: {
      _count: { select: { registros: true } },
      registros: { select: { devolucao: { select: { id: true } } } },
    },
  });

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

        <EventosList eventos={eventos} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
