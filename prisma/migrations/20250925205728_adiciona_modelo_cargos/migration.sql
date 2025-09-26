/*
  Warnings:

  - You are about to drop the column `cargo` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `cargo`,
    ADD COLUMN `cargoId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Cargo` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` ENUM('POSTO', 'GRADUACAO') NOT NULL,
    `precedencia` INTEGER NOT NULL,

    UNIQUE INDEX `Cargo_nome_key`(`nome`),
    UNIQUE INDEX `Cargo_precedencia_key`(`precedencia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_cargoId_fkey` FOREIGN KEY (`cargoId`) REFERENCES `Cargo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
