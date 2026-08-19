import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type AcaoAudit =
  | "USER_CRIADO"
  | "USER_ATUALIZADO"
  | "USER_ROLE_ALTERADO"
  | "USER_DELETADO"
  | "USER_SENHA_RESETADA"
  | "USER_PROPRIA_SENHA_TROCADA"
  | "EVENTO_CRIADO"
  | "EVENTO_ATUALIZADO"
  | "EVENTO_DELETADO"
  | "RADIO_CRIADO"
  | "RADIO_ATUALIZADO"
  | "RADIO_DELETADO"
  | "RECEBEDOR_CRIADO"
  | "RECEBEDOR_ATUALIZADO"
  | "RECEBEDOR_DELETADO"
  | "REGISTRO_CRIADO"
  | "REGISTRO_EDITADO"
  | "REGISTRO_DESVINCULADO"
  | "DEVOLUCAO_CRIADA"
  | "DEVOLUCAO_CANCELADA"
  | "SOLICITACAO_APROVADA"
  | "SOLICITACAO_REJEITADA";

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
  RADIO_CRIADO: "Cadastrou rádio",
  RADIO_ATUALIZADO: "Editou rádio",
  RADIO_DELETADO: "Excluiu rádio",
  RECEBEDOR_CRIADO: "Cadastrou recebedor",
  RECEBEDOR_ATUALIZADO: "Editou recebedor",
  RECEBEDOR_DELETADO: "Excluiu recebedor",
  REGISTRO_CRIADO: "Registrou saída de rádio",
  REGISTRO_EDITADO: "Editou registro",
  REGISTRO_DESVINCULADO: "Desvinculou rádio",
  DEVOLUCAO_CRIADA: "Marcou devolução",
  DEVOLUCAO_CANCELADA: "Cancelou devolução",
  SOLICITACAO_APROVADA: "Aprovou pedido de acesso",
  SOLICITACAO_REJEITADA: "Recusou pedido de acesso",
};

// Fonte única: a tela de auditoria monta o filtro a partir daqui, então
// entidade nova nunca mais fica de fora do select por esquecimento.
export const ENTIDADES_AUDIT = [
  "User",
  "Evento",
  "Radio",
  "Recebedor",
  "Registro",
  "Devolucao",
  "SolicitacaoAcesso",
] as const;

export type EntidadeAudit = (typeof ENTIDADES_AUDIT)[number];

export const RotuloEntidade: Record<EntidadeAudit, string> = {
  User: "Usuário",
  Evento: "Evento",
  Radio: "Rádio",
  Recebedor: "Recebedor",
  Registro: "Registro",
  Devolucao: "Devolução",
  SolicitacaoAcesso: "Pedido de acesso",
};

type RegistrarInput = {
  acao: AcaoAudit;
  entidade: EntidadeAudit;
  entidadeId: number;
  resumo: string;
  detalhes?: unknown;
};

// Nunca joga exceção: auditoria não pode quebrar a ação principal.
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
        detalhes: input.detalhes
          ? (JSON.parse(JSON.stringify(input.detalhes)) as object)
          : undefined,
      },
    });
  } catch (err) {
    console.error("[audit] falha ao registrar ação:", err);
  }
}
