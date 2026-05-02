// apps/api/src/routes/user.ts
// User profile & settings routes
import { Hono } from "hono";
import { db, userSettings } from "@finance/db";
import { eq } from "@finance/db";
import { ok, err } from "../lib/response";

export const userRoutes = new Hono<{ Variables: { userId: string } }>()
  // GET /api/v1/user/settings
  .get("/settings", async (c) => {
    const userId = c.get("userId");
    const [row] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId as any))
      .limit(1);

    if (!row) {
      // Create default settings row on first access
      await db.insert(userSettings).values({ userId: userId as any });
      const [newRow] = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId as any))
        .limit(1);
      return ok(c, newRow);
    }

    return ok(c, row);
  })
  // PUT /api/v1/user/settings
  .put("/settings", async (c) => {
    const userId = c.get("userId");
    const body = await c.req.json();

    // Only allow whitelisted fields
    const allowed = [
      "monthlyBudget", "emergencyBuffer", "incomeDate",
      "currency", "language", "timezone", "theme",
      "notifyBillBeforeDays", "notifyBudgetThreshold",
      "notifyEmail", "notifyPush",
    ];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }
    if (Object.keys(updates).length === 0) {
      return err(c, 400, "NO_FIELDS", "Không có trường nào để cập nhật");
    }

    // Upsert
    const [existing] = await db
      .select({ userId: userSettings.userId })
      .from(userSettings)
      .where(eq(userSettings.userId, userId as any))
      .limit(1);

    if (existing) {
      await db
        .update(userSettings)
        .set(updates)
        .where(eq(userSettings.userId, userId as any));
    } else {
      await db.insert(userSettings).values({ userId: userId as any, ...updates });
    }

    const [row] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId as any))
      .limit(1);

    return ok(c, row);
  });
