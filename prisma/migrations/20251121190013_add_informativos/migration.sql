-- CreateTable
CREATE TABLE `informativos` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `arquivoUrl` VARCHAR(191) NULL,
    `nomeArquivo` VARCHAR(191) NULL,
    `dataPublicacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `autorId` VARCHAR(191) NOT NULL,

    INDEX `informativos_dataPublicacao_idx`(`dataPublicacao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `informativos` ADD CONSTRAINT `informativos_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
