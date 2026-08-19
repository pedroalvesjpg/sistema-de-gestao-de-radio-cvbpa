"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { descartarFotoAction } from "@/lib/storage-actions";
import {
  RegistroForm,
  type RadioOpcao,
  type RecebedorOpcao,
} from "./registro-form";

type Props = {
  eventoId: number;
  radios: RadioOpcao[];
  recebedores: RecebedorOpcao[];
  /** Quantos rádios existem mas estão fora, para explicar a lista curta. */
  radiosEmCampo: number;
};

export function RegistroDialog({
  eventoId,
  radios,
  recebedores,
  radiosEmCampo,
}: Props) {
  const [open, setOpen] = useState(false);
  // As fotos sobem assim que o operador escolhe, antes do envio — o que é bom
  // em 4G ruim, porque já estão no bucket quando ele confirma. O custo é que
  // formulário abandonado deixa arquivo sem dono, e são fotos de RG. O rastreio
  // fica aqui, no dialog, para sobreviver ao desmonte do conteúdo ao fechar.
  const enviadasRef = useRef<string[]>([]);

  function fecharSemSalvar() {
    const pendentes = enviadasRef.current;
    enviadasRef.current = [];
    for (const path of pendentes) {
      descartarFotoAction(path).catch(() => {});
    }
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) setOpen(true);
        else fecharSemSalvar();
      }}
    >
      <DialogTrigger
        render={
          <Button size="lg">
            <Plus />
            Registrar saída
          </Button>
        }
      />
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Registrar saída</DialogTitle>
        </DialogHeader>
        <RegistroForm
          eventoId={eventoId}
          radios={radios}
          recebedores={recebedores}
          radiosEmCampo={radiosEmCampo}
          onFotoEnviada={(path) => enviadasRef.current.push(path)}
          onSuccess={() => {
            // Viraram registro: não são mais pendentes.
            enviadasRef.current = [];
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
