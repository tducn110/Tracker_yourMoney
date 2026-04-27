import { mysqlTable, bigint, int, varchar, decimal, date, timestamp, mysqlEnum, tinyint, index, unique } from "drizzle-orm/mysql-core";
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
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userIdStatusIdx: index("idx_budgets_user_status").on(table.userId, table.status, table.deletedAt),
    userIdPeriodIdx: index("idx_budgets_user_period").on(table.userId, table.startDate, table.endDate),
  })
);

export const budgetCategories = mysqlTable(
  "budget_categories",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement().$type<string>(),
    budgetId: bigint("budget_id", { mode: "number" }).notNull().references(() => budgets.id, { onDelete: "cascade", onUpdate: "cascade" }).$type<string>(),
    categoryId: int("category_id").notNull().references(() => categories.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => ({
    budgetCategoriesIdx: index("idx_budget_categories").on(table.budgetId, table.categoryId),
    budgetCategoryUq: unique("uq_budget_category").on(table.budgetId, table.categoryId),
  })
);

export const budgetWallets = mysqlTable(
  "budget_wallets",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement().$type<string>(),
    budgetId: bigint("budget_id", { mode: "number" }).notNull().references(() => budgets.id, { onDelete: "cascade", onUpdate: "cascade" }).$type<string>(),
    walletId: varchar("wallet_id", { length: 50 }).notNull(),
  },
  (table) => ({
    budgetWalletsIdx: index("idx_budget_wallets").on(table.budgetId, table.walletId),
    budgetWalletUq: unique("uq_budget_wallet").on(table.budgetId, table.walletId),
  })
);

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type NewBudgetCategory = typeof budgetCategories.$inferInsert;
export type BudgetWallet = typeof budgetWallets.$inferSelect;
export type NewBudgetWallet = typeof budgetWallets.$inferInsert;
