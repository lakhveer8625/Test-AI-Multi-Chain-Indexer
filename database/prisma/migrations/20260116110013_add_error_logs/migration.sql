-- AlterTable
ALTER TABLE `indexed_events` ADD COLUMN `effective_gas_price` VARCHAR(191) NULL,
    ADD COLUMN `gas_limit` VARCHAR(191) NULL,
    ADD COLUMN `gas_price` VARCHAR(191) NULL,
    ADD COLUMN `gas_used` VARCHAR(191) NULL,
    ADD COLUMN `input` TEXT NULL,
    ADD COLUMN `max_fee_per_gas` VARCHAR(191) NULL,
    ADD COLUMN `max_priority_fee_per_gas` VARCHAR(191) NULL,
    ADD COLUMN `nonce` INTEGER NULL,
    ADD COLUMN `transaction_index` INTEGER NULL,
    ADD COLUMN `tx_type` INTEGER NULL;

-- CreateTable
CREATE TABLE `error_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `chain_id` INTEGER NULL,
    `error_type` VARCHAR(191) NOT NULL,
    `error_source` VARCHAR(191) NOT NULL,
    `error_message` TEXT NOT NULL,
    `stack_trace` TEXT NULL,
    `context` JSON NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'ERROR',
    `is_resolved` BOOLEAN NOT NULL DEFAULT false,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolved_at` DATETIME(3) NULL,

    INDEX `error_logs_error_type_idx`(`error_type`),
    INDEX `error_logs_error_source_idx`(`error_source`),
    INDEX `error_logs_chain_id_idx`(`chain_id`),
    INDEX `error_logs_created_at_idx`(`created_at`),
    INDEX `error_logs_severity_idx`(`severity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
