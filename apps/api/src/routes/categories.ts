// apps/api/src/routes/categories.ts
import { Hono } from "hono";
import { zValidator } from "../lib/validator";
import { insertCategorySchema, updateCategorySchema } from "@finance/shared-schemas";
import { categoryService } from "../services/container";
import { ok, created, err } from "../lib/response";

export const categoryRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/", async (c) => {
    const data = await categoryService.getCategories(c.get("userId"));
    return ok(c, data);
  })

  .post("/", zValidator("json", insertCategorySchema), async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");
    try {
      const category = await categoryService.createCategory(userId, input);
      return created(c, category);
    } catch (e: any) {
      if (e.message?.includes("Duplicate")) {
        return err(c, 409, "DUPLICATE", "Danh mục đã tồn tại");
      }
      throw e;
    }
  })

  .put("/:id", zValidator("json", updateCategorySchema), async (c) => {
    const userId = c.get("userId");
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return err(c, 400, "INVALID_ID", "ID danh mục không hợp lệ");

    try {
      const category = await categoryService.updateCategory(userId, id, c.req.valid("json"));
      return ok(c, category);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  })

  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return err(c, 400, "INVALID_ID", "ID danh mục không hợp lệ");

    try {
      await categoryService.deleteCategory(userId, id);
      return ok(c, { message: "Đã xóa danh mục" });
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  });

