/*
  Warnings:

  - A unique constraint covering the columns `[validationId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `fotoUrl` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'Ativo',
    ADD COLUMN `validationId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_validationId_key` ON `User`(`validationId`);
