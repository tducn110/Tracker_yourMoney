// apps/api/src/services/goal-service.ts
import Decimal from "decimal.js";
import { db, notifications, wallets, walletLogs, transactions, and, eq, sql } from "@finance/db";
import type { GoalRepository } from "@finance/db/src/repositories/goal.repo";
import type { InsertGoal, UpdateGoal, ContributeGoal } from "@finance/shared-schemas";

import type { TransactionRepository } from "@finance/db/src/repositories/transaction.repo";
import type { CategoryRepository } from "@finance/db/src/repositories/category-repository";

export class GoalService {
  constructor(
    private readonly repository: GoalRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  async getActiveGoals(userId: string) {
    return this.repository.findActive(userId);
  }

  async getAllGoals(userId: string) {
    return this.repository.findAll(userId);
  }

  async createGoal(userId: string, input: InsertGoal & { idempotencyKey?: string }) {
    return this.repository.create({
      userId: userId as any,
      name: input.name,
      icon: input.icon,
      targetAmount: input.targetAmount,
      monthlyContribution: input.monthlyContribution,
      deadline: input.deadline ?? null,
      priority: input.priority,
      notes: input.notes ?? null,
      status: "active",
      idempotencyKey: input.idempotencyKey,
    });
  }

  async getGoalByIdempotencyKey(userId: string, key: string) {
    return this.repository.findByIdempotencyKey(userId, key);
  }

  async contributeToGoal(userId: string, goalId: string, input: ContributeGoal & { idempotencyKey?: string }) {
    const goal = await this.repository.findById(goalId, userId);
    if (!goal) throw Object.assign(new Error("Mục tiêu không tồn tại"), { code: "NOT_FOUND" });

    if (goal.status === "completed" || goal.status === "cancelled") {
      throw Object.assign(
        new Error(`Không thể thêm tiền vào mục tiêu đã ${goal.status === "completed" ? "hoàn thành" : "hủy"}`),
        { code: "GOAL_INACTIVE" },
      );
    }

    // Fetch wallet for balance update + OCC
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.id, input.walletId as any), eq(wallets.userId, userId as any)))
      .limit(1);

    if (!wallet) throw Object.assign(new Error("Không tìm thấy ví"), { code: "NOT_FOUND" });

    const amount = new Decimal(input.amount);
    const balanceBefore = new Decimal(wallet.balance);
    const balanceAfter = balanceBefore.minus(amount);

    return await db.transaction(async (tx) => {
      // 1. Update wallet balance (OCC)
      const updateResult = await tx.update(wallets).set({
        balance: balanceAfter.toFixed(2),
        version: sql`version + 1`,
        updatedAt: new Date(),
      }).where(and(
        eq(wallets.id, input.walletId as any),
        eq(wallets.userId, userId as any),
        eq(wallets.version, wallet.version ?? 0),
      ));

      if (updateResult.rowCount === 0) {
        throw Object.assign(new Error("Xung đột cập nhật — vui lòng thử lại"), { code: "CONFLICT" });
      }

      // 2. Update Goal
      const newSaved = amount.plus(new Decimal(goal.currentSaved));
      const target   = new Decimal(goal.targetAmount);
      const isComplete = newSaved.gte(target);

      const updated = await this.repository.update(goalId, userId, {
        currentSaved: newSaved.toFixed(2),
        ...(isComplete && { status: "completed", completedAt: new Date() }),
      }, tx);

      // 3. Find Savings Category
      const savingsCategory = await this.categoryRepository.findByName("Tiết Kiệm", userId, tx);
      if (!savingsCategory) {
        throw new Error("Không tìm thấy danh mục 'Tiết Kiệm' để tạo giao dịch");
      }

      // 4. Create Transaction (Expense from cash wallet)
      const [createdTx] = await tx.insert(transactions).values({
        userId: userId as any,
        walletId: input.walletId as any,
        categoryId: savingsCategory.id,
        amount: input.amount,
        type: "expense",
        note: `Tiết kiệm cho mục tiêu: ${goal.name}`,
        displayDate: new Date().toISOString().split('T')[0],
        source: "goal_contribution",
        idempotencyKey: input.idempotencyKey ?? null,
      }).returning({ id: transactions.id });

      // 5. Audit log
      await tx.insert(walletLogs).values({
        walletId: input.walletId as any,
        userId: userId as any,
        transactionId: createdTx?.id as any ?? null,
        balanceBefore: balanceBefore.toFixed(2),
        balanceAfter: balanceAfter.toFixed(2),
        difference: amount.negated().toFixed(2),
        note: `Đóng góp mục tiêu: ${goal.name}`,
        idempotencyKey: input.idempotencyKey ?? null,
      });

      if (isComplete) {
        await tx.insert(notifications).values({
          userId: userId as any,
          type: "goal_completed",
          title: "🎉 Mục tiêu hoàn thành!",
          body: `Chúc mừng! Bạn đã đạt mục tiêu "${goal.name}"`,
        });
      }

      return updated;
    });
  }

  async updateGoal(userId: string, id: string, input: UpdateGoal) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) throw Object.assign(new Error("Mục tiêu không tồn tại"), { code: "NOT_FOUND" });

    return this.repository.update(id, userId, {
      ...input,
      deadline: input.deadline ?? undefined,
    });
  }

  async deleteGoal(userId: string, goalId: string) {
    const existing = await this.repository.findById(goalId, userId);
    if (!existing) throw Object.assign(new Error("Không tìm thấy mục tiêu"), { code: "NOT_FOUND" });
    await this.repository.delete(goalId, userId);
  }
}

