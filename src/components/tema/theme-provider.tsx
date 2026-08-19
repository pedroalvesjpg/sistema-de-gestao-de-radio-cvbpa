"use client";

import { ThemeProvider as NextThemes } from "next-themes";

/**
 * `next-themes` já era dependência e o Toaster até lia o tema — mas ninguém
 * montava o provider, então `useTheme` sempre devolvia o padrão. Aqui ele
 * passa a existir de verdade.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}
