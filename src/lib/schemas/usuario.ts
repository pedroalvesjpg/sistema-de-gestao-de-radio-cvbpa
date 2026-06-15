import { z } from "zod";

export const CARGO_NENHUM = "__none__";

export const CARGO_OPCOES = [
  { value: CARGO_NENHUM, label: "Nenhum" },
  { value: "Diretor(a)", label: "Diretor(a)" },
  { value: "Coordenador(a)", label: "Coordenador(a)" },
  { value: "Auxiliar", label: "Auxiliar" },
  { value: "Voluntário(a)", label: "Voluntário(a)" },
];

export const novoUsuarioSchema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha precisa de pelo menos 6 caracteres"),
  role: z.enum(["ADMIN", "COMUM"]),
  cargo: z.string(),
});
export type NovoUsuarioValues = z.infer<typeof novoUsuarioSchema>;

export const editarUsuarioSchema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  email: z.string().email("Email inválido"),
  cargo: z.string(),
});
export type EditarUsuarioValues = z.infer<typeof editarUsuarioSchema>;
