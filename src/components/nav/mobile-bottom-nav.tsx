"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users } from "lucide-react";
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
    ...(isAdmin
      ? [
          {
            href: "/usuarios",
            label: "Usuários",
            icon: Users,
            match: (p: string) => p.startsWith("/usuarios"),
          },
        ]
      : []),
  ];

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
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
