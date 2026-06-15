"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FotoUploader } from "@/components/foto/foto-uploader";
import { registroSchema, type RegistroValues } from "@/lib/schemas/registro";
import { criarRegistro } from "./actions";

const defaults: RegistroValues = {
  modeloRadio: "",
  codigoRadio: "",
  equipe: "",
  nomeResponsavel: "",
  rgResponsavel: "",
  observacao: "",
  urlFotoRg: "",
  urlFotoRadioSaida: "",
};

export function RegistroForm({
  eventoId,
  onSuccess,
}: {
  eventoId: number;
  onSuccess?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const form = useForm<RegistroValues>({
    resolver: zodResolver(registroSchema),
    defaultValues: defaults,
  });

  function onSubmit(values: RegistroValues) {
    startTransition(async () => {
      const result = await criarRegistro(eventoId, values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Saída registrada");
      form.reset(defaults);
      onSuccess?.();
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
                  <Input placeholder="Nome completo" {...field} />
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
                  <Input placeholder="00.000.000-0" {...field} />
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
                <Textarea
                  rows={2}
                  placeholder="Algo importante a registrar sobre a saída"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="w-full sm:w-auto"
        >
          {pending ? "Registrando…" : "Registrar saída"}
        </Button>
      </form>
    </Form>
  );
}
