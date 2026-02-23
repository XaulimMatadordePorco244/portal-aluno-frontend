/*
  Warnings:

  - You are about to drop the column `anoIngresso` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `cargoId` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `companhiaId` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `conceito` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `funcaoId` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `nomeDeGuerra` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `usuarios` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Anotacao` DROP FOREIGN KEY `Anotacao_alunoId_fkey`;

-- DropForeignKey
ALTER TABLE `escala_itens` DROP FOREIGN KEY `escala_itens_alunoId_fkey`;

-- DropForeignKey
ALTER TABLE `usuarios` DROP FOREIGN KEY `usuarios_cargoId_fkey`;

-- DropForeignKey
ALTER TABLE `usuarios` DROP FOREIGN KEY `usuarios_companhiaId_fkey`;

-- DropForeignKey
ALTER TABLE `usuarios` DROP FOREIGN KEY `usuarios_funcaoId_fkey`;

-- DropIndex
DROP INDEX `usuarios_cargoId_fkey` ON `usuarios`;

-- DropIndex
DROP INDEX `usuarios_companhiaId_fkey` ON `usuarios`;

-- DropIndex
DROP INDEX `usuarios_funcaoId_fkey` ON `usuarios`;

-- DropIndex
DROP INDEX `usuarios_numero_key` ON `usuarios`;

-- AlterTable
ALTER TABLE `usuarios` DROP COLUMN `anoIngresso`,
    DROP COLUMN `cargoId`,
    DROP COLUMN `companhiaId`,
    DROP COLUMN `conceito`,
    DROP COLUMN `funcaoId`,
    DROP COLUMN `nomeDeGuerra`,
    DROP COLUMN `numero`,
    ADD COLUMN `dataNascimento` DATE NULL,
    ADD COLUMN `rg` VARCHAR(191) NULL,
    ADD COLUMN `rgEstadoEmissor` VARCHAR(191) NULL,
    ADD COLUMN `telefone` VARCHAR(191) NULL,
    MODIFY `role` ENUM('ALUNO', 'ADMIN', 'RESPONSAVEL') NOT NULL;

-- CreateTable
CREATE TABLE `perfis_alunos` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NULL,
    `conceito` VARCHAR(191) NULL,
    `anoIngresso` INTEGER NULL,
    `nomeDeGuerra` VARCHAR(191) NULL,
    `tipagemSanguinea` VARCHAR(191) NULL,
    `aptidaoFisicaStatus` ENUM('LIBERADO', 'LIBERADO_COM_RESTRICOES', 'VETADO') NULL,
    `aptidaoFisicaLaudo` BOOLEAN NOT NULL DEFAULT false,
    `aptidaoFisicaObs` TEXT NULL,
    `escola` VARCHAR(191) NULL,
    `serieEscolar` VARCHAR(191) NULL,
    `endereco` TEXT NULL,
    `termoResponsabilidadeAssinado` BOOLEAN NOT NULL DEFAULT false,
    `fazCursoExterno` BOOLEAN NOT NULL DEFAULT false,
    `cursoExternoDescricao` TEXT NULL,
    `cargoId` VARCHAR(191) NULL,
    `funcaoId` VARCHAR(191) NULL,
    `companhiaId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `perfis_alunos_usuarioId_key`(`usuarioId`),
    UNIQUE INDEX `perfis_alunos_numero_key`(`numero`),
    INDEX `perfis_alunos_cargoId_idx`(`cargoId`),
    INDEX `perfis_alunos_funcaoId_idx`(`funcaoId`),
    INDEX `perfis_alunos_companhiaId_idx`(`companhiaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `responsabilidades` (
    `id` VARCHAR(191) NOT NULL,
    `responsavelId` VARCHAR(191) NOT NULL,
    `alunoId` VARCHAR(191) NOT NULL,
    `tipoParentesco` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `responsabilidades_responsavelId_idx`(`responsavelId`),
    INDEX `responsabilidades_alunoId_idx`(`alunoId`),
    UNIQUE INDEX `responsabilidades_responsavelId_alunoId_key`(`responsavelId`, `alunoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `perfis_alunos` ADD CONSTRAINT `perfis_alunos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perfis_alunos` ADD CONSTRAINT `perfis_alunos_funcaoId_fkey` FOREIGN KEY (`funcaoId`) REFERENCES `Funcao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perfis_alunos` ADD CONSTRAINT `perfis_alunos_cargoId_fkey` FOREIGN KEY (`cargoId`) REFERENCES `Cargo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perfis_alunos` ADD CONSTRAINT `perfis_alunos_companhiaId_fkey` FOREIGN KEY (`companhiaId`) REFERENCES `companhias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `responsabilidades` ADD CONSTRAINT `responsabilidades_responsavelId_fkey` FOREIGN KEY (`responsavelId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `responsabilidades` ADD CONSTRAINT `responsabilidades_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Anotacao` ADD CONSTRAINT `Anotacao_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `perfis_alunos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `escala_itens` ADD CONSTRAINT `escala_itens_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `perfis_alunos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
