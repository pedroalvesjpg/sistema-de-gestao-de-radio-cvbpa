import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type AcaoAudit =
  // User
  | "USER_CRIADO"
  | "USER_ATUALIZADO"
  | "USER_ROLE_ALTERADO"
  | "USER_DELETADO"
  | "USER_SENHA_RESETADA"
  | "USER_PROPRIA_SENHA_TROCADA"
  // Evento
  | "EVENTO_CRIADO"
  | "EVENTO_ATUALIZADO"
  | "EVENTO_DELETADO"
  // Registro
  | "REGISTRO_CRIADO"
  | "REGISTRO_EDITADO"
  | "REGISTRO_DESVINCULADO"
  // Devolucao
  | "DEVOLUCAO_CRIADA"
  | "DEVOLUCAO_CANCELADA";

export const RotuloAcao: Record<AcaoAudit, string> = {
  USER_CRIADO: "Criou usuário",
  USER_ATUALIZADO: "Editou usuário",
  USER_ROLE_ALTERADO: "Alterou papel",
  USER_DELETADO: "Excluiu usuário",
  USER_SENHA_RESETADA: "Resetou senha",
  USER_PROPRIA_SENHA_TROCADA: "Trocou própria senha",
  EVENTO_CRIADO: "Criou evento",
  EVENTO_ATUALIZADO: "Editou evento",
  EVENTO_DELETADO: "Excluiu evento",
  REGISTRO_CRIADO: "Registrou saída de rádio",
  REGISTRO_EDITADO: "Editou registro",
  REGISTRO_DESVINCULADO: "Desvinculou rádio",
  DEVOLUCAO_CRIADA: "Marcou devolução",
  DEVOLUCAO_CANCELADA: "Cancelou devolução",
};

type EntidadeAudit = "User" | "Evento" | "Registro" | "Devolucao";

type RegistrarInput = {
  acao: AcaoAudit;
  entidade: EntidadeAudit;
  entidadeId: number;
  resumo: string;
  detalhes?: unknown;
};

/**
 * Registra uma ação no log de auditoria. Usa a sessão atual pra capturar o ator.
 * Idempotente em falha: NÃO joga exceção pra fora — auditoria nunca quebra a ação
 * principal, mas loga no console pra investigação.
 */
export async function registrarAcao(input: RegistrarInput) {
  try {
    const session = await auth();
    if (!session?.user) return;
    await prisma.auditLog.create({
      data: {
        actorId: Number(session.user.id),
        actorNome: session.user.name ?? "(sem nome)",
        acao: input.acao,
        entidade: input.entidade,
        entidadeId: input.entidadeId,
        resumo: input.resumo,
        // Prisma 7 aceita any serializable como JSON.
        detalhes: input.detalhes
          ? (JSON.parse(JSON.stringify(input.detalhes)) as object)
          : undefined,
      },
    });
  } catch (err) {
    console.error("[audit] falha ao registrar ação:", err);
  }
}
