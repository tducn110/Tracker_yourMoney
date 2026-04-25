ALTER TABLE `budget_categories` MODIFY COLUMN `id` bigint AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `budget_categories` MODIFY COLUMN `budget_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `budget_categories` MODIFY COLUMN `category_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `budgets` MODIFY COLUMN `id` bigint AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `budgets` MODIFY COLUMN `user_id` bigint NOT NULL;