"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, History, IdCard, Radio, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const items = [
    {
      href: "/",
      label: "Eventos",
      icon: Calendar,
      match: (p: string) => p === "/" || p.startsWith("/eventos"),
    },
    {
      href: "/radios",
      label: "Rádios",
      icon: Radio,
      match: (p: string) => p.startsWith("/radios"),
    },
    {
      href: "/recebedores",
      label: "Pessoas",
      icon: IdCard,
      match: (p: string) => p.startsWith("/recebedores"),
    },
    ...(isAdmin
      ? [
          {
            href: "/usuarios",
            label: "Usuários",
            icon: Users,
            match: (p: string) => p.startsWith("/usuarios"),
          },
          {
            href: "/auditoria",
            label: "Auditoria",
            icon: History,
            match: (p: string) => p.startsWith("/auditoria"),
          },
        ]
      : []),
  ];

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed px-6 inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href} className="relative flex-1">
              {active && (
                <span
                  className="absolute inset-x-0 top-0 h-[2px] bg-primary"
                  aria-hidden
                />
              )}
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
