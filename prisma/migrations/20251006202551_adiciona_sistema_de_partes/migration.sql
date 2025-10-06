-- CreateTable
CREATE TABLE `Parte` (
    `id` VARCHAR(191) NOT NULL,
    `assunto` VARCHAR(191) NOT NULL,
    `conteudo` TEXT NOT NULL,
    `status` ENUM('RASCUNHO', 'ENVIADA', 'ANALISADA') NOT NULL DEFAULT 'RASCUNHO',
    `autorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `dataEnvio` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Analise` (
    `id` VARCHAR(191) NOT NULL,
    `observacoes` TEXT NULL,
    `resultado` ENUM('APROVADA', 'NEGADA', 'ARQUIVADA', 'ENCAMINHADA') NOT NULL,
    `parteId` VARCHAR(191) NOT NULL,
    `analistaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogParte` (
    `id` VARCHAR(191) NOT NULL,
    `acao` VARCHAR(191) NOT NULL,
    `detalhes` VARCHAR(191) NULL,
    `parteId` VARCHAR(191) NOT NULL,
    `atorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Parte` ADD CONSTRAINT `Parte_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Analise` ADD CONSTRAINT `Analise_parteId_fkey` FOREIGN KEY (`parteId`) REFERENCES `Parte`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Analise` ADD CONSTRAINT `Analise_analistaId_fkey` FOREIGN KEY (`analistaId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogParte` ADD CONSTRAINT `LogParte_parteId_fkey` FOREIGN KEY (`parteId`) REFERENCES `Parte`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogParte` ADD CONSTRAINT `LogParte_atorId_fkey` FOREIGN KEY (`atorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
