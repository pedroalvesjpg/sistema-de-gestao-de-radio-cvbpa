"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CircleCheckBig } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Logo } from "@/components/brand/logo";
import { SENHA_MIN } from "@/lib/schemas/auth";
import { CARGO_OPCOES } from "@/lib/schemas/usuario";
import {
  solicitacaoSchema,
  type SolicitacaoValues,
} from "@/lib/schemas/solicitacao";
import { solicitarAcesso } from "./actions";

const defaults: SolicitacaoValues = {
  nome: "",
  email: "",
  senha: "",
  confirmar: "",
  cargo: "",
};

export function SolicitarForm() {
  const [pending, startTransition] = useTransition();
  const [enviado, setEnviado] = useState(false);

  const form = useForm<SolicitacaoValues>({
    resolver: zodResolver(solicitacaoSchema),
    defaultValues: defaults,
  });

  function onSubmit(values: SolicitacaoValues) {
    startTransition(async () => {
      const result = await solicitarAcesso(values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setEnviado(true);
    });
  }

  if (enviado) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-md border border-border bg-background p-8 text-center sm:p-10">
        <CircleCheckBig
          className="mx-auto size-10 text-emerald-700 dark:text-emerald-400"
          aria-hidden
        />
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            Pedido enviado
          </h1>
          <p className="text-sm text-muted-foreground">
            A coordenação vai avaliar seu acesso. Assim que for aprovado, você
            entra com o email e a senha que acabou de cadastrar — não é preciso
            criar nada de novo.
          </p>
        </div>
        <Button render={<Link href="/login" />} nativeButton={false}>
          Voltar para o login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-md border border-border bg-background p-8 sm:p-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <Logo variant="stacked" />
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            Solicitar acesso
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sistema Interno de Radiocomunicações
          </p>
        </div>
      </div>

      <Separator />

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
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="seu@email.org"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="cargo"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu cargo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CARGO_OPCOES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="senha"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Mínimo de {SENHA_MIN} caracteres.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="confirmar"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Enviando…" : "Enviar pedido"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Já tem acesso?{" "}
            <Link href="/login" className="font-semibold underline">
              Entrar
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
}
