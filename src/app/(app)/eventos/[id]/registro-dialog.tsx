"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  RegistroForm,
  type RadioOpcao,
  type RecebedorOpcao,
} from "./registro-form";

type Props = {
  eventoId: number;
  radios: RadioOpcao[];
  recebedores: RecebedorOpcao[];
};

export function RegistroDialog({ eventoId, radios, recebedores }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
