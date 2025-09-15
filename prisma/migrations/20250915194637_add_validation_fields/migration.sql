/*
  Warnings:

  - Made the column `validationId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `validationId` VARCHAR(191) NOT NULL;
