ALTER TABLE `bill_payments` ADD CONSTRAINT `bill_payments_idempotency_key_unique` UNIQUE(`idempotency_key`);--> statement-breakpoint
ALTER TABLE `bills` ADD CONSTRAINT `bills_idempotency_key_unique` UNIQUE(`idempotency_key`);--> statement-breakpoint
ALTER TABLE `goals` ADD CONSTRAINT `goals_idempotency_key_unique` UNIQUE(`idempotency_key`);--> statement-breakpoint
ALTER TABLE `cash_wallet_logs` ADD CONSTRAINT `cash_wallet_logs_idempotency_key_unique` UNIQUE(`idempotency_key`);--> statement-breakpoint
ALTER TABLE `bill_payments` ADD `idempotency_key` varchar(255);--> statement-breakpoint
ALTER TABLE `bills` ADD `idempotency_key` varchar(255);--> statement-breakpoint
ALTER TABLE `goals` ADD `idempotency_key` varchar(255);--> statement-breakpoint
ALTER TABLE `cash_wallet_logs` ADD `idempotency_key` varchar(255);