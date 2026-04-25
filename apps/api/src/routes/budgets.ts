import { Hono } from "hono";
import { zValidator } from "../lib/validator";
import {
  insertBudgetSchema,
  updateBudgetSchema,
} from "@finance/shared-schemas";
import { budgetService } from "../services/container";
import { ok, created, err } from "../lib/response";

export const budgetRoutes = new Hono<{ Variables: { userId: string } }>()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const budgets = await budgetService.getBudgets(userId);
    return ok(c, budgets);
  })
  .get("/summary", async (c) => {
    const userId = c.get("userId");
    const summary = await budgetService.getBudgetSummary(userId);
    return ok(c, summary);
  })
  .get("/:id", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    try {
      const detail = await budgetService.getBudgetDetail(userId, id);
      return ok(c, detail);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  })
  .post("/", zValidator("json", insertBudgetSchema), async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");
    const budget = await budgetService.createBudget(userId, input);
    return created(c, budget);
  })
  .put("/:id", zValidator("json", updateBudgetSchema), async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const input = c.req.valid("json");
    try {
      const updated = await budgetService.updateBudget(userId, id, input);
      return ok(c, updated);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  })
  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    try {
      await budgetService.deleteBudget(userId, id);
      return ok(c, { message: "Đã xóa ngân sách" });
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  });
