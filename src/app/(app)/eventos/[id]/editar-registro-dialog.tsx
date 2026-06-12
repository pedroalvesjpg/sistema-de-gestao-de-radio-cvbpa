"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { FotoUploader } from "@/components/foto-uploader";
import { editarRegistro } from "./actions";

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

type RegistroParaEditar = {
  id: number;
  modeloRadio: string;
  codigoRadio: string;
  equipe: string;
  nomeResponsavel: string;
  rgResponsavel: string;
  observacao: string | null;
  urlFotoRg: string;
  urlFotoRadioSaida: string;
};

type Props = {
  registro: RegistroParaEditar;
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

export function EditarRegistroDialog({ registro, open, onOpenChange }: Props) {
  const [pending, startTransition] = useTransition();

  const defaults: Values = {
    modeloRadio: registro.modeloRadio,
    codigoRadio: registro.codigoRadio,
    equipe: registro.equipe,
    nomeResponsavel: registro.nomeResponsavel,
    rgResponsavel: registro.rgResponsavel,
    observacao: registro.observacao ?? "",
    urlFotoRg: registro.urlFotoRg,
    urlFotoRadioSaida: registro.urlFotoRadioSaida,
  };

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) form.reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, registro.id]);

  function onSubmit(values: Values) {
    startTransition(async () => {
      const result = await editarRegistro(registro.id, values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Registro atualizado");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar registro</DialogTitle>
          <DialogDescription>
            {registro.modeloRadio} · #{registro.codigoRadio}
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
                name="modeloRadio"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo do rádio</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                    <Input {...field} />
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
