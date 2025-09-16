/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `anoIngresso` INTEGER NULL,
    ADD COLUMN `companhia` VARCHAR(191) NULL,
    ADD COLUMN `conceito` VARCHAR(191) NULL,
    ADD COLUMN `email` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);
