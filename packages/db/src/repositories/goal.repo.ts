import { eq, and, isNull } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../schema/index";
import { goals, type Goal, type NewGoal } from "../schema/goals";
import { BaseRepository, type DB } from "./base-repository";

export class GoalRepository extends BaseRepository {
  private get typedDb() {
    return this.db as unknown as MySql2Database<typeof schema>;
  }

  async findAll(userId: string): Promise<Goal[]> {
    return this.typedDb
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), isNull(goals.deletedAt)));
  }

  async findActive(userId: string): Promise<Goal[]> {
    return this.typedDb
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.status, "active"), isNull(goals.deletedAt)));
  }

  async findById(id: string, userId: string): Promise<Goal | undefined> {
    const [row] = await this.typedDb
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId), isNull(goals.deletedAt)))
      .limit(1);
    return row;
  }

  async findByIdempotencyKey(userId: string, key: string): Promise<Goal | undefined> {
    const [row] = await this.typedDb
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.idempotencyKey, key), isNull(goals.deletedAt)))
      .limit(1);
    return row;
  }

  async create(data: NewGoal): Promise<Goal> {
    const [result] = await this.typedDb.insert(goals).values(data);
    const insertId = String(result.insertId);
    const [row] = await this.typedDb.select().from(goals).where(eq(goals.id, String(insertId))).limit(1);
    if (!row) throw new Error("Failed to create goal");
    return row;
  }

  async update(id: string, userId: string, data: Partial<NewGoal>, tx?: DB): Promise<Goal> {
    const client = tx || this.typedDb;
    await client
      .update(goals)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));
    
    // We should use the same client to find the record to maintain transaction isolation
    const [row] = await client
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId), isNull(goals.deletedAt)))
      .limit(1);
    
    if (!row) throw new Error("Goal not found after update");
    return row;
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.typedDb
      .update(goals)
      .set({ deletedAt: new Date() })
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));
  }
}
