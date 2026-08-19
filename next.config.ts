import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Habilita `forbidden()` / `unauthorized()` e os arquivos forbidden.tsx e
    // unauthorized.tsx. Ainda experimental no Next 16 — se sair do experimental
    // ou for removido, `requireAdmin` em src/lib/auth-guards.ts é quem depende.
    authInterrupts: true,
    serverActions: {
      // Default é 1MB; aumentamos pra suportar upload de fotos (limite real
      // do app é 5MB por arquivo, validado no client e no server).
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
