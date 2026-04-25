// packages/db/src/schema/wallet.ts
// TABLE 9: cash_wallet — Ví tiền mặt (1:1 với users)
// TABLE 10: cash_wallet_logs — Lịch sử Quick Sync (Phase 2)
//
// [v12.0-D] initial_balance: snapshot khi user onboard, immutable sau khi set
//           net_change = balance - initial_balance (tính tại API, không lưu DB)
// cash_wallet record được tạo bởi user-service.ts::initializeNewUser() — KHÔNG dùng Trigger
import {
  bigint, decimal, timestamp, varchar, mysqlTable, index, check,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { transactions } from "./transactions";

// ── TABLE 9: cash_wallet ─────────────────────────────────────────
export const cashWallet = mysqlTable("cash_wallet", {
  // PK = userId (1:1 relationship)
  userId:         bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>().primaryKey()
                    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  // [v12.0-D] initial_balance: baseline onboarding snapshot — set once, immutable
  initialBalance: decimal("initial_balance", { precision: 15, scale: 2 }).notNull().default("0.00"),
  // current balance — updated by wallet-service.ts on Quick Sync
  balance:        decimal("balance", { precision: 15, scale: 2 }).notNull().default("0.00"),
  // net_change = balance - initial_balance (computed at API layer)
  lastSyncedAt:   timestamp("last_synced_at"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
  updatedAt:      timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  balanceCheck:        check("chk_cash_balance_non_negative", sql`balance >= 0`),
  initialBalanceCheck: check("chk_cash_initial_non_negative", sql`initial_balance >= 0`),
}));

export type CashWallet   = typeof cashWallet.$inferSelect;
export type UpdateWallet = typeof cashWallet.$inferInsert;
// wallet.balance:        string "500000.00"
// wallet.initialBalance: string "0.00"

// ── TABLE 10: cash_wallet_logs ───────────────────────────────────
// Phase 2 — Audit trail cho Quick Sync
// Insert thực hiện bởi wallet-service.ts — KHÔNG dùng Stored Procedure
export const cashWalletLogs = mysqlTable("cash_wallet_logs", {
  id:            bigint("id", { mode: "bigint", unsigned: true }).$type<string>().autoincrement().primaryKey(),
  userId:        bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>().notNull()
                   .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  balanceBefore: decimal("balance_before", { precision: 15, scale: 2 }).notNull(),
  balanceAfter:  decimal("balance_after", { precision: 15, scale: 2 }).notNull(),
  // difference = after - before (âm = đã chi)
  difference:    decimal("difference", { precision: 15, scale: 2 }).notNull(),
  note:          varchar("note", { length: 255 }),
  // FK to transactions if a misc expense was auto-created
  autoTxId:      bigint("auto_tx_id", { mode: "bigint", unsigned: true }).$type<string>()
                   .references(() => transactions.id, { onDelete: "set null", onUpdate: "cascade" }),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
}, (table) => ({
  userIdx: index("idx_wallet_logs_user").on(table.userId, table.createdAt),
}));

export type CashWalletLog    = typeof cashWalletLogs.$inferSelect;
export type NewCashWalletLog = typeof cashWalletLogs.$inferInsert;
