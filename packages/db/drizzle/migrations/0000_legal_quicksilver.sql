CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`full_name` varchar(100) NOT NULL,
	`avatar_url` varchar(500),
	`avatar_text` varchar(5),
	`is_active` tinyint NOT NULL DEFAULT 1,
	`email_verified` tinyint NOT NULL DEFAULT 0,
	`last_login_at` timestamp,
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`token_hash` varchar(255) NOT NULL,
	`device_info` varchar(255),
	`ip_address` varchar(45),
	`expires_at` timestamp NOT NULL,
	`revoked_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `refresh_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `refresh_tokens_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`user_id` bigint unsigned NOT NULL,
	`monthly_budget` decimal(15,2) NOT NULL DEFAULT '0.00',
	`emergency_buffer` decimal(15,2) NOT NULL DEFAULT '0.00',
	`income_date` tinyint NOT NULL DEFAULT 1,
	`currency` varchar(10) NOT NULL DEFAULT 'VND',
	`language` varchar(10) NOT NULL DEFAULT 'vi',
	`timezone` varchar(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
	`theme` enum('light','dark','system') NOT NULL DEFAULT 'light',
	`notify_bill_before_days` tinyint NOT NULL DEFAULT 3,
	`notify_budget_threshold` decimal(5,2) NOT NULL DEFAULT '80.00',
	`notify_email` tinyint NOT NULL DEFAULT 1,
	`notify_push` tinyint NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_settings_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned,
	`name` varchar(50) NOT NULL,
	`type` enum('income','expense','both') NOT NULL DEFAULT 'expense',
	`icon` varchar(20) NOT NULL DEFAULT '📦',
	`color` varchar(7) NOT NULL DEFAULT '#6B7280',
	`is_default` tinyint NOT NULL DEFAULT 0,
	`sort_order` int NOT NULL DEFAULT 0,
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_category_name_user` UNIQUE(`user_id`,`name`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`category_id` int unsigned NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`type` enum('income','expense','transfer') NOT NULL,
	`note` varchar(500),
	`display_date` date NOT NULL,
	`receipt_url` varchar(500),
	`source` enum('manual','quick_add','ocr','import','recurring') NOT NULL DEFAULT 'manual',
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bill_payments` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`bill_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`period_month` char(7) NOT NULL,
	`amount_paid` decimal(15,2) NOT NULL,
	`paid_at` timestamp NOT NULL DEFAULT (now()),
	`note` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bill_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bills` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`category_id` int unsigned NOT NULL,
	`name` varchar(100) NOT NULL,
	`icon` varchar(20) NOT NULL DEFAULT '📄',
	`amount` decimal(15,2) NOT NULL,
	`due_day` tinyint NOT NULL,
	`frequency` enum('monthly','quarterly','yearly') NOT NULL DEFAULT 'monthly',
	`auto_pay` tinyint NOT NULL DEFAULT 0,
	`is_active` tinyint NOT NULL DEFAULT 1,
	`notes` text,
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`name` varchar(100) NOT NULL,
	`icon` varchar(20) NOT NULL DEFAULT '🎯',
	`target_amount` decimal(15,2) NOT NULL,
	`current_saved` decimal(15,2) NOT NULL DEFAULT '0.00',
	`monthly_contribution` decimal(15,2) NOT NULL DEFAULT '0.00',
	`deadline` date,
	`status` enum('active','completed','paused','cancelled') NOT NULL DEFAULT 'active',
	`priority` tinyint NOT NULL DEFAULT 1,
	`notes` text,
	`completed_at` timestamp,
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cash_wallet` (
	`user_id` bigint unsigned NOT NULL,
	`initial_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
	`balance` decimal(15,2) NOT NULL DEFAULT '0.00',
	`last_synced_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cash_wallet_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `cash_wallet_logs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`balance_before` decimal(15,2) NOT NULL,
	`balance_after` decimal(15,2) NOT NULL,
	`difference` decimal(15,2) NOT NULL,
	`note` varchar(255),
	`auto_tx_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cash_wallet_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned,
	`action` varchar(100) NOT NULL,
	`resource` varchar(100),
	`resource_id` varchar(50),
	`old_values` json,
	`new_values` json,
	`ip_address` varchar(45),
	`user_agent` varchar(500),
	`status` enum('success','failed') NOT NULL DEFAULT 'success',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`type` enum('bill_due','bill_overdue','budget_warning','budget_exceeded','goal_completed','goal_milestone','low_balance','s2s_negative','system','tip') NOT NULL,
	`title` varchar(150) NOT NULL,
	`body` text NOT NULL,
	`icon` varchar(20) NOT NULL DEFAULT '🔔',
	`action_url` varchar(255),
	`is_read` tinyint NOT NULL DEFAULT 0,
	`read_at` timestamp,
	`expires_at` timestamp,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `categories` ADD CONSTRAINT `categories_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `bill_payments` ADD CONSTRAINT `bill_payments_bill_id_bills_id_fk` FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `bill_payments` ADD CONSTRAINT `bill_payments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `bills` ADD CONSTRAINT `bills_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `bills` ADD CONSTRAINT `bills_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `goals` ADD CONSTRAINT `goals_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `cash_wallet` ADD CONSTRAINT `cash_wallet_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `cash_wallet_logs` ADD CONSTRAINT `cash_wallet_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `cash_wallet_logs` ADD CONSTRAINT `cash_wallet_logs_auto_tx_id_transactions_id_fk` FOREIGN KEY (`auto_tx_id`) REFERENCES `transactions`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_username` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `idx_users_active` ON `users` (`is_active`,`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_refresh_token_user` ON `refresh_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_refresh_token_hash` ON `refresh_tokens` (`token_hash`);--> statement-breakpoint
CREATE INDEX `idx_refresh_token_expiry` ON `refresh_tokens` (`expires_at`);--> statement-breakpoint
CREATE INDEX `idx_categories_user` ON `categories` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_categories_type` ON `categories` (`type`);--> statement-breakpoint
CREATE INDEX `idx_tx_user_date` ON `transactions` (`user_id`,`display_date`);--> statement-breakpoint
CREATE INDEX `idx_tx_user_type` ON `transactions` (`user_id`,`type`);--> statement-breakpoint
CREATE INDEX `idx_tx_user_cat` ON `transactions` (`user_id`,`category_id`);--> statement-breakpoint
CREATE INDEX `idx_tx_user_month` ON `transactions` (`user_id`,`display_date`,`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_tx_deleted` ON `transactions` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_bill_payments_user` ON `bill_payments` (`user_id`,`period_month`);--> statement-breakpoint
CREATE INDEX `idx_bill_payments_bill_period` ON `bill_payments` (`bill_id`,`period_month`);--> statement-breakpoint
CREATE INDEX `idx_bills_user` ON `bills` (`user_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `idx_bills_user_dueday` ON `bills` (`user_id`,`due_day`);--> statement-breakpoint
CREATE INDEX `idx_bills_deleted` ON `bills` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_goals_user_status` ON `goals` (`user_id`,`status`,`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_goals_user_deadline` ON `goals` (`user_id`,`deadline`);--> statement-breakpoint
CREATE INDEX `idx_wallet_logs_user` ON `cash_wallet_logs` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_user` ON `audit_logs` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_action` ON `audit_logs` (`action`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_resource` ON `audit_logs` (`resource`,`resource_id`);--> statement-breakpoint
CREATE INDEX `idx_notif_user_unread` ON `notifications` (`user_id`,`is_read`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_notif_user_type` ON `notifications` (`user_id`,`type`);--> statement-breakpoint
CREATE INDEX `idx_notif_expires` ON `notifications` (`expires_at`);