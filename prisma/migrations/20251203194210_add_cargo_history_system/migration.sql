-- AlterTable
ALTER TABLE `Anotacao` ADD COLUMN `blocoCargoId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `cargo_history` (
    `id` VARCHAR(191) NOT NULL,
    `alunoId` VARCHAR(191) NOT NULL,
    `cargoId` VARCHAR(191) NOT NULL,
    `cargoNomeSnapshot` VARCHAR(191) NOT NULL,
    `conceitoInicial` DOUBLE NOT NULL DEFAULT 7.0,
    `conceitoAtual` DOUBLE NOT NULL DEFAULT 7.0,
    `dataInicio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataFim` DATETIME(3) NULL,
    `status` ENUM('ATIVO', 'FECHADO', 'REVERTIDO') NOT NULL DEFAULT 'ATIVO',
    `motivo` TEXT NULL,

    INDEX `cargo_history_alunoId_dataInicio_idx`(`alunoId`, `dataInicio`),
    INDEX `cargo_history_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cargo_logs` (
    `id` VARCHAR(191) NOT NULL,
    `blocoId` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `tipo` ENUM('PROMOCAO', 'DESPROMOCAO', 'REVERSAO') NOT NULL,
    `motivo` TEXT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cargo_logs_blocoId_idx`(`blocoId`),
    INDEX `cargo_logs_adminId_idx`(`adminId`),
    INDEX `cargo_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Anotacao_blocoCargoId_idx` ON `Anotacao`(`blocoCargoId`);

-- AddForeignKey
ALTER TABLE `Anotacao` ADD CONSTRAINT `Anotacao_blocoCargoId_fkey` FOREIGN KEY (`blocoCargoId`) REFERENCES `cargo_history`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cargo_history` ADD CONSTRAINT `cargo_history_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `perfis_alunos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cargo_history` ADD CONSTRAINT `cargo_history_cargoId_fkey` FOREIGN KEY (`cargoId`) REFERENCES `Cargo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cargo_logs` ADD CONSTRAINT `cargo_logs_blocoId_fkey` FOREIGN KEY (`blocoId`) REFERENCES `cargo_history`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cargo_logs` ADD CONSTRAINT `cargo_logs_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
