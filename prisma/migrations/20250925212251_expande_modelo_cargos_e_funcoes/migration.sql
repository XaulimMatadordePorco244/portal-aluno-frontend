/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `Cargo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo` to the `Cargo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Cargo` ADD COLUMN `classe` ENUM('SUPERIOR', 'INTERMEDIARIO', 'SUBALTERNO') NULL,
    ADD COLUMN `codigo` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `funcaoId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Funcao` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Funcao_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Cargo_codigo_key` ON `Cargo`(`codigo`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_funcaoId_fkey` FOREIGN KEY (`funcaoId`) REFERENCES `Funcao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
