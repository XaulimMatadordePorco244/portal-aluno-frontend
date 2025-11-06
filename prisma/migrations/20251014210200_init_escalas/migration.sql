-- AlterTable
ALTER TABLE `Parte` MODIFY `status` ENUM('RASCUNHO', 'ENVIADA', 'ANALISADA', 'APROVADO', 'REPROVADO') NOT NULL DEFAULT 'RASCUNHO';

-- CreateTable
CREATE TABLE `escalas` (
    `id` VARCHAR(191) NOT NULL,
    `dataEscala` DATE NOT NULL,
    `tipo` ENUM('COLABORACAO', 'ESPECIAL', 'EVENTO', 'OUTRO') NOT NULL,
    `status` ENUM('RASCUNHO', 'PUBLICADA', 'FECHADA', 'ARQUIVADA') NOT NULL DEFAULT 'RASCUNHO',
    `pdfUrl` VARCHAR(191) NULL,
    `elaboradoPor` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `publicadoEm` DATETIME(3) NULL,
    `criadoPorId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `escala_itens` (
    `id` VARCHAR(191) NOT NULL,
    `secao` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191) NOT NULL,
    `horarioInicio` VARCHAR(191) NOT NULL,
    `horarioFim` VARCHAR(191) NOT NULL,
    `observacao` VARCHAR(191) NULL,
    `escalaId` VARCHAR(191) NOT NULL,
    `alunoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `escalas` ADD CONSTRAINT `escalas_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `escala_itens` ADD CONSTRAINT `escala_itens_escalaId_fkey` FOREIGN KEY (`escalaId`) REFERENCES `escalas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `escala_itens` ADD CONSTRAINT `escala_itens_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
