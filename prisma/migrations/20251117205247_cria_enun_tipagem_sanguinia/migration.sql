/*
  Warnings:

  - You are about to alter the column `tipagemSanguinea` on the `perfis_alunos` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.

*/
-- AlterTable
ALTER TABLE `perfis_alunos` MODIFY `tipagemSanguinea` ENUM('A_POSITIVO', 'A_NEGATIVO', 'B_POSITIVO', 'B_NEGATIVO', 'AB_POSITIVO', 'AB_NEGATIVO', 'O_POSITIVO', 'O_NEGATIVO') NULL;
