"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { radioSchema, type RadioValues } from "@/lib/schemas/radio";
import { editarRadio } from "./actions";

type Radio = {
  id: number;
  numeroPatrimonio: string;
  numeroSerie: string;
  marca: string;
  modelo: string;
  acessorios: string | null;
};

type Props = {
  radio: Radio;
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

export function EditarRadioDialog({ radio, open, onOpenChange }: Props) {
  const [pending, startTransition] = useTransition();

  const defaults: RadioValues = {
    numeroPatrimonio: radio.numeroPatrimonio,
    numeroSerie: radio.numeroSerie,
    marca: radio.marca,
    modelo: radio.modelo,
    acessorios: radio.acessorios ?? "",
  };

  const form = useForm<RadioValues>({
    resolver: zodResolver(radioSchema),
    defaultValues: defaults,
  });

  // Repopula o form com os dados atuais sempre que reabre.
  useEffect(() => {
    if (open) form.reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, radio.id]);

  function onSubmit(values: RadioValues) {
    startTransition(async () => {
      const result = await editarRadio(radio.id, values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Rádio atualizado");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar rádio</DialogTitle>
          <DialogDescription>
            {radio.numeroPatrimonio} · {radio.marca} {radio.modelo}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                name="numeroPatrimonio"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº patrimônio</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="numeroSerie"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº série</FormLabel>
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
                name="marca"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="modelo"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              name="acessorios"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acessórios (opcional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
