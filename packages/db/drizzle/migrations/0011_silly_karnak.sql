ALTER TABLE `transactions` DROP INDEX `transactions_idempotency_key_unique`;--> statement-breakpoint
ALTER TABLE `bill_payments` DROP INDEX `bill_payments_idempotency_key_unique`;--> statement-breakpoint
ALTER TABLE `bills` DROP INDEX `bills_idempotency_key_unique`;--> statement-breakpoint
ALTER TABLE `goals` DROP INDEX `goals_idempotency_key_unique`;--> statement-breakpoint
ALTER TABLE `cash_wallet_logs` DROP INDEX `cash_wallet_logs_idempotency_key_unique`;--> statement-breakpoint
ALTER TABLE `budget_categories` MODIFY COLUMN `id` bigint unsigned AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `budget_categories` MODIFY COLUMN `budget_id` bigint unsigned NOT NULL;--> statement-breakpoint
ALTER TABLE `budgets` MODIFY COLUMN `id` bigint unsigned AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `budgets` MODIFY COLUMN `user_id` bigint unsigned NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` DROP COLUMN `idempotency_key`;--> statement-breakpoint
ALTER TABLE `bill_payments` DROP COLUMN `idempotency_key`;--> statement-breakpoint
ALTER TABLE `bills` DROP COLUMN `idempotency_key`;--> statement-breakpoint
ALTER TABLE `goals` DROP COLUMN `idempotency_key`;--> statement-breakpoint
ALTER TABLE `cash_wallet_logs` DROP COLUMN `idempotency_key`;