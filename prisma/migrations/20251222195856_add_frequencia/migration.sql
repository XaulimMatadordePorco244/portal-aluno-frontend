-- CreateTable
CREATE TABLE `gm_frequencia` (
    `id` VARCHAR(191) NOT NULL,
    `alunoId` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'GERAL',
    `status` ENUM('PRESENTE', 'FALTA', 'JUSTIFICADA') NOT NULL,
    `observacao` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `gm_frequencia_alunoId_data_tipo_key`(`alunoId`, `data`, `tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `gm_frequencia` ADD CONSTRAINT `gm_frequencia_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `perfis_alunos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
