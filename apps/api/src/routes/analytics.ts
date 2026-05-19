// apps/api/src/routes/analytics.ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "../lib/validator";
import { analyticsService } from "../services/container";
import { ok } from "../lib/response";

const monthQuery = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).transform((value) => {
  const now = new Date();
  const date = value.date;
  const month = value.month ?? date?.slice(0, 7) ?? now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  return { month, date };
});

const dateQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default(() => new Date().toISOString().slice(0, 10)),
});

const trendQuery = z.object({
  months: z.coerce.number().min(1).max(24).default(6),
  endMonth: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

export const analyticsRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/category-spending", zValidator("query", monthQuery), async (c) => {
    const { month, date } = c.req.valid("query");
    const data = await analyticsService.getCategorySpending(c.get("userId"), month, date);
    return ok(c, data);
  })

  .get("/daily-summary", zValidator("query", dateQuery), async (c) => {
    const { date } = c.req.valid("query");
    const data = await analyticsService.getDailySummary(c.get("userId"), date);
    return ok(c, data);
  })

  .get("/monthly-trend", zValidator("query", trendQuery), async (c) => {
    const { months, endMonth } = c.req.valid("query");
    const data = await analyticsService.getMonthlyTrend(c.get("userId"), months, endMonth);
    return ok(c, data);
  });
