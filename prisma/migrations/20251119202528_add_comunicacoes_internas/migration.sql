-- CreateTable
CREATE TABLE `comunicacoes_internas` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `assunto` VARCHAR(191) NOT NULL,
    `resumo` TEXT NULL,
    `arquivoUrl` VARCHAR(191) NOT NULL,
    `nomeArquivoGerado` VARCHAR(191) NOT NULL,
    `anoReferencia` INTEGER NOT NULL,
    `numeroSequencial` INTEGER NOT NULL,
    `dataPublicacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `autorId` VARCHAR(191) NOT NULL,

    INDEX `comunicacoes_internas_dataPublicacao_idx`(`dataPublicacao`),
    INDEX `comunicacoes_internas_assunto_idx`(`assunto`),
    UNIQUE INDEX `comunicacoes_internas_anoReferencia_numeroSequencial_key`(`anoReferencia`, `numeroSequencial`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `comunicacoes_internas` ADD CONSTRAINT `comunicacoes_internas_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
