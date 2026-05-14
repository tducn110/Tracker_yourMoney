import { pgTable, bigint, integer, varchar, decimal, date, timestamp, pgEnum, boolean, index, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./categories";

export const budgetPeriodTypeEnum = pgEnum("budget_period_type", ["weekly", "monthly", "quarterly", "yearly", "custom"]);
export const budgetStatusEnum = pgEnum("budget_status", ["active", "finished"]);

export const budgets = pgTable(
  "budgets",
  {
    id: bigint("id", { mode: "bigint" }).$type<string>().generatedAlwaysAsIdentity().primaryKey(),
    userId: bigint("user_id", { mode: "bigint" }).notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }).$type<string>(),
    name: varchar("name", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 20 }).default("💰").notNull(),
    targetAmount: decimal("target_amount", { precision: 15, scale: 2 }).notNull(),
    periodType: budgetPeriodTypeEnum("period_type").default("monthly").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    isAllCategories: boolean("is_all_categories").default(false).notNull(),
    status: budgetStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdStatusIdx: index("idx_budgets_user_status").on(table.userId, table.status),
    userIdPeriodIdx: index("idx_budgets_user_period").on(table.userId, table.startDate, table.endDate),
  })
);

export const budgetCategories = pgTable(
  "budget_categories",
  {
    id: bigint("id", { mode: "bigint" }).$type<string>().generatedAlwaysAsIdentity().primaryKey(),
    budgetId: bigint("budget_id", { mode: "bigint" }).notNull().references(() => budgets.id, { onDelete: "cascade", onUpdate: "cascade" }).$type<string>(),
    categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade", onUpdate: "cascade" }),
    allocatedAmount: decimal("allocated_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  },
  (table) => ({
    budgetCategoriesIdx: index("idx_budget_categories").on(table.budgetId, table.categoryId),
    budgetCategoryUq: unique("uq_budget_category").on(table.budgetId, table.categoryId),
  })
);

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type NewBudgetCategory = typeof budgetCategories.$inferInsert;
