// packages/db/src/schema/bills.ts
// TABLE 6: bills — Hóa đơn cố định định kỳ
// TABLE 7: bill_payments — Lịch sử thanh toán
//
// Mỗi row = 1 payment event thực tế (partial payments OK)
// Trạng thái tính tại API: SUM(amount_paid) WHERE bill_id + period_month
import {
  bigint, integer, numeric, varchar, boolean, timestamp, char, text,
  pgTable, pgEnum, index, check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { categories } from "./categories";

export const billFrequencyEnum = pgEnum("bill_frequency", ["monthly", "quarterly", "yearly"]);

// ── TABLE 6: bills ──────────────────────────────────────────────
export const bills = pgTable("bills", {
  id:         bigint("id", { mode: "bigint" }).$type<string>().generatedAlwaysAsIdentity().primaryKey(),
  userId:     bigint("user_id", { mode: "bigint" }).$type<string>().notNull()
                .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  categoryId: integer("category_id").notNull()
                .references(() => categories.id, { onDelete: "restrict", onUpdate: "cascade" }),
  name:       varchar("name", { length: 100 }).notNull(),
  icon:       varchar("icon", { length: 20 }).notNull().default("📄"),
  amount:     numeric("amount", { precision: 15, scale: 2 }).notNull(),
  dueDay:     integer("due_day").notNull(), // 1-31
  frequency:  billFrequencyEnum("frequency").notNull().default("monthly"),
  autoPay:    boolean("auto_pay").notNull().default(false),
  isActive:   boolean("is_active").notNull().default(true),
  notes:      text("notes"),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
  updatedAt:  timestamp("updated_at").notNull().defaultNow(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
}, (table) => ({
  userIdx:       index("idx_bills_user").on(table.userId, table.isActive),
  userDueDayIdx: index("idx_bills_user_dueday").on(table.userId, table.dueDay),
  userFreqIdx:   index("idx_bills_user_freq").on(table.userId, table.frequency),
  catIdx:        index("idx_bills_category").on(table.categoryId),
  amountCheck:   check("chk_bills_amount_positive", sql`amount > 0`),
  dueDayCheck:   check("chk_bills_due_day", sql`due_day BETWEEN 1 AND 31`),
}));

export type Bill    = typeof bills.$inferSelect;
export type NewBill = typeof bills.$inferInsert;

// ── TABLE 7: bill_payments ──────────────────────────────────────
// NO unique constraint on (bill_id, period_month)
// Mỗi row = 1 payment event. UI tính status qua SUM tại API layer.
export const billPayments = pgTable("bill_payments", {
  id:          bigint("id", { mode: "bigint" }).$type<string>().generatedAlwaysAsIdentity().primaryKey(),
  billId:      bigint("bill_id", { mode: "bigint" }).$type<string>().notNull()
                 .references(() => bills.id, { onDelete: "cascade", onUpdate: "cascade" }),
  userId:      bigint("user_id", { mode: "bigint" }).$type<string>().notNull()
                 .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  periodMonth: char("period_month", { length: 7 }).notNull(), // YYYY-MM
  amountPaid:  numeric("amount_paid", { precision: 15, scale: 2 }).notNull(),
  paidAt:      timestamp("paid_at").notNull().defaultNow(),
  note:        varchar("note", { length: 255 }),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
}, (table) => ({
  userPeriodIdx:  index("idx_bill_payments_user").on(table.userId, table.periodMonth),
  billPeriodIdx:  index("idx_bill_payments_bill_period").on(table.billId, table.periodMonth),
  amountCheck:    check("chk_bill_payment_positive", sql`amount_paid > 0`),
}));

export type BillPayment    = typeof billPayments.$inferSelect;
export type NewBillPayment = typeof billPayments.$inferInsert;
