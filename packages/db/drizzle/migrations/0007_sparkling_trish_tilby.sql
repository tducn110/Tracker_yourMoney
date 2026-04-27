CREATE TABLE `budget_wallets` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`budget_id` bigint NOT NULL,
	`wallet_id` varchar(50) NOT NULL,
	CONSTRAINT `budget_wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_budget_wallet` UNIQUE(`budget_id`,`wallet_id`)
);
--> statement-breakpoint
DROP INDEX `uq_budget_category` ON `budget_categories`;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` enum('bill_due','bill_overdue','budget_warning','budget_exceeded','goal_completed','goal_milestone','low_balance','budget_negative','system','tip') NOT NULL;--> statement-breakpoint
ALTER TABLE `budget_categories` ADD CONSTRAINT `uq_budget_category` UNIQUE(`budget_id`,`category_id`);--> statement-breakpoint
ALTER TABLE `budget_wallets` ADD CONSTRAINT `budget_wallets_budget_id_budgets_id_fk` FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `idx_budget_wallets` ON `budget_wallets` (`budget_id`,`wallet_id`);