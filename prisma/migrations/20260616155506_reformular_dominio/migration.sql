/*
  Warnings:

  - You are about to drop the column `codigoRadio` on the `Registro` table. All the data in the column will be lost.
  - You are about to drop the column `equipe` on the `Registro` table. All the data in the column will be lost.
  - You are about to drop the column `modeloRadio` on the `Registro` table. All the data in the column will be lost.
  - You are about to drop the column `nomeResponsavel` on the `Registro` table. All the data in the column will be lost.
  - You are about to drop the column `rgResponsavel` on the `Registro` table. All the data in the column will be lost.
  - Added the required column `radioId` to the `Registro` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recebedorId` to the `Registro` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Registro" DROP COLUMN "codigoRadio",
DROP COLUMN "equipe",
DROP COLUMN "modeloRadio",
DROP COLUMN "nomeResponsavel",
DROP COLUMN "rgResponsavel",
ADD COLUMN     "radioId" INTEGER NOT NULL,
ADD COLUMN     "recebedorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fotoPerfilUrl" TEXT;

-- CreateTable
CREATE TABLE "Radio" (
    "id" SERIAL NOT NULL,
    "numeroPatrimonio" TEXT NOT NULL,
    "numeroSerie" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "acessorios" TEXT,
    "criadoPorId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Radio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recebedor" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "rg" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "foneContato" TEXT NOT NULL,
    "criadoPorId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recebedor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Radio_numeroPatrimonio_key" ON "Radio"("numeroPatrimonio");

-- CreateIndex
CREATE INDEX "Recebedor_nome_idx" ON "Recebedor"("nome");

-- AddForeignKey
ALTER TABLE "Radio" ADD CONSTRAINT "Radio_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recebedor" ADD CONSTRAINT "Recebedor_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registro" ADD CONSTRAINT "Registro_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES "Radio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registro" ADD CONSTRAINT "Registro_recebedorId_fkey" FOREIGN KEY ("recebedorId") REFERENCES "Recebedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
