"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Eventos", match: (p: string) => p === "/" || p.startsWith("/eventos") },
    ...(isAdmin
      ? [
          { href: "/usuarios", label: "Usuários", match: (p: string) => p.startsWith("/usuarios") },
          { href: "/auditoria", label: "Auditoria", match: (p: string) => p.startsWith("/auditoria") },
        ]
      : []),
  ];

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
