import { mysqlTable, bigint, int, varchar, decimal, date, timestamp, mysqlEnum, tinyint, index, unique } from "drizzle-orm/mysql-core";
// budget_wallets removed: placeholder for multi-wallet budget scoping — not implemented
// Will be re-added in issue for wallets feature
import { users } from "./users";
import { categories } from "./categories";

export const budgets = mysqlTable(
  "budgets",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement().$type<string>(),
    userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }).$type<string>(),
    name: varchar("name", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 20 }).default("💰").notNull(),
    targetAmount: decimal("target_amount", { precision: 15, scale: 2 }).notNull(),
    periodType: mysqlEnum("period_type", ["weekly", "monthly", "quarterly", "yearly", "custom"]).default("monthly").notNull(),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }).notNull(),
    isAllCategories: tinyint("is_all_categories").default(0).notNull(),
    walletScope: mysqlEnum("wallet_scope", ["all", "specific"]).default("all").notNull(),
    status: mysqlEnum("status", ["active", "finished"]).default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdStatusIdx: index("idx_budgets_user_status").on(table.userId, table.status),
    userIdPeriodIdx: index("idx_budgets_user_period").on(table.userId, table.startDate, table.endDate),
  })
);

export const budgetCategories = mysqlTable(
  "budget_categories",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement().$type<string>(),
    budgetId: bigint("budget_id", { mode: "number" }).notNull().references(() => budgets.id, { onDelete: "cascade", onUpdate: "cascade" }).$type<string>(),
    categoryId: int("category_id").notNull().references(() => categories.id, { onDelete: "cascade", onUpdate: "cascade" }),
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
