"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { criarRadio } from "./actions";

const defaults: RadioValues = {
  numeroPatrimonio: "",
  numeroSerie: "",
  marca: "",
  modelo: "",
  acessorios: "",
};

export function NovoRadioDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<RadioValues>({
    resolver: zodResolver(radioSchema),
    defaultValues: defaults,
  });

  function onSubmit(values: RadioValues) {
    startTransition(async () => {
      const result = await criarRadio(values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Rádio cadastrado");
      setOpen(false);
      form.reset(defaults);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) form.reset(defaults);
      }}
    >
      <DialogTrigger
        render={
          <Button size="lg">
            <Plus />
            Novo rádio
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo rádio</DialogTitle>
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
                      <Input placeholder="B01" {...field} />
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
                      <Input placeholder="SN-1234567" {...field} />
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
                      <Input placeholder="Baofeng" {...field} />
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
                      <Input placeholder="UV-82" {...field} />
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
                    <Textarea
                      rows={2}
                      placeholder="Microfone de lapela, antena extra, carregador"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="lg" disabled={pending}>
                {pending ? "Salvando…" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
