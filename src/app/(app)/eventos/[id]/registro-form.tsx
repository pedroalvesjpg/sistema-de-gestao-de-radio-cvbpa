"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Combobox } from "@/components/ui/combobox";
import { FotoUploader } from "@/components/foto/foto-uploader";
import { registroSchema, type RegistroValues } from "@/lib/schemas/registro";
import { criarRegistro } from "./actions";

export type RadioOpcao = {
  id: number;
  numeroPatrimonio: string;
  marca: string;
  modelo: string;
};

export type RecebedorOpcao = {
  id: number;
  nome: string;
  departamento: string;
};

type Props = {
  eventoId: number;
  radios: RadioOpcao[];
  recebedores: RecebedorOpcao[];
  onSuccess?: () => void;
};

const defaults: RegistroValues = {
  radioId: 0,
  recebedorId: 0,
  observacao: "",
  urlFotoRg: "",
  urlFotoRadioSaida: "",
};

export function RegistroForm({
  eventoId,
  radios,
  recebedores,
  onSuccess,
}: Props) {
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

  if (radios.length === 0 || recebedores.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
        {radios.length === 0 && (
          <p>
            Nenhum rádio cadastrado. Cadastre em <strong>Rádios</strong> antes
            de registrar uma saída.
          </p>
        )}
        {recebedores.length === 0 && (
          <p>
            Nenhum recebedor cadastrado. Cadastre em{" "}
            <strong>Recebedores</strong> antes de registrar uma saída.
          </p>
        )}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <FormField
          name="radioId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rádio</FormLabel>
              <FormControl>
                <Combobox
                  items={radios}
                  value={field.value || null}
                  onChange={field.onChange}
                  getKey={(r) => r.id}
                  getSearchText={(r) =>
                    `${r.numeroPatrimonio} ${r.marca} ${r.modelo}`
                  }
                  renderItem={(r) => (
                    <>
                      <span className="font-mono font-bold uppercase tracking-wider">
                        {r.numeroPatrimonio}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        · {r.marca} {r.modelo}
                      </span>
                    </>
                  )}
                  placeholder="Selecione um rádio…"
                  searchPlaceholder="Buscar por patrimônio, marca, modelo…"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="recebedorId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recebedor</FormLabel>
              <FormControl>
                <Combobox
                  items={recebedores}
                  value={field.value || null}
                  onChange={field.onChange}
                  getKey={(r) => r.id}
                  getSearchText={(r) => `${r.nome} ${r.departamento}`}
                  renderItem={(r) => (
                    <>
                      {r.nome}{" "}
                      <span className="text-muted-foreground">
                        · {r.departamento}
                      </span>
                    </>
                  )}
                  placeholder="Selecione um recebedor…"
                  searchPlaceholder="Buscar por nome ou departamento…"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
