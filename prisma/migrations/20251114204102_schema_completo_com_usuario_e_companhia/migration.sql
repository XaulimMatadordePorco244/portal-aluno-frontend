/*
  Warnings:

  - You are about to alter the column `status` on the `EtapaProcesso` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(8))`.
  - You are about to drop the column `atualizadoEm` on the `escalas` table. All the data in the column will be lost.
  - You are about to drop the column `criadoEm` on the `escalas` table. All the data in the column will be lost.
  - You are about to drop the column `publicadoEm` on the `escalas` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `escalas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Analise` DROP FOREIGN KEY `Analise_analistaId_fkey`;

-- DropForeignKey
ALTER TABLE `Analise` DROP FOREIGN KEY `Analise_parteId_fkey`;

-- DropForeignKey
ALTER TABLE `Anotacao` DROP FOREIGN KEY `Anotacao_alunoId_fkey`;

-- DropForeignKey
ALTER TABLE `Anotacao` DROP FOREIGN KEY `Anotacao_autorId_fkey`;

-- DropForeignKey
ALTER TABLE `EtapaProcesso` DROP FOREIGN KEY `EtapaProcesso_processoId_fkey`;

-- DropForeignKey
ALTER TABLE `EtapaProcesso` DROP FOREIGN KEY `EtapaProcesso_responsavelId_fkey`;

-- DropForeignKey
ALTER TABLE `LogParte` DROP FOREIGN KEY `LogParte_atorId_fkey`;

-- DropForeignKey
ALTER TABLE `LogParte` DROP FOREIGN KEY `LogParte_parteId_fkey`;

-- DropForeignKey
ALTER TABLE `Parte` DROP FOREIGN KEY `Parte_autorId_fkey`;

-- DropForeignKey
ALTER TABLE `QES` DROP FOREIGN KEY `QES_autorId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_cargoId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_funcaoId_fkey`;

-- DropForeignKey
ALTER TABLE `escala_itens` DROP FOREIGN KEY `escala_itens_alunoId_fkey`;

-- DropForeignKey
ALTER TABLE `escalas` DROP FOREIGN KEY `escalas_criadoPorId_fkey`;

-- AlterTable
ALTER TABLE `EtapaProcesso` MODIFY `status` ENUM('PENDENTE', 'EM_ANALISE', 'CONCLUIDA') NOT NULL DEFAULT 'PENDENTE';

-- AlterTable
ALTER TABLE `escalas` DROP COLUMN `atualizadoEm`,
    DROP COLUMN `criadoEm`,
    DROP COLUMN `publicadoEm`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `publishedAt` DATETIME(3) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(11) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NULL,
    `conceito` VARCHAR(191) NULL,
    `anoIngresso` INTEGER NULL,
    `email` VARCHAR(191) NULL,
    `fotoUrl` VARCHAR(191) NULL,
    `validationId` VARCHAR(191) NOT NULL,
    `nomeDeGuerra` VARCHAR(191) NULL,
    `cargoId` VARCHAR(191) NULL,
    `funcaoId` VARCHAR(191) NULL,
    `companhiaId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `passwordResetToken` VARCHAR(191) NULL,
    `passwordResetExpires` DATETIME(3) NULL,
    `status` ENUM('ATIVO', 'INATIVO', 'SUSPENSO') NOT NULL DEFAULT 'ATIVO',
    `role` ENUM('ALUNO', 'ADMIN') NOT NULL DEFAULT 'ALUNO',

    UNIQUE INDEX `usuarios_cpf_key`(`cpf`),
    UNIQUE INDEX `usuarios_numero_key`(`numero`),
    UNIQUE INDEX `usuarios_email_key`(`email`),
    UNIQUE INDEX `usuarios_validationId_key`(`validationId`),
    UNIQUE INDEX `usuarios_passwordResetToken_key`(`passwordResetToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companhias` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `abreviacao` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `companhias_nome_key`(`nome`),
    UNIQUE INDEX `companhias_abreviacao_key`(`abreviacao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_funcaoId_fkey` FOREIGN KEY (`funcaoId`) REFERENCES `Funcao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_cargoId_fkey` FOREIGN KEY (`cargoId`) REFERENCES `Cargo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_companhiaId_fkey` FOREIGN KEY (`companhiaId`) REFERENCES `companhias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Anotacao` ADD CONSTRAINT `Anotacao_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Anotacao` ADD CONSTRAINT `Anotacao_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QES` ADD CONSTRAINT `QES_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Parte` ADD CONSTRAINT `Parte_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Analise` ADD CONSTRAINT `Analise_parteId_fkey` FOREIGN KEY (`parteId`) REFERENCES `Parte`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Analise` ADD CONSTRAINT `Analise_analistaId_fkey` FOREIGN KEY (`analistaId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogParte` ADD CONSTRAINT `LogParte_parteId_fkey` FOREIGN KEY (`parteId`) REFERENCES `Parte`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogParte` ADD CONSTRAINT `LogParte_atorId_fkey` FOREIGN KEY (`atorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EtapaProcesso` ADD CONSTRAINT `EtapaProcesso_processoId_fkey` FOREIGN KEY (`processoId`) REFERENCES `Parte`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EtapaProcesso` ADD CONSTRAINT `EtapaProcesso_responsavelId_fkey` FOREIGN KEY (`responsavelId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `escalas` ADD CONSTRAINT `escalas_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `escala_itens` ADD CONSTRAINT `escala_itens_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Analise` RENAME INDEX `Analise_analistaId_fkey` TO `Analise_analistaId_idx`;

-- RenameIndex
ALTER TABLE `Analise` RENAME INDEX `Analise_parteId_fkey` TO `Analise_parteId_idx`;

-- RenameIndex
ALTER TABLE `Anotacao` RENAME INDEX `Anotacao_alunoId_fkey` TO `Anotacao_alunoId_idx`;

-- RenameIndex
ALTER TABLE `Anotacao` RENAME INDEX `Anotacao_autorId_fkey` TO `Anotacao_autorId_idx`;

-- RenameIndex
ALTER TABLE `Anotacao` RENAME INDEX `Anotacao_tipoId_fkey` TO `Anotacao_tipoId_idx`;

-- RenameIndex
ALTER TABLE `EtapaProcesso` RENAME INDEX `EtapaProcesso_processoId_fkey` TO `EtapaProcesso_processoId_idx`;

-- RenameIndex
ALTER TABLE `EtapaProcesso` RENAME INDEX `EtapaProcesso_responsavelId_fkey` TO `EtapaProcesso_responsavelId_idx`;

-- RenameIndex
ALTER TABLE `LogParte` RENAME INDEX `LogParte_atorId_fkey` TO `LogParte_atorId_idx`;

-- RenameIndex
ALTER TABLE `LogParte` RENAME INDEX `LogParte_parteId_fkey` TO `LogParte_parteId_idx`;

-- RenameIndex
ALTER TABLE `Parte` RENAME INDEX `Parte_autorId_fkey` TO `Parte_autorId_idx`;

-- RenameIndex
ALTER TABLE `QES` RENAME INDEX `QES_autorId_fkey` TO `QES_autorId_idx`;

-- RenameIndex
ALTER TABLE `escala_itens` RENAME INDEX `escala_itens_alunoId_fkey` TO `escala_itens_alunoId_idx`;

-- RenameIndex
ALTER TABLE `escala_itens` RENAME INDEX `escala_itens_escalaId_fkey` TO `escala_itens_escalaId_idx`;

-- RenameIndex
ALTER TABLE `escalas` RENAME INDEX `escalas_criadoPorId_fkey` TO `escalas_criadoPorId_idx`;
