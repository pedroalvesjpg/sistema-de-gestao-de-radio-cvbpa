"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import {
  ALLOWED_TYPES,
  MAX_BYTES,
  deleteFoto,
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
 * Apaga uma foto que subiu mas nunca chegou a ser salva — formulário
 * abandonado ou foto trocada antes do envio. Sem isso, cada tentativa deixa
 * lixo permanente no bucket, e como são fotos de RG isso é problema de LGPD,
 * não só de espaço.
 *
 * Nunca apaga o que está referenciado no banco: foto de um registro salvo é
 * prova do ato de entrega e não pode sumir por um descarte de formulário.
 */
export async function descartarFotoAction(path: string) {
  await requireUser();

  const alvo = path.trim();
  if (!alvo || alvo.startsWith("placeholder://")) {
    return { ok: true } as const;
  }

  const [emRegistro, emDevolucao, emPerfil] = await Promise.all([
    prisma.registro.count({
      where: { OR: [{ urlFotoRg: alvo }, { urlFotoRadioSaida: alvo }] },
    }),
    prisma.devolucao.count({ where: { urlFotoRadioDevolucao: alvo } }),
    prisma.user.count({ where: { fotoPerfilUrl: alvo } }),
  ]);

  if (emRegistro + emDevolucao + emPerfil > 0) {
    return { ok: false, motivo: "foto em uso" } as const;
  }

  await deleteFoto(alvo);
  return { ok: true } as const;
}

export async function gerarSignedUrls(paths: string[]) {
  await requireUser();
  const urls = await Promise.all(paths.map((p) => getSignedUrl(p)));
  return paths.reduce<Record<string, string | null>>((acc, p, i) => {
    acc[p] = urls[i];
    return acc;
  }, {});
}
