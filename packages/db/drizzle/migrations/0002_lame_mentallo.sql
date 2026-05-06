ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "refresh_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "wallet_logs" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "wallet_logs" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "wallet_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "wallets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "bill_payments" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "bill_payments" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "bill_payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "bills" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "bills" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "bills_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "goals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "budget_categories" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "budget_categories" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "budget_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "budgets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "budgets" DROP COLUMN "wallet_scope";--> statement-breakpoint
DROP TYPE "public"."budget_wallet_scope";