"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  recebedorSchema,
  type RecebedorValues,
} from "@/lib/schemas/recebedor";
import { editarRecebedor } from "./actions";

type Recebedor = {
  id: number;
  nome: string;
  rg: string;
  departamento: string;
  cargo: string;
  foneContato: string;
};

type Props = {
  recebedor: Recebedor;
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

export function EditarRecebedorDialog({
  recebedor,
  open,
  onOpenChange,
}: Props) {
  const [pending, startTransition] = useTransition();

  const defaults: RecebedorValues = {
    nome: recebedor.nome,
    rg: recebedor.rg,
    departamento: recebedor.departamento,
    cargo: recebedor.cargo,
    foneContato: recebedor.foneContato,
  };

  const form = useForm<RecebedorValues>({
    resolver: zodResolver(recebedorSchema),
    defaultValues: defaults,
  });

  // Repopula o form com os dados atuais sempre que reabre.
  useEffect(() => {
    if (open) form.reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, recebedor.id]);

  function onSubmit(values: RecebedorValues) {
    startTransition(async () => {
      const result = await editarRecebedor(recebedor.id, values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Recebedor atualizado");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar recebedor</DialogTitle>
          <DialogDescription>{recebedor.nome}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              name="nome"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                name="rg"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="foneContato"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                name="departamento"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="cargo"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="lg" disabled={pending}>
                {pending ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
