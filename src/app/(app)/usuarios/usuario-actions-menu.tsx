"use client";

import { useState, useTransition } from "react";
import { KeyRound, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import type { Role } from "@/generated/prisma/enums";
import { alterarRole, deletarUsuario } from "./actions";
import { EditarUsuarioDialog } from "./editar-usuario-dialog";
import { ResetarSenhaDialog } from "./resetar-senha-dialog";

type Props = {
  user: {
    id: number;
    nome: string;
    email: string;
    cargo: string | null;
    role: Role;
  };
  isSelf: boolean;
};

export function UsuarioActionsMenu({ user, isSelf }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleAlterarRole(novaRole: Role) {
    startTransition(async () => {
      const result = await alterarRole(user.id, novaRole);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(
        novaRole === "ADMIN" ? "Usuário promovido" : "Usuário rebaixado",
      );
    });
  }

  function handleDeletar() {
    startTransition(async () => {
      const result = await deletarUsuario(user.id);
      if ("error" in result) {
        toast.error(result.error);
        setConfirmOpen(false);
        return;
      }
      toast.success("Usuário excluído");
      setConfirmOpen(false);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Ações de ${user.nome}`}
            >
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil />
            Editar dados
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setResetOpen(true)}>
            <KeyRound />
            Resetar senha
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {user.role === "COMUM" ? (
            <DropdownMenuItem
              onClick={() => handleAlterarRole("ADMIN")}
              disabled={pending}
            >
              Promover a Administrador
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => handleAlterarRole("COMUM")}
              disabled={pending || isSelf}
            >
              Rebaixar para Operador
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
            disabled={pending || isSelf}
          >
            <Trash2 />
            Excluir usuário
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditarUsuarioDialog
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <ResetarSenhaDialog
        user={user}
        open={resetOpen}
        onOpenChange={setResetOpen}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {user.nome}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Se o usuário tiver eventos ou
              registros vinculados, a exclusão será bloqueada — nesse caso,
              prefira rebaixar para Operador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeletar();
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
