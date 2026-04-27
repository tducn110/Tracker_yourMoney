import { and, eq, isNull, or } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../schema/index";
import { categories, type Category, type NewCategory } from "../schema/categories";
import { BaseRepository, type DB } from "./base-repository";

/**
 * Repository for Category operations.
 * Decouples database logic from business services.
 */
export class CategoryRepository extends BaseRepository {
  // Helper to get a typed database instance to avoid union issues with select/insert overloads
  private get typedDb() {
    return this.db as unknown as MySql2Database<typeof schema>;
  }

  /**
   * Find all categories for a user, including global system categories.
   */
  async findAll(userId: string, tx?: DB) {
    const client = (tx || this.db) as unknown as MySql2Database<typeof schema>;
    return client
      .select()
      .from(categories)
      .where(
        and(
          or(isNull(categories.userId), eq(categories.userId, userId)),
          isNull(categories.deletedAt)
        )
      )
      .orderBy(categories.sortOrder);
  }

  /**
   * Find a specific category by ID and userId.
   */
  async findById(id: number, userId: string, tx?: DB) {
    const client = (tx || this.db) as unknown as MySql2Database<typeof schema>;
    const [category] = await client
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, id),
          or(isNull(categories.userId), eq(categories.userId, userId)),
          isNull(categories.deletedAt)
        )
      )
      .limit(1);
    
    return category || null;
  }

  /**
   * Create a new category.
   */
  async create(data: NewCategory, tx?: DB) {
    const client = (tx || this.db) as unknown as MySql2Database<typeof schema>;
    const [result] = await client.insert(categories).values(data);
    
    const id = Number(result.insertId);
    const [newCategory] = await client.select().from(categories).where(eq(categories.id, id)).limit(1);
    return newCategory;
  }

  /**
   * Update an existing category.
   */
  async update(id: number, userId: string, data: Partial<NewCategory>, tx?: DB) {
    const client = (tx || this.db) as unknown as MySql2Database<typeof schema>;
    await client
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(categories.id, id),
          eq(categories.userId, userId),
          isNull(categories.deletedAt)
        )
      );
    
    return this.findById(id, userId, client);
  }

  /**
   * Find a category by name and userId.
   */
  async findByName(name: string, userId: string, tx?: DB) {
    const client = (tx || this.db) as unknown as MySql2Database<typeof schema>;
    const [category] = await client
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.name, name),
          or(isNull(categories.userId), eq(categories.userId, userId)),
          isNull(categories.deletedAt)
        )
      )
      .limit(1);
    
    return category || null;
  }

  /**
   * Soft delete a category.
   */
  async delete(id: number, userId: string, tx?: DB) {
    const client = (tx || this.db) as unknown as MySql2Database<typeof schema>;
    await client
      .update(categories)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(categories.id, id),
          eq(categories.userId, userId)
        )
      );
  }
}
