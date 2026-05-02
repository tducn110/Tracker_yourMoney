import { db } from "@finance/db";
import {
  budgets,
  budgetCategories,
  type NewBudget,
} from "@finance/db/src/schema/budgets";
import { transactions } from "@finance/db/src/schema/transactions";
import { categories } from "@finance/db/src/schema/categories";
import { and, eq, sum, between, inArray, sql, desc } from "drizzle-orm";
import Decimal from "decimal.js";

export class BudgetService {
  async getBudgets(userId: string) {
    const userBudgets = await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId));

    if (userBudgets.length === 0) return [];

    // Batch compute spent per budget (3 queries total, no N+1)
    const budgetIds = userBudgets.map((b) => b.id);
    const allBudgetCats = await db
      .select()
      .from(budgetCategories)
      .where(inArray(budgetCategories.budgetId, budgetIds));

    const budgetCatMap = new Map<string, number[]>();
    for (const bc of allBudgetCats) {
      const bid = String(bc.budgetId);
      if (!budgetCatMap.has(bid)) budgetCatMap.set(bid, []);
      budgetCatMap.get(bid)!.push(Number(bc.categoryId));
    }

    let minDate = userBudgets[0].startDate;
    let maxDate = userBudgets[0].endDate;
    for (const b of userBudgets) {
      if (b.startDate < minDate) minDate = b.startDate;
      if (b.endDate > maxDate) maxDate = b.endDate;
    }

    const allTxs = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "expense"),
          between(transactions.displayDate, minDate, maxDate),
        ),
      );

    return userBudgets.map((budget) => {
      const bCatIds = budgetCatMap.get(String(budget.id)) || [];
      const bTxs = allTxs.filter((tx) => {
        const inDate =
          tx.displayDate >= budget.startDate &&
          tx.displayDate <= budget.endDate;
        if (!inDate) return false;
        if (budget.isAllCategories) return true;
        return bCatIds.includes(Number(tx.categoryId));
      });

      const spent = bTxs.reduce(
        (sum, tx) => sum.plus(new Decimal(tx.amount)),
        new Decimal(0),
      );

      return {
        ...budget,
        spent: spent.toFixed(2),
      };
    });
  }

  async getBudgetSummary(userId: string) {
    const activeBudgets = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.status, "active"),
        ),
      );

    if (activeBudgets.length === 0) {
      return {
        totalLimit: "0.00",
        totalSpent: "0.00",
        totalIncome: "0.00",
        projectedSpending: "0.00",
        left: "0.00",
        percent: 0,
      };
    }

    // 1. Get all budget categories in one go
    const budgetIds = activeBudgets.map(b => b.id);
    const allBudgetCats = await db
      .select()
      .from(budgetCategories)
      .where(inArray(budgetCategories.budgetId, budgetIds));

    const budgetCatMap = new Map<string, number[]>();
    for (const bc of allBudgetCats) {
      const bid = String(bc.budgetId);
      if (!budgetCatMap.has(bid)) budgetCatMap.set(bid, []);
      budgetCatMap.get(bid)!.push(Number(bc.categoryId));
    }

    // 2. Find the overall date range to fetch transactions once
    let minDate = activeBudgets[0].startDate;
    let maxDate = activeBudgets[0].endDate;
    for (const b of activeBudgets) {
      if (b.startDate < minDate) minDate = b.startDate;
      if (b.endDate > maxDate) maxDate = b.endDate;
    }

    // 3. Fetch all expenses in this range
    const allTxs = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "expense"),
          between(transactions.displayDate, minDate, maxDate),
        )
      );

    // 4. Calculate spent and projected for each budget
    let totalLimit = new Decimal(0);
    let totalSpent = new Decimal(0);
    let totalProjected = new Decimal(0);
    const today = new Date();

    for (const budget of activeBudgets) {
      const bLimit = new Decimal(budget.targetAmount);
      totalLimit = totalLimit.plus(bLimit);

      // Filter transactions for this specific budget
      const bCatIds = budgetCatMap.get(String(budget.id)) || [];
      const bTxs = allTxs.filter(tx => {
        const inDate = tx.displayDate >= budget.startDate && tx.displayDate <= budget.endDate;
        if (!inDate) return false;
        if (budget.isAllCategories) return true;
        return bCatIds.includes(Number(tx.categoryId));
      });

      const bSpent = bTxs.reduce((sum, tx) => sum.plus(tx.amount), new Decimal(0));
      totalSpent = totalSpent.plus(bSpent);

      // Calculate projected
      const start = new Date(budget.startDate);
      const end = new Date(budget.endDate);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const daysElapsed = Math.max(1, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      
      const bProjected = bSpent.div(daysElapsed).times(totalDays);
      totalProjected = totalProjected.plus(bProjected);
    }

    // 5. Get total income for current month (fixed to current calendar month)
    const now = new Date();
    const incomeStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const incomeEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const [incomeRow] = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "income"),
          between(transactions.displayDate, incomeStart, incomeEnd),
        ),
      );

    const left = totalLimit.minus(totalSpent);
    const percent = totalLimit.isZero() ? 0 : totalSpent.div(totalLimit).times(100).toNumber();

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

    // Lấy danh sách categories của budget (with names/icons)
    let categoryIds: number[] = [];
    let budgetCats: { categoryId: number; name: string; icon: string }[] = [];
    if (!budget.isAllCategories) {
      budgetCats = await db
        .select({
          categoryId: budgetCategories.categoryId,
          name: categories.name,
          icon: categories.icon,
        })
        .from(budgetCategories)
        .innerJoin(categories, eq(budgetCategories.categoryId, categories.id))
        .where(eq(budgetCategories.budgetId, budget.id));
      categoryIds = budgetCats.map((c) => Number(c.categoryId));
    }
    const txFilters = [
      eq(transactions.userId, userId),
      eq(transactions.type, "expense"),
      between(transactions.displayDate, budget.startDate, budget.endDate),
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
      categories: budgetCats,
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
        ),
      )
      .limit(1);
    if (!existing)
      throw Object.assign(new Error("Budget not found"), { code: "NOT_FOUND" });
    await db
      .delete(budgets)
      .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)));
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
