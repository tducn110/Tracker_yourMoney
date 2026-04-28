-- Migration 0012: Sync database schema to ERD (Phase 1 → Phase 2 bridge)
--
-- This migration:
--   1. Creates wallets + wallet_logs tables (replacing cash_wallet + cash_wallet_logs)
--   2. Migrates data from old tables to new tables
--   3. Adds wallet_id, goal_id to transactions
--   4. Re-adds idempotency_key columns (reverts migration 0011)
--   5. Adds allocated_amount to budget_categories
--   6. Drops old cash_wallet + cash_wallet_logs tables

-- STEP 1: Create wallets table (multi-wallet architecture)
CREATE TABLE `wallets` (
  `id` bigint unsigned AUTO_INCREMENT NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('cash','bank','credit','e_wallet','investment','other') NOT NULL DEFAULT 'cash',
  `balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `initial_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `icon` varchar(50) NOT NULL DEFAULT '💵',
  `color` varchar(7) NOT NULL DEFAULT '#6B7280',
  `is_default` tinyint NOT NULL DEFAULT 0,
  `deleted_at` timestamp,
  `last_synced_at` timestamp,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
  CONSTRAINT `chk_wallets_balance_non_negative` CHECK (`balance` >= 0),
  CONSTRAINT `chk_wallets_initial_non_negative` CHECK (`initial_balance` >= 0)
);

-- STEP 2: Create wallet_logs table
CREATE TABLE `wallet_logs` (
  `id` bigint unsigned AUTO_INCREMENT NOT NULL,
  `wallet_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `transaction_id` bigint unsigned,
  `balance_before` decimal(15,2) NOT NULL,
  `balance_after` decimal(15,2) NOT NULL,
  `difference` decimal(15,2) NOT NULL,
  `note` varchar(255),
  `idempotency_key` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `wallet_logs_id` PRIMARY KEY(`id`),
  CONSTRAINT `wallet_logs_idempotency_key_unique` UNIQUE(`idempotency_key`)
);

-- STEP 3: Migrate data from cash_wallet to wallets
INSERT INTO `wallets` (`user_id`, `name`, `type`, `balance`, `initial_balance`, `icon`, `color`, `is_default`, `last_synced_at`, `created_at`, `updated_at`)
SELECT
  `user_id`,
  'Cash',
  'cash',
  `balance`,
  `initial_balance`,
  '💵',
  '#6B7280',
  1,
  `last_synced_at`,
  `created_at`,
  `updated_at`
FROM `cash_wallet`;

-- STEP 4: Migrate data from cash_wallet_logs to wallet_logs
-- Note: idempotency_key was already dropped from cash_wallet_logs by migration 0011,
-- so we can't select it. New rows get NULL idempotency_key.
INSERT INTO `wallet_logs` (`wallet_id`, `user_id`, `transaction_id`, `balance_before`, `balance_after`, `difference`, `note`, `created_at`)
SELECT
  (SELECT `id` FROM `wallets` WHERE `wallets`.`user_id` = `cwl`.`user_id` LIMIT 1),
  `cwl`.`user_id`,
  `cwl`.`auto_tx_id`,
  `cwl`.`balance_before`,
  `cwl`.`balance_after`,
  `cwl`.`difference`,
  `cwl`.`note`,
  `cwl`.`created_at`
FROM `cash_wallet_logs` `cwl`;

-- STEP 5: Drop old cash_wallet + cash_wallet_logs (drop FKs first)
ALTER TABLE `cash_wallet_logs` DROP FOREIGN KEY `cash_wallet_logs_auto_tx_id_transactions_id_fk`;
ALTER TABLE `cash_wallet_logs` DROP FOREIGN KEY `cash_wallet_logs_user_id_users_id_fk`;
ALTER TABLE `cash_wallet` DROP FOREIGN KEY `cash_wallet_user_id_users_id_fk`;
DROP TABLE `cash_wallet_logs`;
DROP TABLE `cash_wallet`;

-- STEP 6: Add wallet_id and goal_id to transactions
ALTER TABLE `transactions` ADD `wallet_id` bigint unsigned;
ALTER TABLE `transactions` ADD `goal_id` bigint unsigned;

-- Backfill wallet_id for existing transactions
UPDATE `transactions` `t`
SET `t`.`wallet_id` = (
  SELECT `w`.`id` FROM `wallets` `w` WHERE `w`.`user_id` = `t`.`user_id` LIMIT 1
);

-- Make wallet_id NOT NULL after backfill
ALTER TABLE `transactions` MODIFY COLUMN `wallet_id` bigint unsigned NOT NULL;

-- STEP 7: Re-add idempotency_key columns (revert migration 0011)
ALTER TABLE `transactions` ADD `idempotency_key` varchar(255);
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_idempotency_key_unique` UNIQUE(`idempotency_key`);
ALTER TABLE `bill_payments` ADD `idempotency_key` varchar(255);
ALTER TABLE `bill_payments` ADD CONSTRAINT `bill_payments_idempotency_key_unique` UNIQUE(`idempotency_key`);
ALTER TABLE `bills` ADD `idempotency_key` varchar(255);
ALTER TABLE `bills` ADD CONSTRAINT `bills_idempotency_key_unique` UNIQUE(`idempotency_key`);
ALTER TABLE `goals` ADD `idempotency_key` varchar(255);
ALTER TABLE `goals` ADD CONSTRAINT `goals_idempotency_key_unique` UNIQUE(`idempotency_key`);

-- STEP 8: Add allocated_amount to budget_categories
ALTER TABLE `budget_categories` ADD `allocated_amount` decimal(15,2) NOT NULL DEFAULT '0.00';

-- STEP 9: Add foreign keys for new columns
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `wallet_logs` ADD CONSTRAINT `wallet_logs_wallet_id_wallets_id_fk` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `wallet_logs` ADD CONSTRAINT `wallet_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `wallet_logs` ADD CONSTRAINT `wallet_logs_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE set null ON UPDATE cascade;
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_wallet_id_wallets_id_fk` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE restrict ON UPDATE cascade;
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_goal_id_goals_id_fk` FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON DELETE set null ON UPDATE cascade;

-- STEP 10: Create indexes for new tables
CREATE INDEX `idx_wallets_user_type` ON `wallets` (`user_id`,`type`);
CREATE INDEX `idx_wallets_user_default` ON `wallets` (`user_id`,`is_default`);
CREATE INDEX `idx_wallets_user_deleted` ON `wallets` (`user_id`,`deleted_at`);
CREATE INDEX `idx_wallet_logs_wallet` ON `wallet_logs` (`wallet_id`,`created_at`);
CREATE INDEX `idx_wallet_logs_user` ON `wallet_logs` (`user_id`,`created_at`);
CREATE INDEX `idx_wallet_logs_tx` ON `wallet_logs` (`transaction_id`);
