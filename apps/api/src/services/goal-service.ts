// apps/api/src/services/goal-service.ts
import Decimal from "decimal.js";
import { db, notifications, wallets, walletLogs, transactions, and, eq, sql, SYSTEM_CATEGORY_NAMES, SAVINGS_CATEGORY_DEFAULTS } from "@finance/db";
import type { GoalRepository } from "@finance/db/src/repositories/goal.repo";
import type { InsertGoal, UpdateGoal, ContributeGoal } from "@finance/shared-schemas";
import { NotFoundError, ConflictError, BadRequestError } from "../lib/errors";

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
    const monthlyContribution = new Decimal(input.monthlyContribution || "0.00");
    const hasInitialContribution = monthlyContribution.gt(0) && input.walletId;

    if (!hasInitialContribution) {
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

    return await db.transaction(async (tx) => {
      // 1. Fetch wallet for balance update + OCC inside transaction
      const walletId = input.walletId!;
      const [wallet] = await tx
        .select()
        .from(wallets)
        .where(and(eq(wallets.id, walletId as any), eq(wallets.userId, userId as any)))
        .limit(1);

      if (!wallet) throw new NotFoundError("Không tìm thấy ví cho khoản đóng góp đầu tiên");

      const balanceBefore = new Decimal(wallet.balance);
      const balanceAfter = balanceBefore.minus(monthlyContribution);

      if (balanceAfter.isNegative()) {
        throw new BadRequestError("Số dư ví không đủ cho khoản đóng góp đầu tiên");
      }

      // 2. Create Goal
      const goal = await this.repository.create({
        userId: userId as any,
        name: input.name,
        icon: input.icon,
        targetAmount: input.targetAmount,
        currentSaved: input.monthlyContribution, // First month saved immediately
        monthlyContribution: input.monthlyContribution,
        deadline: input.deadline ?? null,
        priority: input.priority,
        notes: input.notes ?? null,
        status: "active",
        idempotencyKey: input.idempotencyKey,
      }, tx);

      // 3. Update wallet balance (OCC)
      const updateResult = await tx.update(wallets).set({
        balance: balanceAfter.toFixed(2),
        version: sql`version + 1`,
        updatedAt: new Date(),
      }).where(and(
        eq(wallets.id, walletId as any),
        eq(wallets.userId, userId as any),
        eq(wallets.version, wallet.version ?? 0),
      ));

      if ((updateResult as any).rowCount === 0) {
        throw new ConflictError("Xung đột cập nhật ví — vui lòng thử lại");
      }

      // 4. Find/Create Savings Category
      let savingsCategory = await this.categoryRepository.findByName(SYSTEM_CATEGORY_NAMES.SAVINGS, userId, tx);
      if (!savingsCategory) {
        savingsCategory = await this.categoryRepository.create({
          userId: userId as any,
          ...SAVINGS_CATEGORY_DEFAULTS,
        }, tx);
      }

      // 5. Create Transaction
      const createdTx = await this.transactionRepository.create({
        userId: userId as any,
        walletId: walletId as any,
        categoryId: savingsCategory.id,
        goalId: goal.id as any,
        amount: input.monthlyContribution,
        type: "expense", // From wallet's perspective
        note: `Tiết kiệm đầu kỳ cho mục tiêu: ${goal.name}`,
        displayDate: new Date().toISOString().split('T')[0],
      }, tx);

      // 6. Audit log
      await tx.insert(walletLogs).values({
        walletId: walletId as any,
        userId: userId as any,
        transactionId: createdTx?.id as any ?? null,
        balanceBefore: balanceBefore.toFixed(2),
        balanceAfter: balanceAfter.toFixed(2),
        difference: monthlyContribution.negated().toFixed(2),
        note: `Đóng góp đầu kỳ cho mục tiêu: ${goal.name}`,
        idempotencyKey: input.idempotencyKey ?? null,
      });

      return goal;
    });
  }

  async getGoalByIdempotencyKey(userId: string, key: string) {
    return this.repository.findByIdempotencyKey(userId, key);
  }

  async contributeToGoal(userId: string, goalId: string, input: ContributeGoal & { idempotencyKey?: string }) {
    const goal = await this.repository.findById(goalId, userId);
    if (!goal) throw new NotFoundError("Mục tiêu không tồn tại");

    if (goal.status === "completed" || goal.status === "cancelled") {
      throw new BadRequestError(`Không thể thêm tiền vào mục tiêu đã ${goal.status === "completed" ? "hoàn thành" : "hủy"}`, "GOAL_INACTIVE");
    }

    return await db.transaction(async (tx) => {
      // 1. Fetch wallet for balance update + OCC inside transaction
      const [wallet] = await tx
        .select()
        .from(wallets)
        .where(and(eq(wallets.id, input.walletId as any), eq(wallets.userId, userId as any)))
        .limit(1);

      if (!wallet) throw new NotFoundError("Không tìm thấy ví");

      const amount = new Decimal(input.amount);
      const balanceBefore = new Decimal(wallet.balance);
      const balanceAfter = balanceBefore.minus(amount);

      if (balanceAfter.isNegative()) {
        throw new BadRequestError("Số dư ví không đủ");
      }

      // 2. Update wallet balance (OCC)
      const updateResult = await tx.update(wallets).set({
        balance: balanceAfter.toFixed(2),
        version: sql`version + 1`,
        updatedAt: new Date(),
      }).where(and(
        eq(wallets.id, input.walletId as any),
        eq(wallets.userId, userId as any),
        eq(wallets.version, wallet.version ?? 0),
      ));

      if ((updateResult as any).rowCount === 0) {
        throw new ConflictError("Xung đột cập nhật — vui lòng thử lại");
      }

      // 3. Update Goal
      const currentSaved = new Decimal(goal.currentSaved);
      const newSaved = amount.plus(currentSaved);
      const target   = new Decimal(goal.targetAmount);
      const isComplete = newSaved.gte(target);

      const updated = await this.repository.update(goalId, userId, {
        currentSaved: newSaved.toFixed(2),
        ...(isComplete && { status: "completed", completedAt: new Date() }),
      }, tx);

      // 4. Find/Create Savings Category
      let savingsCategory = await this.categoryRepository.findByName(SYSTEM_CATEGORY_NAMES.SAVINGS, userId, tx);
      if (!savingsCategory) {
        savingsCategory = await this.categoryRepository.create({
          userId: userId as any,
          ...SAVINGS_CATEGORY_DEFAULTS,
        }, tx);
      }

      // 5. Create Transaction entry
      const contributionTx = await this.transactionRepository.create({
        userId: userId as any,
        walletId: input.walletId as any,
        categoryId: savingsCategory.id,
        goalId: goalId as any,
        amount: input.amount,
        type: "expense", // From wallet's perspective
        note: `Tiết kiệm cho mục tiêu: ${goal.name}`,
        displayDate: new Date().toISOString().split('T')[0],
        idempotencyKey: input.idempotencyKey ?? null,
      }, tx);

      // 6. Log wallet change
      await tx.insert(walletLogs).values({
        walletId: input.walletId as any,
        userId: userId as any,
        transactionId: contributionTx?.id as any,
        balanceBefore: balanceBefore.toFixed(2),
        balanceAfter: balanceAfter.toFixed(2),
        difference: amount.negated().toFixed(2),
        note: `Đóng góp mục tiêu: ${goal.name}`,
        idempotencyKey: input.idempotencyKey ?? null,
      });

      // 7. Notify if completed
      if (isComplete) {
        await tx.insert(notifications).values({
          userId: userId as any,
          type: "goal_completed",
          title: "🎉 Mục tiêu hoàn thành!",
          body: `Chúc mừng! Bạn đã hoàn thành mục tiêu: ${goal.name}`,
          isRead: false,
        });
      }

      return updated;
    });
  }

  async updateGoal(userId: string, id: string, input: UpdateGoal) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) throw new NotFoundError("Mục tiêu không tồn tại");

    return this.repository.update(id, userId, {
      ...input,
      deadline: input.deadline ? String(input.deadline) : undefined,
    });
  }

  async deleteGoal(userId: string, goalId: string) {
    const existing = await this.repository.findById(goalId, userId);
    if (!existing) throw new NotFoundError("Không tìm thấy mục tiêu");

    if (new Decimal(existing.currentSaved || "0").gt(0)) {
      throw new BadRequestError("Không thể xóa mục tiêu đã có tiền đóng góp. Vui lòng rút hết tiền trước khi xóa.");
    }

    await this.repository.delete(goalId, userId);
  }
}
