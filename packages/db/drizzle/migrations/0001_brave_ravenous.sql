ALTER TABLE `transactions` ADD CONSTRAINT `transactions_idempotency_key_unique` UNIQUE(`idempotency_key`);--> statement-breakpoint
ALTER TABLE `transactions` ADD `idempotency_key` varchar(255);