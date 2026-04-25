import { db } from "@finance/db";
import {
  budgets,
  budgetCategories,
  type NewBudget,
} from "@finance/db/src/schema/budgets";
import { transactions } from "@finance/db/src/schema/transactions";
import { and, eq, isNull, sum, between, inArray, sql, desc } from "drizzle-orm";
import Decimal from "decimal.js";

export class BudgetService {
  async getBudgets(userId: string) {
    return db
      .select()
      .from(budgets)
      .where(
        and(eq(budgets.userId, userId), isNull(budgets.deletedAt)),
      );
  }

  async getBudgetSummary(userId: string) {
    const activeBudgets = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.status, "active"),
          isNull(budgets.deletedAt),
        ),
      );

    let totalLimit = new Decimal(0);
    let totalSpent = new Decimal(0);
    let totalProjected = new Decimal(0);

    for (const budget of activeBudgets) {
      const detail = await this.getBudgetDetail(userId, String(budget.id));
      totalLimit = totalLimit.plus(budget.targetAmount);
      totalSpent = totalSpent.plus(detail.spent);
      totalProjected = totalProjected.plus(detail.projectedSpending);
    }

    // Get total income for current month
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const [incomeRow] = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "income"),
          between(transactions.displayDate, startDate, endDate),
          isNull(transactions.deletedAt),
        ),
      );

    const left = totalLimit.minus(totalSpent);
    const percent = totalLimit.isZero()
      ? 0
      : totalSpent.div(totalLimit).times(100).toNumber();

    return {
      totalLimit: totalLimit.toFixed(2),
      totalSpent: totalSpent.toFixed(2),
      totalIncome: new Decimal(incomeRow?.total ?? "0").toFixed(2),
      projectedSpending: totalProjected.toFixed(2),
      left: left.toFixed(2),
      percent: Math.round(percent),
    };
  }

  async getBudgetDetail(userId: string, budgetId: string) {
    const [budget] = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.id, budgetId),
          eq(budgets.userId, userId),
          isNull(budgets.deletedAt),
        ),
      )
      .limit(1);
    if (!budget)
      throw Object.assign(new Error("Budget not found"), { code: "NOT_FOUND" });

    const spent = await this.calculateSpent(budget);
    const left = new Decimal(budget.targetAmount).minus(spent);
    const percent = new Decimal(budget.targetAmount).isZero()
      ? 0
      : new Decimal(spent).div(budget.targetAmount).times(100).toNumber();

    // Lấy danh sách giao dịch thuộc budget
    let categoryIds: number[] = [];
    if (!budget.isAllCategories) {
      const budgetCats = await db
        .select({ categoryId: budgetCategories.categoryId })
        .from(budgetCategories)
        .where(eq(budgetCategories.budgetId, budget.id));
      categoryIds = budgetCats.map((c) => Number(c.categoryId));
    }
    const txFilters = [
      eq(transactions.userId, userId),
      eq(transactions.type, "expense"),
      between(transactions.displayDate, budget.startDate, budget.endDate),
      isNull(transactions.deletedAt),
    ];
    if (!budget.isAllCategories && categoryIds.length > 0) {
      txFilters.push(inArray(transactions.categoryId, categoryIds));
    }
    const relatedTxs = await db
      .select()
      .from(transactions)
      .where(and(...txFilters))
      .orderBy(desc(transactions.displayDate));

    // Tính recommended daily và projected spending
    const today = new Date();
    const start = new Date(budget.startDate);
    const end = new Date(budget.endDate);
    const totalDays =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysElapsed = Math.max(
      1,
      Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const daysRemaining = Math.max(
      0,
      Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const recommendedDaily =
      daysRemaining > 0
        ? new Decimal(budget.targetAmount)
            .minus(spent)
            .div(daysRemaining)
            .toNumber()
        : 0;
    const projectedSpending =
      daysElapsed > 0
        ? new Decimal(spent).div(daysElapsed).times(totalDays).toNumber()
        : 0;

    return {
      ...budget,
      spent: spent.toFixed(2),
      left: left.toFixed(2),
      percent: Math.round(percent),
      recommendedDaily,
      projectedSpending,
      daysElapsed,
      daysRemaining,
      transactions: relatedTxs,
    };
  }

  async createBudget(userId: string, input: any) {
    const newBudget: NewBudget = {
      userId: userId,
      name: input.name,
      icon: input.icon,
      targetAmount: input.targetAmount,
      periodType: input.periodType,
      startDate: input.startDate,
      endDate: input.endDate,
      isAllCategories: input.isAllCategories ? 1 : 0,
      walletScope: input.walletScope,
      status: "active",
    };
    const [result] = await db.insert(budgets).values(newBudget);
    const budgetId = result.insertId;
    if (!input.isAllCategories && input.categoryIds?.length) {
      await db.insert(budgetCategories).values(
        input.categoryIds.map((catId: number) => ({
          budgetId: budgetId,
          categoryId: catId,
        })),
      );
    }
    return this.getBudgetDetail(userId, String(budgetId));
  }

  async updateBudget(userId: string, budgetId: string, input: any) {
    const [existing] = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.id, budgetId),
          eq(budgets.userId, userId),
          isNull(budgets.deletedAt),
        ),
      )
      .limit(1);
    if (!existing)
      throw Object.assign(new Error("Budget not found"), { code: "NOT_FOUND" });

    await db
      .update(budgets)
      .set({
        name: input.name,
        icon: input.icon,
        targetAmount: input.targetAmount,
        periodType: input.periodType,
        startDate: input.startDate,
        endDate: input.endDate,
        isAllCategories: input.isAllCategories ? 1 : 0,
        walletScope: input.walletScope,
        updatedAt: new Date(),
      })
      .where(eq(budgets.id, budgetId));

    if (input.isAllCategories !== undefined || input.categoryIds) {
      await db
        .delete(budgetCategories)
        .where(eq(budgetCategories.budgetId, budgetId));
      
      if (input.isAllCategories === false && input.categoryIds?.length) {
        await db.insert(budgetCategories).values(
          input.categoryIds.map((catId: number) => ({
            budgetId: budgetId,
            categoryId: catId,
          })),
        );
      }
    }

    return this.getBudgetDetail(userId, budgetId);
  }

  async deleteBudget(userId: string, budgetId: string) {
    const [existing] = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.id, budgetId),
          eq(budgets.userId, userId),
          isNull(budgets.deletedAt),
        ),
      )
      .limit(1);
    if (!existing)
      throw Object.assign(new Error("Budget not found"), { code: "NOT_FOUND" });
    await db
      .update(budgets)
      .set({ deletedAt: new Date() })
      .where(eq(budgets.id, budgetId));
  }

  private async calculateSpent(budget: any): Promise<Decimal> {
    let categoryIds: number[] = [];
    if (!budget.isAllCategories) {
      const budgetCats = await db
        .select({ categoryId: budgetCategories.categoryId })
        .from(budgetCategories)
        .where(eq(budgetCategories.budgetId, budget.id));
      categoryIds = budgetCats.map((c) => Number(c.categoryId));
    }
    const filters = [
      eq(transactions.userId, budget.userId),
      eq(transactions.type, "expense"),
      between(transactions.displayDate, budget.startDate, budget.endDate),
      isNull(transactions.deletedAt),
    ];
    if (!budget.isAllCategories && categoryIds.length > 0) {
      filters.push(inArray(transactions.categoryId, categoryIds));
    }
    const [row] = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(...filters));
    return new Decimal(row?.total ?? "0");
  }
}
