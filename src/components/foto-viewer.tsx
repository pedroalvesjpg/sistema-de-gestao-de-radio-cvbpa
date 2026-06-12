"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { gerarSignedUrls } from "@/lib/storage-actions";

type Foto = { label: string; path: string };

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  titulo: string;
  fotos: Foto[];
};

export function FotoViewer({ open, onOpenChange, titulo, fotos }: Props) {
  const [loading, setLoading] = useState(true);
  const [urls, setUrls] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const paths = fotos.map((f) => f.path).filter((p) => !!p);
    gerarSignedUrls(paths)
      .then((res) => setUrls(res))
      .finally(() => setLoading(false));
  }, [open, fotos]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Fotos do registro</DialogTitle>
          <DialogDescription>{titulo}</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="grid place-items-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fotos.map((f) => {
              const url = urls[f.path];
              return (
                <FotoCard key={f.label} label={f.label} url={url} path={f.path} />
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FotoCard({
  label,
  url,
  path,
}: {
  label: string;
  url: string | null | undefined;
  path: string;
}) {
  if (!url) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium">{label}</div>
        <div className="grid aspect-square place-items-center rounded-md border bg-muted/40 text-xs text-muted-foreground">
          {path.startsWith("placeholder://")
            ? "Sem foto (registro antigo)"
            : "Falha ao carregar"}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Abrir <ExternalLink className="size-3" />
        </a>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={label}
          className="aspect-square w-full rounded-md border object-cover transition hover:opacity-90"
        />
      </a>
    </div>
  );
}
