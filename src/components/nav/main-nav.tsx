"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const items = [
    {
      href: "/",
      label: "Eventos",
      match: (p: string) => p === "/" || p.startsWith("/eventos"),
    },
    {
      href: "/radios",
      label: "Rádios",
      match: (p: string) => p.startsWith("/radios"),
    },
    {
      href: "/recebedores",
      label: "Recebedores",
      match: (p: string) => p.startsWith("/recebedores"),
    },
    ...(isAdmin
      ? [
          {
            href: "/usuarios",
            label: "Usuários",
            match: (p: string) => p.startsWith("/usuarios"),
          },
          {
            href: "/auditoria",
            label: "Auditoria",
            match: (p: string) => p.startsWith("/auditoria"),
          },
        ]
      : []),
  ];

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative py-1 text-xs font-bold uppercase tracking-wider transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
            {active && (
              <span className="absolute -bottom-[14px] inset-x-0 h-[2px] bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
