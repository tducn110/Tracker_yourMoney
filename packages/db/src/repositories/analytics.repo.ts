// packages/db/src/repositories/analytics.repo.ts
import { and, eq, sql } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../schema/index";
import { transactions, bills, goals, userSettings } from "../schema";
import { BaseRepository, type DB } from "./base-repository";

export class AnalyticsRepository extends BaseRepository {
  private get typedDb() {
    return this.db as unknown as MySql2Database<typeof schema>;
  }

  /**
   * Get monthly totals for income and expenses.
   */
  async getMonthlySummary(userId: string, month: string, tx?: DB) {
    const client = (tx || this.db) as unknown as MySql2Database<typeof schema>;
    const [year, mon] = month.split("-").map(Number);
    const startDate = `${year}-${String(mon).padStart(2, "0")}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${year}-${String(mon).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const dateFilter = and(
      eq(transactions.userId, userId),
      sql`${transactions.displayDate} >= ${startDate}`,
      sql`${transactions.displayDate} <= ${endDate}`,
    );

    // Single query with GROUP BY instead of two serial queries
    const summaryRows = await client
      .select({
        type: transactions.type,
        total: sql<string>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .where(dateFilter)
      .groupBy(transactions.type);

    let totalIncome = "0.00";
    let totalExpense = "0.00";
    for (const row of summaryRows) {
      if (row.type === "income") totalIncome = row.total ?? "0.00";
      else if (row.type === "expense") totalExpense = row.total ?? "0.00";
    }

    return { totalIncome, totalExpense };
  }

  /**
   * Get user settings for financial calculations.
   */
  async getUserConfig(userId: string, tx?: DB) {
    const client = (tx || this.db) as unknown as MySql2Database<typeof schema>;
    const [settings] = await client
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings || null;
  }

  /**
   * Get monthly commitments from active bills.
   */
  async getActiveBillsTotal(userId: string, tx?: DB) {
    const client = (tx || this.db) as unknown as MySql2Database<typeof schema>;
    const rows = await client
      .select({ total: sql<string>`sum(${bills.amount})` })
      .from(bills)
      .where(
        and(
          eq(bills.userId, userId),
          eq(bills.isActive, 1),
        ),
      );
    const row = rows[0];
    return row?.total ?? "0.00";
  }

  /**
   * Get monthly allocations to active goals.
   */
  async getActiveGoalsAllocation(userId: string, tx?: DB) {
    const client = (tx || this.db) as unknown as MySql2Database<typeof schema>;
    const rows = await client
      .select({ total: sql<string>`sum(${goals.monthlyContribution})` })
      .from(goals)
      .where(
        and(
          eq(goals.userId, userId),
          eq(goals.status, "active"),
        ),
      );
    const row = rows[0];
    return row?.total ?? "0.00";
  }
}
