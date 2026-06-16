import { z } from "zod";

export const recebedorSchema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  rg: z.string().min(1, "Informe o RG"),
  departamento: z.string().min(1, "Informe o departamento"),
  cargo: z.string().min(1, "Informe o cargo"),
  foneContato: z.string().min(1, "Informe o telefone"),
});
export type RecebedorValues = z.infer<typeof recebedorSchema>;
