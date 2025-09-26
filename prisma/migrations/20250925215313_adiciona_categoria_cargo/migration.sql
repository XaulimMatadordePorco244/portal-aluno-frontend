/*
  Warnings:

  - Added the required column `categoria` to the `Cargo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Cargo` ADD COLUMN `categoria` ENUM('FORMACAO', 'QUADRO') NOT NULL;
