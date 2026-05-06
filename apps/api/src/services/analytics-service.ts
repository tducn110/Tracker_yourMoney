import { db, transactions, categories } from "@finance/db";
import { eq, and, gte, lte, sum, desc, sql } from "@finance/db";
import Decimal from "decimal.js";

interface CategorySpending {
  categoryId: number;
  categoryName: string;
  amount: string;
  icon: string;
  color: string;
}

function fmtDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Service for financial analytics.
 * Calculates spending by category and monthly trends.
 */
export class AnalyticsService {
  async getCategorySpending(userId: string, month: string): Promise<CategorySpending[]> {
    const [year, mon] = month.split("-").map(Number);
    const startDate = fmtDate(year, mon, 1);
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = fmtDate(year, mon, lastDay);

    const rows = await (db as any)
      .select({
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        icon: categories.icon,
        color: categories.color,
        total: sum(transactions.amount),
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId as any),
          eq(transactions.type, "expense"),
          gte(transactions.displayDate, startDate),
          lte(transactions.displayDate, endDate),
        )
      )
      .groupBy(transactions.categoryId, categories.name, categories.icon, categories.color)
      .orderBy(desc(sum(transactions.amount)));

    return rows.map((row: any) => ({
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      icon: row.icon,
      color: row.color,
      amount: new Decimal(row.total ?? "0").toFixed(2),
    }));
  }

  async getMonthlyTrend(userId: string, numMonths: number = 6) {
    const now = new Date();
    const year = now.getFullYear();
    const mon = now.getMonth() + 1; // 1-12

    // N-th month ago start date
    const startDate = fmtDate(year, mon, 1); // simplified start
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = fmtDate(year, mon, lastDay);

    const rows = await (db as any)
      .select({
        month: sql<string>`TO_CHAR(${transactions.displayDate}::date, 'YYYY-MM')`.as("month"),
        type: transactions.type,
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId as any),
          gte(transactions.displayDate, startDate),
          lte(transactions.displayDate, endDate),
        )
      )
      .groupBy(sql`month`, transactions.type);

    const result: Record<string, { month: string, income: string, expense: string }> = {};

    for (let i = 0; i < numMonths; i++) {
      const d = new Date(year, mon - numMonths + i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      result[mStr] = { month: mStr, income: "0.00", expense: "0.00" };
    }

    for (const row of rows as any[]) {
      if (!result[row.month]) continue;

      if (row.type === "income") {
        result[row.month].income = new Decimal(row.total ?? "0").toFixed(2);
      } else if (row.type === "expense") {
        result[row.month].expense = new Decimal(row.total ?? "0").toFixed(2);
      }
    }

    return Object.values(result).sort((a, b) => a.month.localeCompare(b.month));
  }
}
