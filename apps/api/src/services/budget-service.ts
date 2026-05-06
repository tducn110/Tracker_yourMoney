import { db } from "@finance/db";
import {
  budgets,
  budgetCategories,
  type NewBudget,
} from "@finance/db/src/schema/budgets";
import { transactions } from "@finance/db/src/schema/transactions";
import { categories } from "@finance/db/src/schema/categories";
import { and, eq, sum, gte, lte, inArray, sql, desc } from "@finance/db";
import Decimal from "decimal.js";
import { NotFoundError } from "../lib/errors";
import type { InsertBudgetInput, UpdateBudgetInput } from "@finance/shared-schemas";

export class BudgetService {
  async getBudgets(userId: string) {
    // 1. Get all budgets for the user with their calculated spent amount in one query
    // This optimization uses SQL-level aggregation (SUM) to avoid fetching thousands of transactions
    const budgetData = await db
      .select({
        budget: budgets,
        spent: sql<string>`COALESCE(SUM(
          CASE 
            WHEN ${transactions.id} IS NOT NULL THEN ${transactions.amount} 
            ELSE 0 
          END
        ), '0.00')`.as("spent"),
      })
      .from(budgets)
      // Use LEFT JOIN to catch budgets even with no categories or no transactions
      .leftJoin(budgetCategories, eq(budgets.id, budgetCategories.budgetId))
      .leftJoin(
        transactions,
        and(
          eq(transactions.userId, budgets.userId),
          eq(transactions.type, "expense"),
          gte(transactions.displayDate, budgets.startDate),
          lte(transactions.displayDate, budgets.endDate),
          sql`(${budgets.isAllCategories} = true OR ${transactions.categoryId} = ${budgetCategories.categoryId})`,
        )
      )
      .where(eq(budgets.userId, userId))
      .groupBy(budgets.id)
      .orderBy(desc(budgets.createdAt));

    return budgetData.map(({ budget, spent }) => ({
      ...budget,
      spent: new Decimal(spent).toFixed(2),
    }));
  }


  async getBudgetSummary(userId: string) {
    const activeBudgets = await db
      .select({
        budget: budgets,
        spent: sql<string>`COALESCE(SUM(
          CASE 
            WHEN ${transactions.id} IS NOT NULL THEN ${transactions.amount} 
            ELSE 0 
          END
        ), '0.00')`.as("spent"),
      })
      .from(budgets)
      .leftJoin(budgetCategories, eq(budgets.id, budgetCategories.budgetId))
      .leftJoin(
        transactions,
        and(
          eq(transactions.userId, budgets.userId),
          eq(transactions.type, "expense"),
          gte(transactions.displayDate, budgets.startDate),
          lte(transactions.displayDate, budgets.endDate),
          sql`(${budgets.isAllCategories} = true OR ${transactions.categoryId} = ${budgetCategories.categoryId})`,
        )
      )
      .where(and(eq(budgets.userId, userId), eq(budgets.status, "active")))
      .groupBy(budgets.id);

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

    // Now fetch total income in current month
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
          gte(transactions.displayDate, incomeStart),
          lte(transactions.displayDate, incomeEnd),
        ),
      );

    let totalLimit = new Decimal(0);
    let totalSpent = new Decimal(0);
    let totalProjected = new Decimal(0);
    const today = new Date();

    for (const { budget, spent } of activeBudgets) {
      const bLimit = new Decimal(budget.targetAmount);
      totalLimit = totalLimit.plus(bLimit);

      const bSpent = new Decimal(spent);
      totalSpent = totalSpent.plus(bSpent);

      // Calculate projected
      const start = new Date(budget.startDate);
      const end = new Date(budget.endDate);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const daysElapsed = Math.max(1, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

      const bProjected = bSpent.div(daysElapsed).times(totalDays);
      totalProjected = totalProjected.plus(bProjected);
    }

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
      throw new NotFoundError("Budget not found");

    // Fetch budget categories + related transactions (categories needed for tx filter)
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
      gte(transactions.displayDate, budget.startDate),
      lte(transactions.displayDate, budget.endDate),
    ];
    if (!budget.isAllCategories && categoryIds.length > 0) {
      txFilters.push(inArray(transactions.categoryId, categoryIds));
    }
    const relatedTxs = await db
      .select()
      .from(transactions)
      .where(and(...txFilters))
      .orderBy(desc(transactions.displayDate));

    // Compute spent from the already-fetched transactions (no extra query)
    const spent = relatedTxs.reduce(
      (sum, tx) => sum.plus(new Decimal(tx.amount)),
      new Decimal(0),
    );
    const left = new Decimal(budget.targetAmount).minus(spent);
    const percent = new Decimal(budget.targetAmount).isZero()
      ? 0
      : spent.div(budget.targetAmount).times(100).toNumber();

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

  async createBudget(userId: string, input: InsertBudgetInput & { idempotencyKey?: string }) {
    const newBudget: NewBudget = {
      userId: userId,
      name: input.name,
      icon: input.icon,
      targetAmount: input.targetAmount,
      periodType: input.periodType,
      startDate: input.startDate,
      endDate: input.endDate,
      isAllCategories: Boolean(input.isAllCategories),
      status: "active",
    };
    const [insertedBudget] = await db.insert(budgets).values(newBudget).returning();
    const budgetId = String(insertedBudget?.id ?? "");
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

  async updateBudget(userId: string, budgetId: string, input: UpdateBudgetInput) {
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
      throw new NotFoundError("Budget not found");

    await db
      .update(budgets)
      .set({
        name: input.name,
        icon: input.icon,
        targetAmount: input.targetAmount,
        periodType: input.periodType,
        startDate: input.startDate,
        endDate: input.endDate,
        isAllCategories: Boolean(input.isAllCategories),
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
      throw new NotFoundError("Budget not found");
    await db
      .delete(budgets)
      .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)));
  }

  private async calculateSpent(budget: any): Promise<Decimal> {
    const [row] = await db
      .select({
        total: sql<string>`COALESCE(SUM(
          CASE 
            WHEN ${transactions.id} IS NOT NULL THEN ${transactions.amount} 
            ELSE 0 
          END
        ), '0.00')`
      })
      .from(transactions)
      .leftJoin(budgetCategories, eq(budgetCategories.budgetId, budget.id))
      .where(
        and(
          eq(transactions.userId, budget.userId),
          eq(transactions.type, "expense"),
          gte(transactions.displayDate, budget.startDate),
          lte(transactions.displayDate, budget.endDate),
          sql`(${budget.isAllCategories} = true OR ${transactions.categoryId} = ${budgetCategories.categoryId})`
        )
      );

    return new Decimal(row?.total ?? "0");
  }
}
