/*
  Warnings:

  - Added the required column `dataFim` to the `QES` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataInicio` to the `QES` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `QES` ADD COLUMN `dataFim` DATETIME(3) NOT NULL,
    ADD COLUMN `dataInicio` DATETIME(3) NOT NULL;
