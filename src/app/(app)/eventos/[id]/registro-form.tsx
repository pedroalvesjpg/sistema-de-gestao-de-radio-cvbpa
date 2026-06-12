"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FotoUploader } from "@/components/foto-uploader";
import { criarRegistro } from "./actions";

const schema = z.object({
  modeloRadio: z.string().min(1, "Modelo obrigatório"),
  codigoRadio: z.string().min(1, "Código obrigatório"),
  equipe: z.string().min(1, "Equipe obrigatória"),
  nomeResponsavel: z.string().min(1, "Nome obrigatório"),
  rgResponsavel: z.string().min(1, "RG obrigatório"),
  observacao: z.string().optional(),
  urlFotoRg: z.string().min(1, "Foto do RG obrigatória"),
  urlFotoRadioSaida: z.string().min(1, "Foto do rádio obrigatória"),
});

type Values = z.infer<typeof schema>;

const defaults: Values = {
  modeloRadio: "",
  codigoRadio: "",
  equipe: "",
  nomeResponsavel: "",
  rgResponsavel: "",
  observacao: "",
  urlFotoRg: "",
  urlFotoRadioSaida: "",
};

export function RegistroForm({ eventoId }: { eventoId: number }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  function onSubmit(values: Values) {
    startTransition(async () => {
      const result = await criarRegistro(eventoId, values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Saída registrada");
      form.reset(defaults);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            name="modeloRadio"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo do rádio</FormLabel>
                <FormControl>
                  <Input placeholder="Baofeng UV-82" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="codigoRadio"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="25" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          name="equipe"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipe</FormLabel>
              <FormControl>
                <Input placeholder="Equipe do Vice Presidente Abel" {...field} />
              </FormControl>
              <FormDescription>Texto livre — escreva como o responsável informar.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            name="nomeResponsavel"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do responsável</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="rgResponsavel"
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
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            name="urlFotoRg"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FotoUploader
                  tipo="rg"
                  label="Foto do RG"
                  value={field.value}
                  onChange={(p) =>
                    form.setValue("urlFotoRg", p, { shouldValidate: true })
                  }
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="urlFotoRadioSaida"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FotoUploader
                  tipo="saida"
                  label="Foto do rádio na entrega"
                  value={field.value}
                  onChange={(p) =>
                    form.setValue("urlFotoRadioSaida", p, {
                      shouldValidate: true,
                    })
                  }
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          name="observacao"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação (opcional)</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Registrando…" : "Registrar saída"}
        </Button>
      </form>
    </Form>
  );
}
