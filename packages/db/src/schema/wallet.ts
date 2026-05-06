// packages/db/src/schema/wallet.ts
// WALLETS — Multi-wallet support (cash, bank, credit, e-wallet, etc.)
// WALLET_LOGS — Audit trail for wallet balance changes
//
// [v13.0] Replaced 1:1 cash_wallet with multi-wallet design per ERD.
import {
  bigint, integer, decimal, timestamp, varchar, boolean,
  pgTable, pgEnum, index, check, bigserial,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const walletTypeEnum = pgEnum("wallet_type", ["cash", "bank", "credit", "e_wallet", "investment", "other"]);

// ── WALLETS ─────────────────────────────────────────────────────────
export const wallets = pgTable("wallets", {
  id:             bigint("id", { mode: "bigint" }).$type<string>().primaryKey().generatedAlwaysAsIdentity(),
  userId:         bigint("user_id", { mode: "bigint" }).$type<string>().notNull()
                    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  name:           varchar("name", { length: 100 }).notNull(),
  type:           walletTypeEnum("type").notNull().default("cash"),
  balance:        decimal("balance", { precision: 15, scale: 2 }).notNull().default("0.00"),
  initialBalance: decimal("initial_balance", { precision: 15, scale: 2 }).notNull().default("0.00"),
  icon:           varchar("icon", { length: 50 }).notNull().default("💵"),
  color:          varchar("color", { length: 7 }).notNull().default("#6B7280"),
  isDefault:      boolean("is_default").notNull().default(false),
  version:        integer("version").notNull().default(0),
  deletedAt:      timestamp("deleted_at"),
  lastSyncedAt:   timestamp("last_synced_at"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userTypeIdx:       index("idx_wallets_user_type").on(table.userId, table.type),
  userDefaultIdx:    index("idx_wallets_user_default").on(table.userId, table.isDefault),
  userDeletedIdx:    index("idx_wallets_user_deleted").on(table.userId, table.deletedAt),
  balanceCheck:      check("chk_wallets_balance_non_negative", sql`${table.balance} >= 0`),
  initialBalanceCheck: check("chk_wallets_initial_non_negative", sql`${table.initialBalance} >= 0`),
}));

export type Wallet    = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;

// ── WALLET LOGS ──────────────────────────────────────────────────────
export const walletLogs = pgTable("wallet_logs", {
  id:            bigint("id", { mode: "bigint" }).$type<string>().primaryKey().generatedAlwaysAsIdentity(),
  walletId:      bigint("wallet_id", { mode: "bigint" }).$type<string>().notNull()
                   .references(() => wallets.id, { onDelete: "cascade", onUpdate: "cascade" }),
  userId:        bigint("user_id", { mode: "bigint" }).$type<string>().notNull()
                   .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  transactionId: bigint("transaction_id", { mode: "bigint" }).$type<string>(),
  balanceBefore: decimal("balance_before", { precision: 15, scale: 2 }).notNull(),
  balanceAfter:  decimal("balance_after", { precision: 15, scale: 2 }).notNull(),
  difference:    decimal("difference", { precision: 15, scale: 2 }).notNull(),
  note:          varchar("note", { length: 255 }),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  walletIdx:    index("idx_wallet_logs_wallet").on(table.walletId, table.createdAt),
  userIdx:      index("idx_wallet_logs_user").on(table.userId, table.createdAt),
  txIdx:        index("idx_wallet_logs_tx").on(table.transactionId),
}));

export type WalletLog    = typeof walletLogs.$inferSelect;
export type NewWalletLog = typeof walletLogs.$inferInsert;
