"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Logo } from "@/components/brand/logo";
import { loginSchema, type LoginValues } from "@/lib/schemas/auth";
import { loginAction } from "./actions";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [pending, startTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    startTransition(async () => {
      const result = await loginAction({ ...values, callbackUrl });
      if (result?.error) {
        toast.error(result.error);
        form.setError("password", { message: " " });
      }
    });
  }

  return (
    <div className="w-full max-w-sm space-y-8 rounded-md border border-border bg-background p-8 sm:p-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <Logo variant="stacked" />
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            Autenticação
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
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Entrando…" : "Entrar"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Contate a coordenação para obter seus dados de acesso.
          </p>
        </form>
      </Form>
    </div>
  );
}
