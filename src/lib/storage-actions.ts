"use server";

import { requireUser } from "@/lib/auth-guards";
import {
  ALLOWED_TYPES,
  MAX_BYTES,
  getSignedUrl,
  uploadFoto,
  type TipoFoto,
} from "@/lib/storage";

const TIPOS: TipoFoto[] = ["rg", "saida", "devolucao", "perfil"];

export async function uploadFotoAction(formData: FormData) {
  await requireUser();

  const file = formData.get("file");
  const tipoRaw = formData.get("tipo");

  if (!(file instanceof File)) {
    return { error: "Arquivo não enviado." } as const;
  }
  if (typeof tipoRaw !== "string" || !TIPOS.includes(tipoRaw as TipoFoto)) {
    return { error: "Tipo inválido." } as const;
  }
  if (file.size === 0) {
    return { error: "Arquivo vazio." } as const;
  }
  if (file.size > MAX_BYTES) {
    return { error: "Arquivo grande demais (máximo 5 MB)." } as const;
  }
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return { error: "Use JPG, PNG ou WebP." } as const;
  }

  try {
    const path = await uploadFoto(file, tipoRaw as TipoFoto);
    return { ok: true, path } as const;
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Falha no upload.",
    } as const;
  }
}

/**
 * Gera signed URLs pra um conjunto de paths. Usado pelo viewer de fotos
 * quando o usuário clica em "Ver fotos" num registro.
 */
export async function gerarSignedUrls(paths: string[]) {
  await requireUser();
  const urls = await Promise.all(paths.map((p) => getSignedUrl(p)));
  return paths.reduce<Record<string, string | null>>((acc, p, i) => {
    acc[p] = urls[i];
    return acc;
  }, {});
}
