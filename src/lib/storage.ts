import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type TipoFoto = "rg" | "saida" | "devolucao" | "perfil";

export const BUCKET = "fotos-radios";
export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const SIGNED_URL_TTL = 3600; // 1 hora

let cached: SupabaseClient | null = null;

// service_role bypassa RLS — nunca importar deste módulo no client.
function client(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY faltando no .env.",
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export async function uploadFoto(file: File, tipo: TipoFoto): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    throw new Error("Tipo de arquivo não suportado. Use JPG, PNG ou WebP.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Arquivo grande demais (máximo 5 MB).");
  }

  const ext =
    file.type === "image/jpeg"
      ? "jpg"
      : file.type === "image/png"
        ? "png"
        : "webp";
  const path = `${tipo}/${crypto.randomUUID()}.${ext}`;

  const { error } = await client()
    .storage.from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Falha no upload: ${error.message}`);
  return path;
}

// `placeholder://` marca registros pré-storage; retorna null sem assinar.
export async function getSignedUrl(
  path: string,
  expiresIn = SIGNED_URL_TTL,
): Promise<string | null> {
  if (!path || path.startsWith("placeholder://")) return null;
  const { data, error } = await client()
    .storage.from(BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) {
    console.error("[storage] failed to sign:", path, error.message);
    return null;
  }
  return data.signedUrl;
}

// Silencioso em falha: auditoria já guarda o path apagado.
export async function deleteFoto(path: string): Promise<void> {
  if (!path || path.startsWith("placeholder://")) return;
  const { error } = await client().storage.from(BUCKET).remove([path]);
  if (error) console.error("[storage] failed to delete:", path, error.message);
}
