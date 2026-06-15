"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { criarDevolucao } from "./actions";

const schema = z
  .object({
    possuiAvaria: z.boolean(),
    devolvidoOutraPessoa: z.boolean(),
    devolvidoPor: z.string().optional(),
    observacao: z.string().optional(),
    urlFotoRadioDevolucao: z.string().min(1, "Foto da devolução obrigatória"),
  })
  .refine(
    (v) =>
      !v.devolvidoOutraPessoa ||
      (v.devolvidoPor && v.devolvidoPor.trim().length > 0),
    {
      message: "Informe o nome de quem devolveu",
      path: ["devolvidoPor"],
    },
  );

type Values = z.infer<typeof schema>;

const defaults: Values = {
  possuiAvaria: false,
  devolvidoOutraPessoa: false,
  devolvidoPor: "",
  observacao: "",
  urlFotoRadioDevolucao: "",
};

type Props = {
  registroId: number;
  registroLabel: string;
  responsavelPadrao: string;
};

export function DevolucaoForm({
  registroId,
  registroLabel,
  responsavelPadrao,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  function onSubmit(values: Values) {
    startTransition(async () => {
      const result = await criarDevolucao(registroId, {
        possuiAvaria: values.possuiAvaria,
        observacao: values.observacao,
        devolvidoPor: values.devolvidoOutraPessoa
          ? values.devolvidoPor
          : undefined,
        urlFotoRadioDevolucao: values.urlFotoRadioDevolucao,
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Devolução registrada");
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
      <DialogTrigger render={<Button size="sm">Marcar devolução</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar devolução</DialogTitle>
          <DialogDescription>{registroLabel}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <FormField
              name="possuiAvaria"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Rádio voltou com avaria</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              name="devolvidoOutraPessoa"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Foi devolvido por outra pessoa?</FormLabel>
                  <FormDescription>
                    Por padrão, quem retira é quem devolve ({responsavelPadrao}).
                  </FormDescription>
                  <FormControl>
                    <YesNoToggle
                      value={field.value}
                      onChange={(v) => {
                        field.onChange(v);
                        if (!v) form.setValue("devolvidoPor", "");
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("devolvidoOutraPessoa") && (
              <FormField
                name="devolvidoPor"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quem devolveu?</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              name="urlFotoRadioDevolucao"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FotoUploader
                    tipo="devolucao"
                    label="Foto do rádio na devolução"
                    value={field.value}
                    onChange={(p) =>
                      form.setValue("urlFotoRadioDevolucao", p, {
                        shouldValidate: true,
                      })
                    }
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

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
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando…" : "Confirmar devolução"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function YesNoToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const baseCls =
    "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onChange(false)}
        aria-pressed={!value}
        className={cn(
          baseCls,
          !value
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-foreground hover:bg-secondary",
        )}
      >
        Não
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        aria-pressed={value}
        className={cn(
          baseCls,
          value
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-foreground hover:bg-secondary",
        )}
      >
        Sim
      </button>
    </div>
  );
}
