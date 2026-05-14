import { and, eq, isNull, or } from "drizzle-orm";
import { categories, type NewCategory } from "../schema/categories";
import { BaseRepository, type DB } from "./base-repository";

/**
 * Repository for Category operations.
 * Decouples database logic from business services.
 * NOTE: isNull(categories.userId) is intentional — it identifies SYSTEM categories (userId = NULL).
 */
export class CategoryRepository extends BaseRepository {
  /**
   * Find all categories for a user, including global system categories.
   */
  async findAll(userId: string, tx?: DB) {
    const client = tx || this.db;
    return client
      .select()
      .from(categories)
      .where(
        or(isNull(categories.userId), eq(categories.userId, userId))
      )
      .orderBy(categories.sortOrder);
  }

  /**
   * Find a specific category by ID and userId.
   */
  async findById(id: number, userId: string, tx?: DB) {
    const client = tx || this.db;
    const [category] = await client
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, id),
          or(isNull(categories.userId), eq(categories.userId, userId))
        )
      )
      .limit(1);

    return category || null;
  }

  /**
   * Create a new category.
   */
  async create(data: NewCategory, tx?: DB) {
    const client = tx || this.db;
    const [newCategory] = await client.insert(categories).values(data).returning();
    if (!newCategory) throw new Error("Failed to create category");
    return newCategory;
  }

  /**
   * Update an existing category.
   */
  async update(id: number, userId: string, data: Partial<NewCategory>, tx?: DB) {
    const client = tx || this.db;
    const [updated] = await client
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(categories.id, id),
          eq(categories.userId, userId)
        )
      )
      .returning();

    return updated || null;
  }

  /**
   * Find a category by name and userId.
   */
  async findByName(name: string, userId: string, tx?: DB) {
    const client = tx || this.db;
    const [category] = await client
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.name, name),
          or(isNull(categories.userId), eq(categories.userId, userId))
        )
      )
      .limit(1);

    return category || null;
  }

  /**
   * Hard delete a user category.
   */
  async delete(id: number, userId: string, tx?: DB) {
    const client = tx || this.db;
    await client
      .delete(categories)
      .where(
        and(
          eq(categories.id, id),
          eq(categories.userId, userId)
        )
      );
  }
}
