"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { editarRegistro } from "./actions";
import type { RecebedorOpcao } from "./registro-form";

type Props = {
  registro: {
    id: number;
    observacao: string | null;
    radio: { numeroPatrimonio: string };
    recebedor: { id: number; nome: string };
  };
  recebedores: RecebedorOpcao[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

export function EditarRegistroDialog({
  registro,
  recebedores,
  open,
  onOpenChange,
}: Props) {
  // O pai só monta este componente quando abre, então o estado já nasce do
  // registro atual — reabrir depois de cancelar não traz o rascunho anterior,
  // e não é preciso um efeito ressincronizando em cima de `open`.
  const [recebedorId, setRecebedorId] = useState(registro.recebedor.id);
  const [observacao, setObservacao] = useState(registro.observacao ?? "");
  const [pending, startTransition] = useTransition();

  function salvar() {
    startTransition(async () => {
      const result = await editarRegistro(registro.id, {
        recebedorId,
        observacao,
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(
        "semMudanca" in result ? "Nada mudou" : "Registro atualizado",
      );
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar registro</DialogTitle>
          <DialogDescription>
            Rádio {registro.radio.numeroPatrimonio}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`recebedor-${registro.id}`}>Recebedor</Label>
            <Combobox
              id={`recebedor-${registro.id}`}
              items={recebedores}
              value={recebedorId}
              onChange={setRecebedorId}
              getKey={(r) => r.id}
              getSearchText={(r) => `${r.nome} ${r.departamento}`}
              renderItem={(r) => (
                <>
                  {r.nome}{" "}
                  <span className="text-muted-foreground">
                    · {r.departamento}
                  </span>
                </>
              )}
              placeholder="Selecione um recebedor…"
              searchPlaceholder="Buscar por nome ou departamento…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`obs-${registro.id}`}>Observação</Label>
            <Textarea
              id={`obs-${registro.id}`}
              rows={2}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Algo importante a registrar sobre a saída"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            O rádio e as fotos não mudam — elas são a prova da entrega. Para
            trocar o rádio, desvincule e registre a saída de novo. A alteração
            fica na auditoria com o antes e o depois.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={salvar} disabled={pending}>
            {pending ? "Salvando…" : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
