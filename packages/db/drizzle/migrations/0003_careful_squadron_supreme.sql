ALTER TABLE `transactions` ADD CONSTRAINT `chk_tx_amount_positive` CHECK (amount > 0);--> statement-breakpoint
ALTER TABLE `bill_payments` ADD CONSTRAINT `chk_bill_payment_positive` CHECK (amount_paid > 0);--> statement-breakpoint
ALTER TABLE `bills` ADD CONSTRAINT `chk_bills_amount_positive` CHECK (amount > 0);--> statement-breakpoint
ALTER TABLE `bills` ADD CONSTRAINT `chk_bills_due_day` CHECK (due_day BETWEEN 1 AND 31);--> statement-breakpoint
ALTER TABLE `goals` ADD CONSTRAINT `chk_goals_amounts` CHECK (target_amount > 0 AND current_saved >= 0 AND monthly_contribution >= 0);--> statement-breakpoint
ALTER TABLE `goals` ADD CONSTRAINT `chk_goals_saved_lte_target` CHECK (current_saved <= target_amount * 1.01);--> statement-breakpoint
ALTER TABLE `cash_wallet` ADD CONSTRAINT `chk_cash_balance_non_negative` CHECK (balance >= 0);--> statement-breakpoint
ALTER TABLE `cash_wallet` ADD CONSTRAINT `chk_cash_initial_non_negative` CHECK (initial_balance >= 0);