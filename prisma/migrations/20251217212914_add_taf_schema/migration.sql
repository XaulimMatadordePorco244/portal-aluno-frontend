-- CreateTable
CREATE TABLE `taf_tabela` (
    `id` VARCHAR(191) NOT NULL,
    `genero` ENUM('MASCULINO', 'FEMININO') NOT NULL,
    `exercicio` VARCHAR(191) NOT NULL,
    `tipoMedida` ENUM('TEMPO_SEG', 'REPETICOES') NOT NULL,
    `valorMinimo` DOUBLE NOT NULL,
    `valorMaximo` DOUBLE NULL,
    `nota` DOUBLE NOT NULL,
    `anoLetivo` INTEGER NOT NULL DEFAULT 2025,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `taf_tabela_genero_exercicio_anoLetivo_idx`(`genero`, `exercicio`, `anoLetivo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taf_desempenho` (
    `id` VARCHAR(191) NOT NULL,
    `alunoId` VARCHAR(191) NOT NULL,
    `anoLetivo` INTEGER NOT NULL,
    `bimestre` INTEGER NOT NULL,
    `dataRealizacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `abdominalQtd` INTEGER NOT NULL,
    `abdominalNota` DOUBLE NOT NULL,
    `apoioTipo` VARCHAR(191) NOT NULL,
    `apoioValor` DOUBLE NOT NULL,
    `apoioNota` DOUBLE NOT NULL,
    `corridaTempo` INTEGER NOT NULL,
    `corridaNota` DOUBLE NOT NULL,
    `mediaFinal` DOUBLE NOT NULL,
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `taf_desempenho_alunoId_anoLetivo_bimestre_key`(`alunoId`, `anoLetivo`, `bimestre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `taf_desempenho` ADD CONSTRAINT `taf_desempenho_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `perfis_alunos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
