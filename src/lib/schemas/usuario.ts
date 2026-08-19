import { z } from "zod";
import { SENHA_MIN } from "@/lib/schemas/auth";

export const CARGO_OPCOES = [
  { value: "Diretor(a)", label: "Diretor(a)" },
  { value: "Coordenador(a)", label: "Coordenador(a)" },
  { value: "Auxiliar", label: "Auxiliar" },
  { value: "Voluntário(a)", label: "Voluntário(a)" },
];

export const novoUsuarioSchema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  email: z.string().email("Email inválido"),
  senha: z
    .string()
    .min(SENHA_MIN, `Senha precisa de pelo menos ${SENHA_MIN} caracteres`),
  role: z.enum(["ADMIN", "COMUM"]),
  cargo: z.string().min(1, "Selecione um cargo"),
});
export type NovoUsuarioValues = z.infer<typeof novoUsuarioSchema>;

export const editarUsuarioSchema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  email: z.string().email("Email inválido"),
  cargo: z.string().min(1, "Selecione um cargo"),
});
export type EditarUsuarioValues = z.infer<typeof editarUsuarioSchema>;
