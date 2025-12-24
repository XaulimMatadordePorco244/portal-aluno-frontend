-- CreateTable
CREATE TABLE `gm_eventos_calendario` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `data` DATETIME(3) NOT NULL,
    `tipo` ENUM('FERIADO', 'AULA_EXTRA', 'CANCELADO', 'EVENTO') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
