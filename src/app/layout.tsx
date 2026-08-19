import type { Metadata, Viewport } from "next";
import { Libre_Franklin, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/tema/theme-provider";
import "./globals.css";

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
  applicationName: "RADCOM",
  appleWebApp: {
    capable: true,
    title: "RADCOM",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF0000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // next-themes escreve a classe do tema no <html> antes da hidratação;
    // sem isto o React acusa divergência entre servidor e cliente.
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${libreFranklin.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
