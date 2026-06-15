import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe a senha"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const trocarSenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, "Informe a senha atual"),
    novaSenha: z.string().min(6, "Pelo menos 6 caracteres"),
    confirmar: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((v) => v.novaSenha === v.confirmar, {
    message: "As senhas não coincidem",
    path: ["confirmar"],
  });
export type TrocarSenhaValues = z.infer<typeof trocarSenhaSchema>;

export const resetarSenhaSchema = z
  .object({
    novaSenha: z.string().min(6, "Pelo menos 6 caracteres"),
    confirmar: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((v) => v.novaSenha === v.confirmar, {
    message: "As senhas não coincidem",
    path: ["confirmar"],
  });
export type ResetarSenhaValues = z.infer<typeof resetarSenhaSchema>;
