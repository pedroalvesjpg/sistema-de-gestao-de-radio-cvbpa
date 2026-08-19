-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA');

-- CreateTable
CREATE TABLE "SolicitacaoAcesso" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "cargo" TEXT,
    "justificativa" TEXT,
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decididoEm" TIMESTAMP(3),
    "decididoPorId" INTEGER,
    "decididoPorNome" TEXT,
    "motivoRecusa" TEXT,

    CONSTRAINT "SolicitacaoAcesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TentativaLogin" (
    "id" SERIAL NOT NULL,
    "chave" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TentativaLogin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SolicitacaoAcesso_status_criadoEm_idx" ON "SolicitacaoAcesso"("status", "criadoEm");

-- CreateIndex
CREATE INDEX "SolicitacaoAcesso_email_idx" ON "SolicitacaoAcesso"("email");

-- CreateIndex
CREATE INDEX "TentativaLogin_chave_criadoEm_idx" ON "TentativaLogin"("chave", "criadoEm");

-- AddForeignKey
ALTER TABLE "SolicitacaoAcesso" ADD CONSTRAINT "SolicitacaoAcesso_decididoPorId_fkey" FOREIGN KEY ("decididoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
