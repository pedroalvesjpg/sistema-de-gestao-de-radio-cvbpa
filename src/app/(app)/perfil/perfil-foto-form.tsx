"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { toast } from "sonner";
import { Camera, RotateCcw } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadFotoAction } from "@/lib/storage-actions";
import { iniciais } from "@/lib/format";
import { atualizarFotoPerfil } from "./actions";

const SAIDA_PX = 512;

export function PerfilFotoForm({
  initialUrl,
  nome,
}: {
  initialUrl: string | null;
  nome: string | null;
}) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(initialUrl);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropAreaPx, setCropAreaPx] = useState<Area | null>(null);
  const [pending, startTransition] = useTransition();

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCropAreaPx(pixels);
  }, []);

  function handlePickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setOpen(true);
    };
    reader.readAsDataURL(file);
  }

  function handleSalvar() {
    if (!imageSrc || !cropAreaPx) return;
    startTransition(async () => {
      try {
        const blob = await recortar(imageSrc, cropAreaPx);
        const file = new File([blob], "perfil.jpg", { type: "image/jpeg" });

        const fd = new FormData();
        fd.append("file", file);
        fd.append("tipo", "perfil");
        const upload = await uploadFotoAction(fd);
        if ("error" in upload) {
          toast.error(upload.error);
          return;
        }

        const result = await atualizarFotoPerfil(upload.path);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }

        toast.success("Foto atualizada");
        setCurrentUrl(URL.createObjectURL(blob));
        setImageSrc(null);
        setOpen(false);
      } catch (err) {
        console.error(err);
        toast.error("Falha ao processar a imagem.");
      }
    });
  }

  return (
    <div className="flex items-start gap-4 sm:flex-row sm:items-center">
      <Avatar className="h-24 w-24" size="default">
        {currentUrl && (
          <AvatarImage src={currentUrl} alt={nome ?? "Foto de perfil"} />
        )}
        <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">
          {iniciais(nome)}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handlePickFile}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
        >
          <Camera />
          {currentUrl ? "Trocar foto" : "Adicionar foto"}
        </Button>
        <p className="text-xs text-muted-foreground">
          JPG, PNG ou WebP até 5 MB. Recorte quadrado para o avatar.
        </p>
      </div>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) {
            setOpen(false);
            setImageSrc(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajustar foto</DialogTitle>
          </DialogHeader>

          {imageSrc && (
            <div className="space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Zoom</span>
                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1);
                      setCrop({ x: 0, y: 0 });
                    }}
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                  >
                    <RotateCcw className="size-3" />
                    Resetar
                  </button>
                </div>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={handleSalvar}
              disabled={pending || !cropAreaPx}
            >
              {pending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

async function recortar(src: string, area: Area): Promise<Blob> {
  const img = await carregar(src);

  const canvas = document.createElement("canvas");
  canvas.width = SAIDA_PX;
  canvas.height = SAIDA_PX;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas indisponível");

  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    SAIDA_PX,
    SAIDA_PX,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob falhou"))),
      "image/jpeg",
      0.9,
    );
  });
}

function carregar(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
