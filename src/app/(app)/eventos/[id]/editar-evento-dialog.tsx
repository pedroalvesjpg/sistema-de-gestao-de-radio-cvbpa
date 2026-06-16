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
import { toDatetimeLocal } from "@/lib/format";
import { eventoSchema, type EventoValues } from "@/lib/schemas/evento";
import { editarEvento } from "../actions";

type Props = {
  evento: { id: number; nome: string; dataInicio: Date; dataFim: Date };
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

export function EditarEventoDialog({ evento, open, onOpenChange }: Props) {
  const [pending, startTransition] = useTransition();

  const defaults: EventoValues = {
    nome: evento.nome,
    dataInicio: toDatetimeLocal(evento.dataInicio),
    dataFim: toDatetimeLocal(evento.dataFim),
  };

  const form = useForm<EventoValues>({
    resolver: zodResolver(eventoSchema),
    defaultValues: defaults,
  });

  // Repopula o form com os dados atuais sempre que reabre.
  useEffect(() => {
    if (open) form.reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, evento.id]);

  function onSubmit(values: EventoValues) {
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
