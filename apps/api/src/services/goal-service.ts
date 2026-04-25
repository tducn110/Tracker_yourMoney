// apps/api/src/services/goal-service.ts
import Decimal from "decimal.js";
import { db, notifications } from "@finance/db";
import type { GoalRepository } from "@finance/db/src/repositories/goal.repo";
import type { InsertGoal, UpdateGoal, ContributeGoal } from "@finance/shared-schemas";

export class GoalService {
  constructor(private readonly repository: GoalRepository) {}

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

    const newSaved = new Decimal(goal.currentSaved).plus(new Decimal(input.amount));
    const target   = new Decimal(goal.targetAmount);
    const isComplete = newSaved.gte(target);

    const updated = await this.repository.update(goalId, userId, {
      currentSaved: newSaved.toFixed(2),
      ...(isComplete && { status: "completed", completedAt: new Date() }),
    });

    if (isComplete) {
      // @ts-ignore - Drizzle Proxy issue
      await db.insert(notifications).values({
        userId: userId as any,
        type: "goal_completed",
        title: "🎉 Mục tiêu hoàn thành!",
        body: `Chúc mừng! Bạn đã đạt mục tiêu "${goal.name}"`,
      });
    }

    return updated;
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

