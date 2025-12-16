-- CreateTable
CREATE TABLE `DesempenhoEscolar` (
    `id` VARCHAR(191) NOT NULL,
    `alunoId` VARCHAR(191) NOT NULL,
    `anoLetivo` INTEGER NOT NULL,
    `escola` VARCHAR(191) NULL,
    `serie` VARCHAR(191) NULL,
    `mediaB1` DOUBLE NULL,
    `faltasB1` INTEGER NOT NULL DEFAULT 0,
    `mediaB2` DOUBLE NULL,
    `faltasB2` INTEGER NOT NULL DEFAULT 0,
    `mediaB3` DOUBLE NULL,
    `faltasB3` INTEGER NOT NULL DEFAULT 0,
    `mediaB4` DOUBLE NULL,
    `faltasB4` INTEGER NOT NULL DEFAULT 0,
    `qtdNotasVermelhas` INTEGER NOT NULL DEFAULT 0,
    `observacoes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DesempenhoEscolar` ADD CONSTRAINT `DesempenhoEscolar_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `perfis_alunos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
