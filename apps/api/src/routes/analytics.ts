// apps/api/src/routes/analytics.ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "../lib/validator";
import { analyticsService } from "../services/container";
import { ok } from "../lib/response";

const monthQuery = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).default(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }),
});

const trendQuery = z.object({
  months: z.coerce.number().min(1).max(24).default(6),
});

export const analyticsRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/category-spending", zValidator("query", monthQuery), async (c) => {
    const { month } = c.req.valid("query");
    const data = await analyticsService.getCategorySpending(c.get("userId"), month);
    return ok(c, data);
  })

  .get("/monthly-trend", zValidator("query", trendQuery), async (c) => {
    const { months } = c.req.valid("query");
    const data = await analyticsService.getMonthlyTrend(c.get("userId"), months);
    return ok(c, data);
  });
