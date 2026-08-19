import { z } from "zod";

/**
 * Mínimo de senha. Subiu de 6 para 10 junto com o freio de força bruta: são
 * poucos usuários e a troca é barata, mas o sistema guarda RG e foto de gente.
 * Vale só para senha nova — as antigas seguem funcionando até a próxima troca.
 */
export const SENHA_MIN = 10;

const senhaNova = z
  .string()
  .min(SENHA_MIN, `Pelo menos ${SENHA_MIN} caracteres`);

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe a senha"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const trocarSenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, "Informe a senha atual"),
    novaSenha: senhaNova,
    confirmar: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((v) => v.novaSenha === v.confirmar, {
    message: "As senhas não coincidem",
    path: ["confirmar"],
  });
export type TrocarSenhaValues = z.infer<typeof trocarSenhaSchema>;

export const resetarSenhaSchema = z
  .object({
    novaSenha: senhaNova,
    confirmar: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((v) => v.novaSenha === v.confirmar, {
    message: "As senhas não coincidem",
    path: ["confirmar"],
  });
export type ResetarSenhaValues = z.infer<typeof resetarSenhaSchema>;
