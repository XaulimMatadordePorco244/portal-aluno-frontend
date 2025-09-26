/*
  Warnings:

  - A unique constraint covering the columns `[abreviacao]` on the table `Cargo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `abreviacao` to the `Cargo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Cargo` ADD COLUMN `abreviacao` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Cargo_abreviacao_key` ON `Cargo`(`abreviacao`);
