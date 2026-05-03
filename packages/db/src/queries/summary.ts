import { db } from "../client";
import { transactions, bills, goals, userSettings } from "../schema";
import { and, eq, sum, sql } from "drizzle-orm";

interface MonthlySummary {
  totalIncome: string;
  totalExpense: string;
}

export async function getMonthlySummary(
  userId: string,
  month: string, // "YYYY-MM"
): Promise<MonthlySummary> {
  const [year, mon] = month.split("-").map(Number);
  const startDate = `${year}-${String(mon).padStart(2, "0")}-01`;
  const lastDay = new Date(year, mon, 0).getDate();
  const endDate = `${year}-${String(mon).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const dateFilter = and(
    eq(transactions.userId, userId),
    sql`${transactions.displayDate} >= ${startDate}`,
    sql`${transactions.displayDate} <= ${endDate}`,
  );

  const [incomeRow] = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(and(dateFilter, eq(transactions.type, "income")));

  const [expenseRow] = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(and(dateFilter, eq(transactions.type, "expense")));

  return {
    totalIncome:  incomeRow?.total  ?? "0.00",
    totalExpense: expenseRow?.total ?? "0.00",
  };
}

// Get user settings (emergency buffer, etc.) for Budget calculation
export async function getUserFinancialConfig(userId: string) {
  const [settings] = await db
    .select({
      monthlyBudget:  userSettings.monthlyBudget,
      emergencyBuffer: userSettings.emergencyBuffer,
      incomeDate:     userSettings.incomeDate,
    })
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

  return settings;
}

// Get total active bills commitment for the month
export async function getActiveBillsTotal(userId: string) {
  const [row] = await db
    .select({ total: sum(bills.amount) })
    .from(bills)
    .where(
      and(
        eq(bills.userId, userId),
        eq(bills.isActive, true),
      ),
    );

  return row?.total ?? "0.00";
}

// Get total active goals monthly contribution
export async function getActiveGoalsAllocation(userId: string) {
  const [row] = await db
    .select({ total: sum(goals.monthlyContribution) })
    .from(goals)
    .where(
      and(
        eq(goals.userId, userId),
        eq(goals.status, "active"),
      ),
    );

  return row?.total ?? "0.00";
}
