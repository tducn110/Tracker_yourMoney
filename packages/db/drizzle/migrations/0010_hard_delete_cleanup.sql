DROP INDEX `idx_tx_deleted` ON `transactions`;--> statement-breakpoint
DROP INDEX `idx_bills_deleted` ON `bills`;--> statement-breakpoint
DROP INDEX `idx_tx_user_month` ON `transactions`;--> statement-breakpoint
DROP INDEX `idx_goals_user_status` ON `goals`;--> statement-breakpoint
DROP INDEX `idx_budgets_user_status` ON `budgets`;--> statement-breakpoint
CREATE INDEX `idx_tx_user_month` ON `transactions` (`user_id`,`display_date`);--> statement-breakpoint
CREATE INDEX `idx_goals_user_status` ON `goals` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_budgets_user_status` ON `budgets` (`user_id`,`status`);--> statement-breakpoint
ALTER TABLE `categories` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `transactions` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `bills` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `goals` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `budgets` DROP COLUMN `deleted_at`;