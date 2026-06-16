import { z } from "zod";

export const radioSchema = z.object({
  numeroPatrimonio: z.string().min(1, "Informe o número do patrimônio"),
  numeroSerie: z.string().min(1, "Informe o número de série"),
  marca: z.string().min(1, "Informe a marca"),
  modelo: z.string().min(1, "Informe o modelo"),
  acessorios: z.string().optional(),
});
export type RadioValues = z.infer<typeof radioSchema>;
