import type { Metadata } from "next";
import { Libre_Franklin, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

/*
 * Libre Franklin é recreação open-source do Franklin Gothic — a família
 * tipográfica oficial da Cruz Vermelha Brasileira (Manual de Identidade
 * Institucional, p.16: Franklin Gothic Demi Cond + Franklin Gothic Book).
 */
const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-franklin",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RADCOM | Gestão de Rádios",
  description:
    "Sistema de empréstimo e devolução de rádios em eventos da Cruz Vermelha Brasileira",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${libreFranklin.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
