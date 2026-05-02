-- Migration 0013: Add version column to wallets for Optimistic Concurrency Control (OCC)
ALTER TABLE `wallets` ADD COLUMN `version` int NOT NULL DEFAULT 0;
