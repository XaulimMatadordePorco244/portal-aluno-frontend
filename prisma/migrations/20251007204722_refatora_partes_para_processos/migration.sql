-- AlterTable
ALTER TABLE `Parte` ADD COLUMN `tipo` ENUM('GENERICO', 'TROCA_DE_ESCALA', 'RECLAMACAO', 'ATO_DE_BRAVURA', 'RECONSIDERACAO_ATO_DE_BRAVURA') NOT NULL DEFAULT 'GENERICO';

-- CreateTable
CREATE TABLE `EtapaProcesso` (
    `id` VARCHAR(191) NOT NULL,
    `processoId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `responsavelId` VARCHAR(191) NULL,
    `conteudo` TEXT NULL,
    `decisao` VARCHAR(191) NULL,
    `dataConclusao` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EtapaProcesso` ADD CONSTRAINT `EtapaProcesso_processoId_fkey` FOREIGN KEY (`processoId`) REFERENCES `Parte`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EtapaProcesso` ADD CONSTRAINT `EtapaProcesso_responsavelId_fkey` FOREIGN KEY (`responsavelId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
