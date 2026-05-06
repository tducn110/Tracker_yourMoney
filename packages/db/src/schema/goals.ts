// packages/db/src/schema/goals.ts
// TABLE 8: goals — Mục tiêu tiết kiệm dài hạn
//
// status được set bởi goal-service.ts::checkAndCompleteGoal() — KHÔNG dùng Trigger
// completedAt được set tự động khi current_saved >= target_amount (với 1% tolerance)
import {
  bigint, integer, varchar, decimal, timestamp, date, text,
  pgTable, pgEnum, index, check, bigserial,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const goalStatusEnum = pgEnum("goal_status", ["active", "completed", "paused", "cancelled"]);

export const goals = pgTable("goals", {
  id:                  bigint("id", { mode: "bigint" }).$type<string>().primaryKey().generatedAlwaysAsIdentity(),
  userId:              bigint("user_id", { mode: "bigint" }).$type<string>().notNull()
                         .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  name:                varchar("name", { length: 100 }).notNull(),
  icon:                varchar("icon", { length: 20 }).notNull().default("🎯"),
  targetAmount:        decimal("target_amount", { precision: 15, scale: 2 }).notNull(),
  currentSaved:        decimal("current_saved", { precision: 15, scale: 2 }).notNull().default("0.00"),
  monthlyContribution: decimal("monthly_contribution", { precision: 15, scale: 2 }).notNull().default("0.00"),
  deadline:            date("deadline"),
  status:              goalStatusEnum("status").notNull().default("active"),
  priority:            integer("priority").notNull().default(1), // 1=high, 2=medium, 3=low
  notes:               text("notes"),
  completedAt:         timestamp("completed_at"),
  createdAt:           timestamp("created_at").notNull().defaultNow(),
  updatedAt:           timestamp("updated_at").notNull().defaultNow(),
  idempotencyKey:      varchar("idempotency_key", { length: 255 }).unique(),
}, (table) => ({
  userStatusIdx:   index("idx_goals_user_status").on(table.userId, table.status),
  userDeadlineIdx: index("idx_goals_user_deadline").on(table.userId, table.deadline),
  amountsCheck:    check("chk_goals_amounts",
    sql`${table.targetAmount} > 0 AND ${table.currentSaved} >= 0 AND ${table.monthlyContribution} >= 0`),
  savedLteTarget:  check("chk_goals_saved_lte_target",
    sql`${table.currentSaved} <= ${table.targetAmount} * 1.01`),
}));

export type Goal    = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
