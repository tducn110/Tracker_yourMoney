// apps/api/src/routes/goals.ts
import { Hono } from "hono";
import { zValidator } from "../lib/validator";
import { insertGoalSchema, updateGoalSchema, contributeGoalSchema } from "@finance/shared-schemas";
import { goalService } from "../services/container";
import { ok, created, err } from "../lib/response";

export const goalRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/", async (c) => {
    const data = await goalService.getActiveGoals(c.get("userId"));
    return ok(c, data);
  })

  .post("/", zValidator("json", insertGoalSchema), async (c) => {
    const userId = c.get("userId");
    const idempotencyKey = c.req.header("Idempotency-Key");

    if (idempotencyKey) {
      const existing = await goalService.getGoalByIdempotencyKey(userId, idempotencyKey);
      if (existing) {
        return err(c, 409, "CONFLICT", "Mục tiêu đã tồn tại", { id: existing.id });
      }
    }

    const goal = await goalService.createGoal(userId, {
      ...c.req.valid("json"),
      idempotencyKey: idempotencyKey || undefined,
    });
    return created(c, goal);
  })

  .put("/:id", zValidator("json", updateGoalSchema), async (c) => {
    const { id } = c.req.param();
    const userId = c.get("userId");
    try {
      const updated = await goalService.updateGoal(userId, id, c.req.valid("json"));
      return ok(c, updated);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  })

  .post("/:id/contribute", zValidator("json", contributeGoalSchema), async (c) => {
    const { id } = c.req.param();
    const userId = c.get("userId");
    const idempotencyKey = c.req.header("Idempotency-Key");

    // Note: In current simple implementation, we don't store contribution idempotency separately
    // but we still pass it to service if we decide to add it later.
    try {
      const updated = await goalService.contributeToGoal(userId, id, {
        ...c.req.valid("json"),
        idempotencyKey: idempotencyKey || undefined,
      });
      return ok(c, updated);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      if (e.code === "GOAL_INACTIVE") return err(c, 409, "GOAL_INACTIVE", e.message);
      throw e;
    }
  })

  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.param();
    try {
      await goalService.deleteGoal(userId, id);
      return ok(c, { message: "Đã xóa mục tiêu" });
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  });
