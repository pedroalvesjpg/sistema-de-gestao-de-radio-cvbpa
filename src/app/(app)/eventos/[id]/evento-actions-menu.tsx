"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { deletarEvento } from "../actions";
import { EditarEventoDialog } from "./editar-evento-dialog";

type Props = {
  evento: { id: number; nome: string; dataInicio: Date; dataFim: Date };
};

export function EventoActionsMenu({ evento }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deletarEvento(evento.id);
      if ("error" in result) {
        toast.error(result.error);
        setConfirmOpen(false);
        return;
      }
      toast.success("Evento excluído");
      setConfirmOpen(false);
      router.push("/");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="icon" aria-label="Ações do evento">
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil />
            Editar evento
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 />
            Excluir evento
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditarEventoDialog
        evento={evento}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {evento.nome}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Se houver rádios registrados,
              será necessário desvinculá-los antes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={pending}
              render={
                <Button variant="destructive">
                  {pending ? "Excluindo…" : "Excluir"}
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
