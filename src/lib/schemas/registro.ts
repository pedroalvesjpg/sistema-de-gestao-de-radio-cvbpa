import { z } from "zod";

export const registroSchema = z.object({
  radioId: z
    .number({ message: "Selecione um rádio" })
    .int()
    .positive("Selecione um rádio"),
  recebedorId: z
    .number({ message: "Selecione um recebedor" })
    .int()
    .positive("Selecione um recebedor"),
  observacao: z.string().optional(),
  urlFotoRg: z.string().min(1, "Foto do RG obrigatória"),
  urlFotoRadioSaida: z.string().min(1, "Foto do rádio obrigatória"),
});
export type RegistroValues = z.infer<typeof registroSchema>;

export const devolucaoSchema = z
  .object({
    possuiAvaria: z.boolean(),
    devolvidoOutraPessoa: z.boolean(),
    devolvidoPor: z.string().optional(),
    observacao: z.string().optional(),
    urlFotoRadioDevolucao: z.string().min(1, "Foto da devolução obrigatória"),
  })
  .refine(
    (v) =>
      !v.devolvidoOutraPessoa ||
      (v.devolvidoPor && v.devolvidoPor.trim().length > 0),
    {
      message: "Informe o nome de quem devolveu",
      path: ["devolvidoPor"],
    },
  );
export type DevolucaoValues = z.infer<typeof devolucaoSchema>;
