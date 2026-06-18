"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, ImageUp, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadFotoAction } from "@/lib/storage-actions";
import type { TipoFoto } from "@/lib/storage";

type Props = {
  tipo: TipoFoto;
  /** Path da foto atual (vazio = nenhuma foto). */
  value: string;
  onChange: (path: string) => void;
  label: string;
  /** Em edição, o valor inicial já é um path do bucket — sem preview local. */
  disabled?: boolean;
};

export function FotoUploader({
  tipo,
  value,
  onChange,
  label,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFile(file: File | undefined) {
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    startTransition(async () => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("tipo", tipo);
      const result = await uploadFotoAction(fd);
      if ("error" in result) {
        toast.error(result.error);
        setPreviewUrl(null);
        return;
      }
      onChange(result.path);
    });
  }

  const isPlaceholder = value.startsWith("placeholder://");
  const hasFotoServer = !!value && !isPlaceholder;
  const showThumbnail = previewUrl;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-start gap-3 rounded-md border border-dashed border-input p-3">
        <div
          className={cn(
            "grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted/30",
          )}
        >
          {showThumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Pré-visualização"
              className="h-full w-full object-cover"
            />
          ) : hasFotoServer ? (
            <Check className="size-7 text-emerald-700" />
          ) : (
            <ImageUp className="size-7 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled || pending}
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || pending}
            onClick={() => inputRef.current?.click()}
          >
            {pending ? (
              <>
                <Loader2 className="animate-spin" />
                Enviando…
              </>
            ) : hasFotoServer || showThumbnail ? (
              <>
                <RefreshCw />
                Trocar foto
              </>
            ) : (
              <>
                <ImageUp />
                Escolher foto
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            {isPlaceholder
              ? "Sem foto cadastrada. Adicione agora."
              : hasFotoServer
                ? "Foto carregada. Clique em trocar pra substituir."
                : "JPG, PNG ou WebP, até 5 MB."}
          </p>
        </div>
      </div>
    </div>
  );
}
