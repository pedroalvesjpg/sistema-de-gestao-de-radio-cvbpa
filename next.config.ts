import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default é 1MB; aumentamos pra suportar upload de fotos (limite real
      // do app é 5MB por arquivo, validado no client e no server).
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
