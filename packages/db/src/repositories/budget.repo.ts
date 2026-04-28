import { eq, and, inArray } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../schema/index";
import { budgets, budgetCategories, type Budget, type NewBudget } from "../schema/budgets";
import { BaseRepository, type DB } from "./base-repository";

export class BudgetRepository extends BaseRepository {
  private get typedDb() {
    return this.db as unknown as MySql2Database<typeof schema>;
  }

  async findAll(userId: string): Promise<Budget[]> {
    return this.typedDb
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId));
  }

  async findActive(userId: string): Promise<Budget[]> {
    return this.typedDb
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.status, "active")
        )
      );
  }

  async findById(id: string, userId: string): Promise<Budget | undefined> {
    const [row] = await this.typedDb
      .select()
      .from(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
      .limit(1);
    return row;
  }

  async getBudgetCategories(budgetId: string): Promise<number[]> {
    const rows = await this.typedDb
      .select({ categoryId: budgetCategories.categoryId })
      .from(budgetCategories)
      .where(eq(budgetCategories.budgetId, budgetId));
    return rows.map(r => Number(r.categoryId));
  }

  async getMultipleBudgetCategories(budgetIds: string[]): Promise<Map<string, number[]>> {
    if (budgetIds.length === 0) return new Map();
    
    const rows = await this.typedDb
      .select()
      .from(budgetCategories)
      .where(inArray(budgetCategories.budgetId, budgetIds));
      
    const map = new Map<string, number[]>();
    for (const row of rows) {
      const bid = String(row.budgetId);
      if (!map.has(bid)) map.set(bid, []);
      map.get(bid)!.push(Number(row.categoryId));
    }
    return map;
  }

  async create(data: NewBudget, categoryIds?: number[]): Promise<string> {
    return await this.typedDb.transaction(async (tx) => {
      const [result] = await tx.insert(budgets).values(data);
      const budgetId = String(result.insertId);
      
      if (categoryIds && categoryIds.length > 0) {
        await tx.insert(budgetCategories).values(
          categoryIds.map(catId => ({
            budgetId: budgetId as any,
            categoryId: catId,
          }))
        );
      }
      
      return budgetId;
    });
  }

  async update(id: string, userId: string, data: Partial<NewBudget>, categoryIds?: number[]): Promise<void> {
    await this.typedDb.transaction(async (tx) => {
      await tx
        .update(budgets)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
        
      if (categoryIds !== undefined) {
        await tx.delete(budgetCategories).where(eq(budgetCategories.budgetId, id));
        if (categoryIds.length > 0) {
          await tx.insert(budgetCategories).values(
            categoryIds.map(catId => ({
              budgetId: id as any,
              categoryId: catId,
            }))
          );
        }
      }
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.typedDb
      .delete(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
  }
}
