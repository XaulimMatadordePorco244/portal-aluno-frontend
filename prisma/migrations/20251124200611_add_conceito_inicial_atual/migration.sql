/*
  Warnings:

  - You are about to drop the column `conceito` on the `perfis_alunos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `perfis_alunos` DROP COLUMN `conceito`,
    ADD COLUMN `conceitoAtual` VARCHAR(191) NULL,
    ADD COLUMN `conceitoInicial` VARCHAR(191) NULL;
