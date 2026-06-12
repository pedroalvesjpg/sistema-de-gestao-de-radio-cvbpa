-- CreateEnum
CREATE TYPE "Role" AS ENUM ('COMUM', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'COMUM',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "criadoPorId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registro" (
    "id" SERIAL NOT NULL,
    "eventoId" INTEGER NOT NULL,
    "modeloRadio" TEXT NOT NULL,
    "codigoRadio" TEXT NOT NULL,
    "equipe" TEXT NOT NULL,
    "nomeResponsavel" TEXT NOT NULL,
    "rgResponsavel" TEXT NOT NULL,
    "urlFotoRg" TEXT NOT NULL,
    "urlFotoRadioSaida" TEXT NOT NULL,
    "observacao" TEXT,
    "criadoPorId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Devolucao" (
    "id" SERIAL NOT NULL,
    "registroId" INTEGER NOT NULL,
    "urlFotoRadioDevolucao" TEXT NOT NULL,
    "possuiAvaria" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "devolvidoPor" TEXT,
    "criadoPorId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Devolucao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Devolucao_registroId_key" ON "Devolucao"("registroId");

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registro" ADD CONSTRAINT "Registro_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registro" ADD CONSTRAINT "Registro_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devolucao" ADD CONSTRAINT "Devolucao_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "Registro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devolucao" ADD CONSTRAINT "Devolucao_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
