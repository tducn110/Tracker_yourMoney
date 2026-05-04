import { eq, and } from "drizzle-orm";
import { goals, type Goal, type NewGoal } from "../schema/goals";
import { BaseRepository, type DB } from "./base-repository";

export class GoalRepository extends BaseRepository {
  async findAll(userId: string): Promise<Goal[]> {
    return this.db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId));
  }

  async findActive(userId: string): Promise<Goal[]> {
    return this.db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.status, "active")));
  }

  async findById(id: string, userId: string): Promise<Goal | undefined> {
    const [row] = await this.db
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .limit(1);
    return row;
  }

  async findByIdempotencyKey(userId: string, key: string): Promise<Goal | undefined> {
    const [row] = await this.db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.idempotencyKey, key)))
      .limit(1);
    return row;
  }

  async create(data: NewGoal, tx?: DB): Promise<Goal> {
    const client = tx || this.db;
    const [row] = await client.insert(goals).values(data).returning();
    if (!row) throw new Error("Failed to create goal");
    return row;
  }

  async update(id: string, userId: string, data: Partial<NewGoal>, tx?: DB): Promise<Goal> {
    const client = tx || this.db;
    await client
      .update(goals)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));

    const [row] = await client
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .limit(1);

    if (!row) throw new Error("Goal not found after update");
    return row;
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.db
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));
  }
}
