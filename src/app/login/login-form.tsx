"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Logo } from "@/components/brand/logo";
import { loginAction } from "./actions";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe a senha"),
});

type Values = z.infer<typeof schema>;

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [pending, startTransition] = useTransition();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: Values) {
    startTransition(async () => {
      const result = await loginAction({ ...values, callbackUrl });
      if (result?.error) {
        toast.error(result.error);
        form.setError("password", { message: " " });
      }
    });
  }

  return (
    <Card className="w-full max-w-sm bg-card text-card-foreground shadow-2xl lg:shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex flex-col items-center gap-4 justify-center lg:hidden">
          <Logo variant="stacked" />
          <Separator className="w-full" />
          <h1 className="font-[family-name:var(--font-montserrat)] text- font-semibold tracking-tight">
            RADCOM - Sistema de Gestão de Rádios
          </h1>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl">Autenticação</CardTitle>
          <CardDescription>
            Use as credenciais cadastradas pela coordenação.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
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
                      placeholder="******"
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
