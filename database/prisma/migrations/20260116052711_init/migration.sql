-- CreateTable
CREATE TABLE `chains` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chain_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `rpc_url` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `chains_chain_id_key`(`chain_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chain_id` INTEGER NOT NULL,
    `block_number` BIGINT NOT NULL,
    `hash` VARCHAR(66) NOT NULL,
    `parent_hash` VARCHAR(66) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `is_canonical` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `blocks_timestamp_idx`(`timestamp`),
    UNIQUE INDEX `blocks_chain_id_block_number_key`(`chain_id`, `block_number`),
    UNIQUE INDEX `blocks_chain_id_hash_key`(`chain_id`, `hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contracts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chain_id` INTEGER NOT NULL,
    `address` VARCHAR(42) NOT NULL,
    `type` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `contracts_chain_id_address_key`(`chain_id`, `address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `raw_events` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `chain_id` INTEGER NOT NULL,
    `block_number` BIGINT NOT NULL,
    `tx_hash` VARCHAR(66) NOT NULL,
    `log_index` INTEGER NOT NULL,
    `event_signature` VARCHAR(191) NULL,
    `data` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `raw_events_chain_id_block_number_idx`(`chain_id`, `block_number`),
    UNIQUE INDEX `raw_events_chain_id_tx_hash_log_index_key`(`chain_id`, `tx_hash`, `log_index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `indexed_events` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `chain_id` INTEGER NOT NULL,
    `block_number` BIGINT NOT NULL,
    `tx_hash` VARCHAR(66) NOT NULL,
    `log_index` INTEGER NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `contract_address` VARCHAR(191) NOT NULL,
    `from` VARCHAR(42) NULL,
    `to` VARCHAR(42) NULL,
    `value` VARCHAR(191) NULL,
    `token_id` VARCHAR(191) NULL,
    `amount` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `is_canonical` BOOLEAN NOT NULL DEFAULT true,
    `version` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `indexed_events_chain_id_event_type_timestamp_idx`(`chain_id`, `event_type`, `timestamp`),
    INDEX `indexed_events_timestamp_idx`(`timestamp`),
    INDEX `indexed_events_from_idx`(`from`),
    INDEX `indexed_events_to_idx`(`to`),
    UNIQUE INDEX `indexed_events_chain_id_tx_hash_log_index_version_key`(`chain_id`, `tx_hash`, `log_index`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blocks` ADD CONSTRAINT `blocks_chain_id_fkey` FOREIGN KEY (`chain_id`) REFERENCES `chains`(`chain_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_chain_id_fkey` FOREIGN KEY (`chain_id`) REFERENCES `chains`(`chain_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `raw_events` ADD CONSTRAINT `raw_events_chain_id_fkey` FOREIGN KEY (`chain_id`) REFERENCES `chains`(`chain_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `indexed_events` ADD CONSTRAINT `indexed_events_chain_id_fkey` FOREIGN KEY (`chain_id`) REFERENCES `chains`(`chain_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
