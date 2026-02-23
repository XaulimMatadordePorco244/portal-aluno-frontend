/*
  Warnings:

  - A unique constraint covering the columns `[alunoId,anoLetivo]` on the table `DesempenhoEscolar` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `DesempenhoEscolar` ADD COLUMN `mediaFinal` DOUBLE NULL,
    ADD COLUMN `situacao` VARCHAR(191) NULL,
    ADD COLUMN `totalFaltas` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX `DesempenhoEscolar_alunoId_anoLetivo_key` ON `DesempenhoEscolar`(`alunoId`, `anoLetivo`);
