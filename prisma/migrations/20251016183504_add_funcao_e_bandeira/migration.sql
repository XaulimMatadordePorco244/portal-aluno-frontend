-- AlterTable
ALTER TABLE `escala_itens` ADD COLUMN `bandeira` ENUM('BR', 'MS', 'NV') NULL;

-- AlterTable
ALTER TABLE `escalas` MODIFY `tipo` ENUM('COLABORACAO', 'ESPECIAL', 'EVENTO', 'PERSONALIZADO', 'OUTRO') NOT NULL;
