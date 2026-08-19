import { z } from "zod";
import { SENHA_MIN } from "@/lib/schemas/auth";

export const solicitacaoSchema = z
  .object({
    nome: z.string().min(1, "Informe seu nome completo"),
    email: z.string().email("Email inválido"),
    // A pessoa escolhe a própria senha já no pedido: quando a coordenação
    // aprovar, ela entra direto, sem ninguém combinar senha por fora.
    senha: z.string().min(SENHA_MIN, `Pelo menos ${SENHA_MIN} caracteres`),
    confirmar: z.string().min(1, "Confirme a senha"),
    cargo: z.string().min(1, "Selecione seu cargo"),
    justificativa: z.string().optional(),
  })
  .refine((v) => v.senha === v.confirmar, {
    message: "As senhas não coincidem",
    path: ["confirmar"],
  });

export type SolicitacaoValues = z.infer<typeof solicitacaoSchema>;

export const recusaSchema = z.object({
  motivo: z.string().optional(),
});
