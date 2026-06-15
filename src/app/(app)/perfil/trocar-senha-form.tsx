"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { trocarPropriaSenha } from "./actions";

const schema = z
  .object({
    senhaAtual: z.string().min(1, "Informe a senha atual"),
    novaSenha: z.string().min(6, "Pelo menos 6 caracteres"),
    confirmar: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((v) => v.novaSenha === v.confirmar, {
    message: "As senhas não coincidem",
    path: ["confirmar"],
  });

type Values = z.infer<typeof schema>;

const defaults: Values = { senhaAtual: "", novaSenha: "", confirmar: "" };

export function TrocarSenhaForm() {
  const [pending, startTransition] = useTransition();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  function onSubmit(values: Values) {
    startTransition(async () => {
      const result = await trocarPropriaSenha({
        senhaAtual: values.senhaAtual,
        novaSenha: values.novaSenha,
      });
      if ("error" in result) {
        toast.error(result.error);
        if (result?.error?.toLowerCase().includes("atual")) {
          form.setError("senhaAtual", { message: result.error });
        }
        return;
      }
      toast.success("Senha alterada com sucesso");
      form.reset(defaults);
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <FormField
          name="senhaAtual"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha atual</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="novaSenha"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova senha</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <FormDescription>Pelo menos 6 caracteres.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="confirmar"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar nova senha</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Salvando…" : "Alterar senha"}
        </Button>
      </form>
    </Form>
  );
}
