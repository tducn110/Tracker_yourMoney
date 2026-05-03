CREATE TYPE "public"."theme" AS ENUM('light', 'dark', 'system');--> statement-breakpoint
CREATE TYPE "public"."category_type" AS ENUM('income', 'expense', 'both');--> statement-breakpoint
CREATE TYPE "public"."wallet_type" AS ENUM('cash', 'bank', 'credit', 'e_wallet', 'investment', 'other');--> statement-breakpoint
CREATE TYPE "public"."transaction_source" AS ENUM('manual', 'quick_add', 'ocr', 'import', 'recurring', 'bill_payment', 'goal_contribution');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."bill_frequency" AS ENUM('monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."goal_status" AS ENUM('active', 'completed', 'paused', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."budget_period_type" AS ENUM('weekly', 'monthly', 'quarterly', 'yearly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."budget_status" AS ENUM('active', 'finished');--> statement-breakpoint
CREATE TYPE "public"."budget_wallet_scope" AS ENUM('all', 'specific');--> statement-breakpoint
CREATE TYPE "public"."audit_status" AS ENUM('success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('bill_due', 'bill_overdue', 'budget_warning', 'budget_exceeded', 'goal_completed', 'goal_milestone', 'low_balance', 'budget_negative', 'system', 'tip');--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"firebase_uid" varchar(128),
	"full_name" varchar(100) NOT NULL,
	"avatar_url" varchar(500),
	"avatar_text" varchar(5),
	"is_active" boolean DEFAULT true NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_firebase_uid_unique" UNIQUE("firebase_uid")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "refresh_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"device_info" varchar(255),
	"ip_address" varchar(45),
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" bigint PRIMARY KEY NOT NULL,
	"monthly_budget" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"emergency_buffer" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"income_date" integer DEFAULT 1 NOT NULL,
	"currency" varchar(10) DEFAULT 'VND' NOT NULL,
	"language" varchar(10) DEFAULT 'vi' NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Ho_Chi_Minh' NOT NULL,
	"theme" "theme" DEFAULT 'light' NOT NULL,
	"notify_bill_before_days" integer DEFAULT 3 NOT NULL,
	"notify_budget_threshold" numeric(5, 2) DEFAULT '80.00' NOT NULL,
	"notify_email" boolean DEFAULT true NOT NULL,
	"notify_push" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" bigint,
	"name" varchar(50) NOT NULL,
	"type" "category_type" DEFAULT 'expense' NOT NULL,
	"icon" varchar(20) DEFAULT '📦' NOT NULL,
	"color" varchar(7) DEFAULT '#6B7280' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_logs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "wallet_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"wallet_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"transaction_id" bigint,
	"balance_before" numeric(15, 2) NOT NULL,
	"balance_after" numeric(15, 2) NOT NULL,
	"difference" numeric(15, 2) NOT NULL,
	"note" varchar(255),
	"idempotency_key" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallet_logs_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "wallets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" "wallet_type" DEFAULT 'cash' NOT NULL,
	"balance" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"initial_balance" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"icon" varchar(50) DEFAULT '💵' NOT NULL,
	"color" varchar(7) DEFAULT '#6B7280' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chk_wallets_balance_non_negative" CHECK (balance >= 0),
	CONSTRAINT "chk_wallets_initial_non_negative" CHECK (initial_balance >= 0)
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"wallet_id" bigint NOT NULL,
	"category_id" integer NOT NULL,
	"goal_id" bigint,
	"amount" numeric(15, 2) NOT NULL,
	"type" "transaction_type" NOT NULL,
	"note" varchar(500),
	"display_date" date NOT NULL,
	"receipt_url" varchar(500),
	"source" "transaction_source" DEFAULT 'manual' NOT NULL,
	"idempotency_key" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "chk_tx_amount_positive" CHECK (amount > 0)
);
--> statement-breakpoint
CREATE TABLE "bill_payments" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bill_payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"bill_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"period_month" char(7) NOT NULL,
	"amount_paid" numeric(15, 2) NOT NULL,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	"note" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"idempotency_key" varchar(255),
	CONSTRAINT "bill_payments_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "chk_bill_payment_positive" CHECK (amount_paid > 0)
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bills_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon" varchar(20) DEFAULT '📄' NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"due_day" integer NOT NULL,
	"frequency" "bill_frequency" DEFAULT 'monthly' NOT NULL,
	"auto_pay" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"idempotency_key" varchar(255),
	CONSTRAINT "bills_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "chk_bills_amount_positive" CHECK (amount > 0),
	CONSTRAINT "chk_bills_due_day" CHECK (due_day BETWEEN 1 AND 31)
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "goals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon" varchar(20) DEFAULT '🎯' NOT NULL,
	"target_amount" numeric(15, 2) NOT NULL,
	"current_saved" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"monthly_contribution" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"deadline" date,
	"status" "goal_status" DEFAULT 'active' NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"idempotency_key" varchar(255),
	CONSTRAINT "goals_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "chk_goals_amounts" CHECK (target_amount > 0 AND current_saved >= 0 AND monthly_contribution >= 0),
	CONSTRAINT "chk_goals_saved_lte_target" CHECK (current_saved <= target_amount * 1.01)
);
--> statement-breakpoint
CREATE TABLE "budget_categories" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "budget_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"budget_id" bigint NOT NULL,
	"category_id" integer NOT NULL,
	"allocated_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	CONSTRAINT "uq_budget_category" UNIQUE("budget_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "budgets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon" varchar(20) DEFAULT '💰' NOT NULL,
	"target_amount" numeric(15, 2) NOT NULL,
	"period_type" "budget_period_type" DEFAULT 'monthly' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_all_categories" boolean DEFAULT false NOT NULL,
	"wallet_scope" "budget_wallet_scope" DEFAULT 'all' NOT NULL,
	"status" "budget_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint,
	"action" varchar(100) NOT NULL,
	"resource" varchar(100),
	"resource_id" varchar(50),
	"old_values" json,
	"new_values" json,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"status" "audit_status" DEFAULT 'success' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(150) NOT NULL,
	"body" text NOT NULL,
	"icon" varchar(20) DEFAULT '🔔' NOT NULL,
	"action_url" varchar(255),
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"expires_at" timestamp,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "wallet_logs" ADD CONSTRAINT "wallet_logs_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "wallet_logs" ADD CONSTRAINT "wallet_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "wallet_logs" ADD CONSTRAINT "wallet_logs_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "bill_payments" ADD CONSTRAINT "bill_payments_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "bill_payments" ADD CONSTRAINT "bill_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_username" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "idx_users_active" ON "users" USING btree ("is_active","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_refresh_token_user" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_refresh_token_hash" ON "refresh_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_refresh_token_expiry" ON "refresh_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_category_name_user" ON "categories" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "idx_categories_user" ON "categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_categories_type" ON "categories" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_wallet_logs_wallet" ON "wallet_logs" USING btree ("wallet_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_wallet_logs_user" ON "wallet_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_wallet_logs_tx" ON "wallet_logs" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_wallets_user_type" ON "wallets" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "idx_wallets_user_default" ON "wallets" USING btree ("user_id","is_default");--> statement-breakpoint
CREATE INDEX "idx_wallets_user_deleted" ON "wallets" USING btree ("user_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_tx_user_date" ON "transactions" USING btree ("user_id","display_date");--> statement-breakpoint
CREATE INDEX "idx_tx_user_type" ON "transactions" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "idx_tx_user_cat" ON "transactions" USING btree ("user_id","category_id");--> statement-breakpoint
CREATE INDEX "idx_tx_user_type_date" ON "transactions" USING btree ("user_id","type","display_date");--> statement-breakpoint
CREATE INDEX "idx_tx_wallet" ON "transactions" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "idx_tx_goal" ON "transactions" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "idx_bill_payments_user" ON "bill_payments" USING btree ("user_id","period_month");--> statement-breakpoint
CREATE INDEX "idx_bill_payments_bill_period" ON "bill_payments" USING btree ("bill_id","period_month");--> statement-breakpoint
CREATE INDEX "idx_bills_user" ON "bills" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_bills_user_dueday" ON "bills" USING btree ("user_id","due_day");--> statement-breakpoint
CREATE INDEX "idx_bills_user_freq" ON "bills" USING btree ("user_id","frequency");--> statement-breakpoint
CREATE INDEX "idx_bills_category" ON "bills" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_goals_user_status" ON "goals" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_goals_user_deadline" ON "goals" USING btree ("user_id","deadline");--> statement-breakpoint
CREATE INDEX "idx_budget_categories" ON "budget_categories" USING btree ("budget_id","category_id");--> statement-breakpoint
CREATE INDEX "idx_budgets_user_status" ON "budgets" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_budgets_user_period" ON "budgets" USING btree ("user_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "idx_audit_user" ON "audit_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_action" ON "audit_logs" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_resource" ON "audit_logs" USING btree ("resource","resource_id");--> statement-breakpoint
CREATE INDEX "idx_notif_user_unread" ON "notifications" USING btree ("user_id","is_read","created_at");--> statement-breakpoint
CREATE INDEX "idx_notif_user_type" ON "notifications" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "idx_notif_expires" ON "notifications" USING btree ("expires_at");