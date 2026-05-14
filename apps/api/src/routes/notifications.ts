// apps/api/src/routes/notifications.ts
// Notification routes — Phase 20
import { Hono } from "hono";
import { db, notifications } from "@finance/db";
import { eq, and, desc } from "@finance/db";
import { ok } from "../lib/response";

export const notificationRoutes = new Hono<{ Variables: { userId: string } }>()
  // GET /api/v1/notifications — list user notifications (latest 50)
  .get("/", async (c) => {
    const userId = c.get("userId");
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId as any))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    return ok(c, rows);
  })
  // GET /api/v1/notifications/unread-count
  .get("/unread-count", async (c) => {
    const userId = c.get("userId");
    const rows = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId as any), eq(notifications.isRead, false)));
    return ok(c, { count: rows.length });
  })
  // PATCH /api/v1/notifications/:id/read
  .patch("/:id/read", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.id, id as any), eq(notifications.userId, userId as any)));
    return ok(c, { success: true });
  })
  // PATCH /api/v1/notifications/read-all
  .patch("/read-all", async (c) => {
    const userId = c.get("userId");
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.userId, userId as any), eq(notifications.isRead, false)));
    return ok(c, { success: true });
  });
