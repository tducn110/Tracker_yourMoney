CREATE TABLE `budget_categories` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`budget_id` bigint unsigned NOT NULL,
	`category_id` int unsigned NOT NULL,
	CONSTRAINT `budget_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`name` varchar(100) NOT NULL,
	`icon` varchar(20) NOT NULL DEFAULT '💰',
	`target_amount` decimal(15,2) NOT NULL,
	`period_type` enum('weekly','monthly','quarterly','yearly','custom') NOT NULL DEFAULT 'monthly',
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`is_all_categories` tinyint NOT NULL DEFAULT 0,
	`wallet_scope` enum('all','specific') NOT NULL DEFAULT 'all',
	`status` enum('active','finished') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `budget_categories` ADD CONSTRAINT `budget_categories_budget_id_budgets_id_fk` FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `budget_categories` ADD CONSTRAINT `budget_categories_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `idx_budget_categories` ON `budget_categories` (`budget_id`,`category_id`);--> statement-breakpoint
CREATE INDEX `uq_budget_category` ON `budget_categories` (`budget_id`,`category_id`);--> statement-breakpoint
CREATE INDEX `idx_budgets_user_status` ON `budgets` (`user_id`,`status`,`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_budgets_user_period` ON `budgets` (`user_id`,`start_date`,`end_date`);