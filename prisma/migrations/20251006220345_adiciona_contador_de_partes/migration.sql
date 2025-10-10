/*
  Warnings:

  - A unique constraint covering the columns `[numeroDocumento]` on the table `Parte` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Parte` ADD COLUMN `numeroDocumento` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Configuracao` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `ultimaParteNumero` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Parte_numeroDocumento_key` ON `Parte`(`numeroDocumento`);
