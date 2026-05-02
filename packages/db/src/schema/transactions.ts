// packages/db/src/schema/transactions.ts
// TABLE 5: transactions — Nhật ký giao dịch tài chính (bảng cốt lõi)
//
// [v12.0-A] display_date DATE — ngày user tự chọn cho sổ cái, không có timezone confusion
//           Budget Engine filters: WHERE display_date BETWEEN '2026-04-01' AND '2026-04-30'
// [v12.0-B] Currency fields deferred to Phase 2 (VND-only MVP)
// [v12.0-C] type enum includes 'transfer' for wallet-to-wallet moves
// [FIX #4]  bigint mode: "string" — TiDB distributed ID safety
//
// ⚡ COMPOSITE INDEX (user_id, display_date) — CRITICAL for Budget Engine performance
import {
  bigint, int, decimal, varchar, timestamp, date,
  mysqlTable, mysqlEnum, index, check,
} from "drizzle-orm/mysql-core";
import { sql, relations } from "drizzle-orm";
import { users } from "./users";
import { categories } from "./categories";
import { wallets } from "./wallet";
import { goals } from "./goals";

export const transactions = mysqlTable("transactions", {
  id:          bigint("id", { mode: "bigint", unsigned: true }).$type<string>().autoincrement().primaryKey(),
  userId:      bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>().notNull()
                 .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  walletId:    bigint("wallet_id", { mode: "bigint", unsigned: true }).$type<string>().notNull()
                 .references(() => wallets.id, { onDelete: "restrict", onUpdate: "cascade" }),
  categoryId:  int("category_id", { unsigned: true }).notNull()
                 .references(() => categories.id, { onDelete: "restrict", onUpdate: "cascade" }),
  goalId:      bigint("goal_id", { mode: "bigint", unsigned: true }).$type<string>()
                 .references(() => goals.id, { onDelete: "set null", onUpdate: "cascade" }),

  // Decimal Trap: amount từ DB là string → dùng new Decimal(tx.amount) tại service layer
  // KHÔNG .toNumber() trực tiếp
  amount:      decimal("amount", { precision: 15, scale: 2 }).notNull(),

  // [v12.0-C] 'transfer' cho phép ghi nhận chuyển ví
  type:        mysqlEnum("type", ["income", "expense", "transfer"]).notNull(),

  note:        varchar("note", { length: 500 }),

  // [v12.0-A] User-controlled date — không phải system timestamp
  // Cho phép log giao dịch quá khứ đúng ngày
  displayDate: date("display_date", { mode: "string" }).notNull(),

  receiptUrl:  varchar("receipt_url", { length: 500 }),
  source:      mysqlEnum("source", ["manual", "quick_add", "ocr", "import", "recurring", "bill_payment", "goal_contribution"])
                 .notNull().default("manual"),
  
  // Idempotency: Khóa đúp từ DB — phòng thủ Cold Start Serverless
  // UNIQUE constraint đảm bảo cross-instance safety trên Vercel multi-region
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),

  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow().onUpdateNow(),

  // Phase 2 multi-currency (uncomment + migration when expanding):
  // currencyCode: varchar("currency_code", { length: 10 }).notNull().default("VND"),
  // exchangeRate: decimal("exchange_rate", { precision: 18, scale: 6 }).notNull().default("1.000000"),
  // baseAmount:   decimal("base_amount", { precision: 15, scale: 2 }).notNull(),
}, (table) => ({
  // ⚡ COMPOSITE INDEX — Budget Engine lifeblood
  userDateIdx:  index("idx_tx_user_date").on(table.userId, table.displayDate),
  userTypeIdx:  index("idx_tx_user_type").on(table.userId, table.type),
  userCatIdx:   index("idx_tx_user_cat").on(table.userId, table.categoryId),
  // Targeted index for Budget Engine: WHERE userId=? AND type='expense' AND displayDate BETWEEN ? AND ?
  userTypeDateIdx: index("idx_tx_user_type_date").on(table.userId, table.type, table.displayDate),
  walletIdx:    index("idx_tx_wallet").on(table.walletId),
  goalIdx:      index("idx_tx_goal").on(table.goalId),
  // CHECK: amount phải luôn dương
  amountCheck:  check("chk_tx_amount_positive", sql`amount > 0`),
}));

export type Transaction    = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
// tx.amount:      string "50000.00"
// tx.displayDate: string "2026-04-01"
// tx.userId:      string "1"

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
  goal: one(goals, {
    fields: [transactions.goalId],
    references: [goals.id],
  }),
}));
