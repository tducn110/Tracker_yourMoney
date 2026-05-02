-- Migration 0015: Performance indexes for Phase 25 (Giai đoạn 3)
-- Adds FK indexes that were missing on transactions and bills tables

ALTER TABLE `transactions` ADD INDEX `idx_tx_wallet` (`wallet_id`);
ALTER TABLE `transactions` ADD INDEX `idx_tx_goal` (`goal_id`);
ALTER TABLE `bills` ADD INDEX `idx_bills_category` (`category_id`);
