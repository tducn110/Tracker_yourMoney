// packages/db/src/schema/transactions.ts
// TABLE 5: transactions — Nhật ký giao dịch tài chính (bảng cốt lõi)
//
// [v12.0-A] display_date DATE — ngày user tự chọn cho sổ cái, không có timezone confusion
//           Budget Engine filters: WHERE display_date BETWEEN '2026-04-01' AND '2026-04-30'
// type enum: income | expense
//
// ⚡ COMPOSITE INDEX (user_id, display_date) — CRITICAL for Budget Engine performance
import {
  bigint, integer, decimal, varchar, timestamp, date,
  pgTable, pgEnum, index, check,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { users } from "./users";
import { categories } from "./categories";
import { wallets } from "./wallet";
import { goals } from "./goals";

export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense"]);
export const transactionSourceEnum = pgEnum("transaction_source", ["manual", "quick_add", "ocr", "import", "recurring", "bill_payment", "goal_contribution"]);

export const transactions = pgTable("transactions", {
  id:          bigint("id", { mode: "bigint" }).$type<string>().primaryKey().generatedAlwaysAsIdentity(),
  userId:      bigint("user_id", { mode: "bigint" }).$type<string>().notNull()
                 .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  walletId:    bigint("wallet_id", { mode: "bigint" }).$type<string>().notNull()
                 .references(() => wallets.id, { onDelete: "restrict", onUpdate: "cascade" }),
  categoryId:  integer("category_id").notNull()
                 .references(() => categories.id, { onDelete: "restrict", onUpdate: "cascade" }),
  goalId:      bigint("goal_id", { mode: "bigint" }).$type<string>()
                 .references(() => goals.id, { onDelete: "set null", onUpdate: "cascade" }),

  // Decimal Trap: amount từ DB là string → dùng new Decimal(tx.amount) tại service layer
  // KHÔNG .toNumber() trực tiếp
  amount:      decimal("amount", { precision: 15, scale: 2 }).notNull(),

  type:        transactionTypeEnum("type").notNull(),

  note:        varchar("note", { length: 500 }),

  // [v12.0-A] User-controlled date — không phải system timestamp
  displayDate: date("display_date").notNull(),

  receiptUrl:  varchar("receipt_url", { length: 500 }),
  source:      transactionSourceEnum("source").notNull().default("manual"),

  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),

  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userDateIdx:  index("idx_tx_user_date").on(table.userId, table.displayDate),
  userTypeIdx:  index("idx_tx_user_type").on(table.userId, table.type),
  userCatIdx:   index("idx_tx_user_cat").on(table.userId, table.categoryId),
  userTypeDateIdx: index("idx_tx_user_type_date").on(table.userId, table.type, table.displayDate),
  walletIdx:    index("idx_tx_wallet").on(table.walletId),
  goalIdx:      index("idx_tx_goal").on(table.goalId),
  amountCheck:  check("chk_tx_amount_positive", sql`${table.amount} > 0`),
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
