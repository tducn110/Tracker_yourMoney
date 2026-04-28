// apps/api/src/services/category-service.ts
import type { CategoryRepository } from "@finance/db/src/repositories/category-repository";
import type { InsertCategory, UpdateCategory } from "@finance/shared-schemas";

/**
 * Service for managing categories.
 * Implements business logic and uses CategoryRepository for data access.
 */
export class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

  async getCategories(userId: string) {
    return this.repository.findAll(userId);
  }

  async createCategory(userId: string, input: InsertCategory) {
    return this.repository.create({
      userId: userId as any,
      name: input.name,
      type: input.type,
      icon: input.icon,
      color: input.color,
      sortOrder: input.sortOrder,
    });
  }

  async updateCategory(userId: string, id: number, input: UpdateCategory) {
    const existing = await this.repository.findById(id, userId);

    if (!existing) {
      throw Object.assign(new Error("Danh mục không tồn tại hoặc không có quyền sửa"), { code: "NOT_FOUND" });
    }

    return this.repository.update(id, userId, {
      ...input,
    });
  }

  async deleteCategory(userId: string, id: number) {
    const existing = await this.repository.findById(id, userId);

    if (!existing) {
      throw Object.assign(new Error("Danh mục không tồn tại hoặc không có quyền xóa"), { code: "NOT_FOUND" });
    }

    await this.repository.delete(id, userId);
  }
}
