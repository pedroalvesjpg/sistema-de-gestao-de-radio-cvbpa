import { z } from "zod";

export const eventoSchema = z
  .object({
    nome: z.string().min(1, "Informe o nome"),
    dataInicio: z.string().min(1, "Selecione a data de início"),
    dataFim: z.string().min(1, "Selecione a data de fim"),
  })
  .refine((v) => new Date(v.dataFim) >= new Date(v.dataInicio), {
    message: "Fim deve ser depois do início",
    path: ["dataFim"],
  });
export type EventoValues = z.infer<typeof eventoSchema>;
