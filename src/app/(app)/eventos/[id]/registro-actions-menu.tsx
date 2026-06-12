"use client";

import { useState, useTransition } from "react";
import { MoreVertical, Pencil, RotateCcw, Unlink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cancelarDevolucao, desvincularRegistro } from "./actions";
import { EditarRegistroDialog } from "./editar-registro-dialog";

type Registro = {
  id: number;
  modeloRadio: string;
  codigoRadio: string;
  equipe: string;
  nomeResponsavel: string;
  rgResponsavel: string;
  observacao: string | null;
  devolucao: { id: number } | null;
};

type ConfirmKind = "desvincular" | "cancelarDevolucao" | null;

export function RegistroActionsMenu({ registro }: { registro: Registro }) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const [pending, startTransition] = useTransition();

  function runDesvincular() {
    startTransition(async () => {
      const result = await desvincularRegistro(registro.id);
      if ("error" in result) {
        toast.error(result.error);
        setConfirmKind(null);
        return;
      }
      toast.success("Registro desvinculado");
      setConfirmKind(null);
    });
  }

  function runCancelarDevolucao() {
    startTransition(async () => {
      const result = await cancelarDevolucao(registro.id);
      if ("error" in result) {
        toast.error(result.error);
        setConfirmKind(null);
        return;
      }
      toast.success("Devolução cancelada");
      setConfirmKind(null);
    });
  }

  const label = `${registro.modeloRadio} #${registro.codigoRadio}`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Ações de ${label}`}
            >
              <MoreVertical />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil />
            Editar registro
          </DropdownMenuItem>
          {registro.devolucao && (
            <DropdownMenuItem
              onClick={() => setConfirmKind("cancelarDevolucao")}
            >
              <RotateCcw />
              Cancelar devolução
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmKind("desvincular")}
          >
            <Unlink />
            Desvincular rádio
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditarRegistroDialog
        registro={registro}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog
        open={confirmKind !== null}
        onOpenChange={(o) => !o && setConfirmKind(null)}
      >
        <AlertDialogContent>
          {confirmKind === "desvincular" ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Desvincular {label}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Apaga o registro de saída
                  {registro.devolucao && " e a devolução vinculada"}. Use só
                  quando a saída foi registrada por engano — não tem desfazer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    runDesvincular();
                  }}
                  disabled={pending}
                  render={
                    <Button variant="destructive">
                      {pending ? "Desvinculando…" : "Desvincular"}
                    </Button>
                  }
                />
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar devolução de {label}?</AlertDialogTitle>
                <AlertDialogDescription>
                  O rádio volta ao status &quot;Em aberto&quot;. Use quando a
                  devolução tiver sido marcada por engano.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={pending}>Voltar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    runCancelarDevolucao();
                  }}
                  disabled={pending}
                  render={
                    <Button variant="destructive">
                      {pending ? "Cancelando…" : "Cancelar devolução"}
                    </Button>
                  }
                />
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
