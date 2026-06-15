"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { eventoSchema, type EventoValues } from "@/lib/schemas/evento";
import { criarEvento } from "../actions";

export function NovoEventoForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<EventoValues>({
    resolver: zodResolver(eventoSchema),
    defaultValues: { nome: "", dataInicio: "", dataFim: "" },
  });

  function onSubmit(values: EventoValues) {
    startTransition(async () => {
      const result = await criarEvento(values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Evento criado");
      router.push(`/eventos/${result.eventoId}`);
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        <FormField
          name="nome"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do evento</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Círio de Nazaré 2026" {...field} />
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
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Criando…" : "Criar evento"}
        </Button>
      </form>
    </Form>
  );
}
