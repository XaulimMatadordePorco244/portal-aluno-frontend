/*
  Warnings:

  - You are about to drop the column `dataAtualização` on the `Regulamento` table. All the data in the column will be lost.
  - You are about to drop the column `dataPublicacao` on the `Regulamento` table. All the data in the column will be lost.
  - You are about to drop the column `versao` on the `Regulamento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Regulamento` DROP COLUMN `dataAtualização`,
    DROP COLUMN `dataPublicacao`,
    DROP COLUMN `versao`,
    ADD COLUMN `ativo` BOOLEAN NOT NULL DEFAULT true;
