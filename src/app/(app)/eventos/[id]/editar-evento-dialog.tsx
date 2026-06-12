"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { toDatetimeLocal } from "@/lib/format";
import { editarEvento } from "../actions";

const schema = z
  .object({
    nome: z.string().min(1, "Informe o nome"),
    dataInicio: z.string().min(1, "Selecione a data de início"),
    dataFim: z.string().min(1, "Selecione a data de fim"),
  })
  .refine((v) => new Date(v.dataFim) >= new Date(v.dataInicio), {
    message: "Fim deve ser depois do início",
    path: ["dataFim"],
  });

type Values = z.infer<typeof schema>;

type Props = {
  evento: { id: number; nome: string; dataInicio: Date; dataFim: Date };
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

export function EditarEventoDialog({ evento, open, onOpenChange }: Props) {
  const [pending, startTransition] = useTransition();

  const defaults: Values = {
    nome: evento.nome,
    dataInicio: toDatetimeLocal(evento.dataInicio),
    dataFim: toDatetimeLocal(evento.dataFim),
  };

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  // Reseta o form sempre que abrir, com os dados atuais do evento.
  const [lastOpen, setLastOpen] = useState(false);
  if (open && !lastOpen) {
    form.reset(defaults);
    setLastOpen(true);
  } else if (!open && lastOpen) {
    setLastOpen(false);
  }

  function onSubmit(values: Values) {
    startTransition(async () => {
      const result = await editarEvento(evento.id, values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Evento atualizado");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar evento</DialogTitle>
          <DialogDescription>{evento.nome}</DialogDescription>
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
                  <FormLabel>Nome do evento</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                name="dataInicio"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="dataFim"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fim</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
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
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
