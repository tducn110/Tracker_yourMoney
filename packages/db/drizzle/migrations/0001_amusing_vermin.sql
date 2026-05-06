ALTER TABLE "wallets" DROP CONSTRAINT "chk_wallets_balance_non_negative";--> statement-breakpoint
ALTER TABLE "wallets" DROP CONSTRAINT "chk_wallets_initial_non_negative";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "chk_tx_amount_positive";--> statement-breakpoint
ALTER TABLE "bill_payments" DROP CONSTRAINT "chk_bill_payment_positive";--> statement-breakpoint
ALTER TABLE "bills" DROP CONSTRAINT "chk_bills_amount_positive";--> statement-breakpoint
ALTER TABLE "bills" DROP CONSTRAINT "chk_bills_due_day";--> statement-breakpoint
ALTER TABLE "goals" DROP CONSTRAINT "chk_goals_amounts";--> statement-breakpoint
ALTER TABLE "goals" DROP CONSTRAINT "chk_goals_saved_lte_target";--> statement-breakpoint
ALTER TABLE "wallet_logs" DROP CONSTRAINT "wallet_logs_transaction_id_transactions_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "wallet_logs" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "wallet_logs" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "bill_payments" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "bill_payments" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "bills" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "bills" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "budget_categories" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "budget_categories" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "chk_wallets_balance_non_negative" CHECK ("wallets"."balance" >= 0);--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "chk_wallets_initial_non_negative" CHECK ("wallets"."initial_balance" >= 0);--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "chk_tx_amount_positive" CHECK ("transactions"."amount" > 0);--> statement-breakpoint
ALTER TABLE "bill_payments" ADD CONSTRAINT "chk_bill_payment_positive" CHECK ("bill_payments"."amount_paid" > 0);--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "chk_bills_amount_positive" CHECK ("bills"."amount" > 0);--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "chk_bills_due_day" CHECK ("bills"."due_day" BETWEEN 1 AND 31);--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "chk_goals_amounts" CHECK ("goals"."target_amount" > 0 AND "goals"."current_saved" >= 0 AND "goals"."monthly_contribution" >= 0);--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "chk_goals_saved_lte_target" CHECK ("goals"."current_saved" <= "goals"."target_amount" * 1.01);