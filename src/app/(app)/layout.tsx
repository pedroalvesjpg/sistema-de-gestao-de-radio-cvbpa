import Link from "next/link";
import { signOut } from "@/auth";
import { requireUser } from "@/lib/auth-guards";
import { Logo } from "@/components/brand/logo";
import { MainNav } from "@/components/nav/main-nav";
import { MobileBottomNav } from "@/components/nav/mobile-bottom-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

async function logout() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

function iniciais(nome?: string | null) {
  if (!nome) return "?";
  const parts = nome.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();
  const { user } = session;
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="h-[3px] w-full bg-primary" aria-hidden />
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo variant="mark" className="h-8 w-8 shrink-0" />
              <span className="font-display text-lg font-black uppercase leading-none tracking-tight">
                RADCOM
              </span>
            </Link>
            <span className="hidden h-6 w-px bg-border md:inline" aria-hidden />
            <MainNav isAdmin={isAdmin} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-full p-1 pr-3 outline-none transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {iniciais(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <div className="text-sm font-semibold leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider leading-tight text-muted-foreground">
                  {user.cargo ||
                    (isAdmin ? "Administrador" : "Operador")}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <div className="flex flex-col gap-1 px-2 py-1.5">
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
                <span
                  className={cn(
                    "mt-1 inline-flex w-fit items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
                    isAdmin ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isAdmin ? "bg-primary" : "bg-muted-foreground/50",
                    )}
                  />
                  {isAdmin ? "Administrador" : "Operador"}
                </span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={<Link href="/perfil" />}
                nativeButton={false}
              >
                Meu perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={logout}>
                <DropdownMenuItem
                  render={<button type="submit" />}
                  nativeButton
                  className="w-full cursor-pointer"
                >
                  Sair
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-24 sm:px-6 sm:py-10 md:pb-10">
        {children}
      </main>
      <MobileBottomNav isAdmin={isAdmin} />
    </div>
  );
}
