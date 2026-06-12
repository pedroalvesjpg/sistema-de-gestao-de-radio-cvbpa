"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { resetarSenhaUsuario } from "./actions";

const schema = z
  .object({
    novaSenha: z.string().min(6, "Pelo menos 6 caracteres"),
    confirmar: z.string().min(1, "Confirme a senha"),
  })
  .refine((v) => v.novaSenha === v.confirmar, {
    message: "As senhas não coincidem",
    path: ["confirmar"],
  });

type Values = z.infer<typeof schema>;
const defaults: Values = { novaSenha: "", confirmar: "" };

type Props = {
  user: { id: number; nome: string };
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

export function ResetarSenhaDialog({ user, open, onOpenChange }: Props) {
  const [pending, startTransition] = useTransition();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) form.reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user.id]);

  function onSubmit(values: Values) {
    startTransition(async () => {
      const result = await resetarSenhaUsuario(user.id, values.novaSenha);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Senha resetada — informe a nova ao usuário");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resetar senha de {user.nome}</DialogTitle>
          <DialogDescription>
            Defina uma senha provisória. Você precisa comunicar a nova senha à
            pessoa por um canal seguro.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              name="novaSenha"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
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
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
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
                {pending ? "Salvando…" : "Resetar senha"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
