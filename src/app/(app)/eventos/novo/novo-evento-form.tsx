"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { criarEvento } from "../actions";

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

export function NovoEventoForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", dataInicio: "", dataFim: "" },
  });

  function onSubmit(values: Values) {
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
