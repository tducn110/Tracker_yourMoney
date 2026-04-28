// packages/db/src/schema/goals.ts
// TABLE 8: goals — Mục tiêu tiết kiệm dài hạn
//
// status được set bởi goal-service.ts::checkAndCompleteGoal() — KHÔNG dùng Trigger
// completedAt được set tự động khi current_saved >= target_amount (với 1% tolerance)
// [FIX #4] bigint mode: "bigint" — TiDB precision safety
import {
  bigint, varchar, tinyint, decimal, timestamp, date, text,
  mysqlTable, mysqlEnum, index, check,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const goals = mysqlTable("goals", {
  id:                  bigint("id", { mode: "bigint", unsigned: true }).$type<string>().autoincrement().primaryKey(),
  userId:              bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>().notNull()
                         .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  name:                varchar("name", { length: 100 }).notNull(),
  icon:                varchar("icon", { length: 20 }).notNull().default("🎯"),
  targetAmount:        decimal("target_amount", { precision: 15, scale: 2 }).notNull(),
  currentSaved:        decimal("current_saved", { precision: 15, scale: 2 }).notNull().default("0.00"),
  monthlyContribution: decimal("monthly_contribution", { precision: 15, scale: 2 }).notNull().default("0.00"),
  deadline:            date("deadline", { mode: "string" }),
  // 4-value status — paused/cancelled là trạng thái tài chính thực tế (không đơn giản hóa)
  status:              mysqlEnum("status", ["active", "completed", "paused", "cancelled"])
                         .notNull().default("active"),
  priority:            tinyint("priority").notNull().default(1), // 1=high, 2=medium, 3=low
  notes:               text("notes"),
  completedAt:         timestamp("completed_at"),
  createdAt:           timestamp("created_at").notNull().defaultNow(),
  updatedAt:           timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  idempotencyKey:      varchar("idempotency_key", { length: 255 }).unique(),
}, (table) => ({
  userStatusIdx:   index("idx_goals_user_status").on(table.userId, table.status),
  userDeadlineIdx: index("idx_goals_user_deadline").on(table.userId, table.deadline),
  // CHECK: amounts phải hợp lệ — target > 0, saved >= 0, monthly >= 0
  amountsCheck:    check("chk_goals_amounts",
    sql`target_amount > 0 AND current_saved >= 0 AND monthly_contribution >= 0`),
  // 1% tolerance để tránh lỗi rounding khi tính completion
  savedLteTarget:  check("chk_goals_saved_lte_target",
    sql`current_saved <= target_amount * 1.01`),
}));

export type Goal    = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
