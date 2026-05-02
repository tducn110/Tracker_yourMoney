// packages/db/src/schema/bills.ts
// TABLE 6: bills — Hóa đơn cố định định kỳ
// TABLE 7: bill_payments — Lịch sử thanh toán
//
// [FIX #3] KHÔNG có UNIQUE KEY trên (bill_id, period_month)
//   → Mỗi row = 1 payment event thực tế (partial payments OK)
//   → Trạng thái tính tại API: SUM(amount_paid) WHERE bill_id + period_month
// [FIX #4] bigint mode: "bigint" — TiDB precision safety
import {
  bigint, int, decimal, varchar, tinyint, timestamp, char, text,
  mysqlTable, mysqlEnum, index, check,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { categories } from "./categories";

// ── TABLE 6: bills ──────────────────────────────────────────────
export const bills = mysqlTable("bills", {
  id:         bigint("id", { mode: "bigint", unsigned: true }).$type<string>().autoincrement().primaryKey(),
  userId:     bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>().notNull()
                .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  categoryId: int("category_id", { unsigned: true }).notNull()
                .references(() => categories.id, { onDelete: "restrict", onUpdate: "cascade" }),
  name:       varchar("name", { length: 100 }).notNull(),
  icon:       varchar("icon", { length: 20 }).notNull().default("📄"),
  amount:     decimal("amount", { precision: 15, scale: 2 }).notNull(),
  dueDay:     tinyint("due_day").notNull(), // 1-31
  frequency:  mysqlEnum("frequency", ["monthly", "quarterly", "yearly"]).notNull().default("monthly"),
  autoPay:    tinyint("auto_pay").notNull().default(0),
  isActive:   tinyint("is_active").notNull().default(1),
  notes:      text("notes"),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
  updatedAt:  timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
}, (table) => ({
  userIdx:       index("idx_bills_user").on(table.userId, table.isActive),
  userDueDayIdx: index("idx_bills_user_dueday").on(table.userId, table.dueDay),
  userFreqIdx:   index("idx_bills_user_freq").on(table.userId, table.frequency),
  amountCheck:   check("chk_bills_amount_positive", sql`amount > 0`),
  dueDayCheck:   check("chk_bills_due_day", sql`due_day BETWEEN 1 AND 31`),
}));

export type Bill    = typeof bills.$inferSelect;
export type NewBill = typeof bills.$inferInsert;

// ── TABLE 7: bill_payments ──────────────────────────────────────
// [FIX #3] NO unique constraint on (bill_id, period_month)
// Mỗi row = 1 payment event. UI tính status qua SUM tại API layer.
export const billPayments = mysqlTable("bill_payments", {
  id:          bigint("id", { mode: "bigint", unsigned: true }).$type<string>().autoincrement().primaryKey(),
  billId:      bigint("bill_id", { mode: "bigint", unsigned: true }).$type<string>().notNull()
                 .references(() => bills.id, { onDelete: "cascade", onUpdate: "cascade" }),
  userId:      bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>().notNull()
                 .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  // YYYY-MM format, e.g. "2026-04"
  periodMonth: char("period_month", { length: 7 }).notNull(),
  // amountPaid NOT NULL — mỗi row là 1 payment event thực tế
  amountPaid:  decimal("amount_paid", { precision: 15, scale: 2 }).notNull(),
  paidAt:      timestamp("paid_at").notNull().defaultNow(),
  note:        varchar("note", { length: 255 }),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  // NO updatedAt — payment events are immutable once recorded
}, (table) => ({
  userPeriodIdx:  index("idx_bill_payments_user").on(table.userId, table.periodMonth),
  // [FIX #3] Index thay vì UNIQUE → SUM query vẫn nhanh, nhưng N events/kỳ được phép
  billPeriodIdx:  index("idx_bill_payments_bill_period").on(table.billId, table.periodMonth),
  amountCheck:    check("chk_bill_payment_positive", sql`amount_paid > 0`),
}));

export type BillPayment    = typeof billPayments.$inferSelect;
export type NewBillPayment = typeof billPayments.$inferInsert;

// Tính trạng thái thanh toán tại apps/api/services/bill-service.ts:
// const total = SUM(amountPaid) WHERE billId=? AND periodMonth=?
// status = total >= bill.amount ? "paid" : total > 0 ? "partial" : "pending"
