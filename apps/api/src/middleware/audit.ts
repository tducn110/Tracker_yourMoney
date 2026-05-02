// apps/api/src/middleware/audit.ts
// Lightweight audit trail for mutations — inserts into audit_logs table.
// Resolves after response (fire-and-forget) — never blocks or errors the user.
//
// Usage: app.use('/api/v1/budgets/*', auditMiddleware)

import { createMiddleware } from "hono/factory";
import { db, auditLogs } from "@finance/db";
import { logger } from "../lib/logger";

export const auditMiddleware = createMiddleware(async (c, next) => {
  const userId = c.get("userId") || null;
  const method = c.req.method;

  // Only log mutations
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    await next();
    return;
  }

  const start = Date.now();
  const resource = extractResource(c.req.path);
  const resourceId = extractResourceId(c.req.path);

  await next();

  const statusCode = c.res.status;
  const success = statusCode >= 200 && statusCode < 300;

  // Fire-and-forget: don't block the response
  auditLogMutation({
    userId,
    action: methodToAction(method),
    resource,
    resourceId,
    status: success ? "success" : "failed",
    ipAddress: getIp(c),
    userAgent: c.req.header("user-agent") || null,
    correlationId: c.get("correlationId"),
  }).catch((err) => {
    logger.warn({ event: "AUDIT_INSERT_FAILED", err: (err as Error).message });
  });
});

function extractResource(path: string): string {
  // Extract resource from path: /api/v1/budgets/123 → budgets
  const match = path.match(/\/api\/v\d+\/([a-z_-]+)/);
  return match ? match[1] : path;
}

function extractResourceId(path: string): string | null {
  // Extract resource ID from path: /api/v1/budgets/123 → 123
  const match = path.match(/\/api\/v\d+\/[a-z_-]+\/([^/]+)/);
  return match ? match[1] : null;
}

function methodToAction(method: string): string {
  switch (method) {
    case "POST": return "create";
    case "PUT":
    case "PATCH": return "update";
    case "DELETE": return "delete";
    default: return method.toLowerCase();
  }
}

function getIp(c: any): string | null {
  return c.req.header("x-forwarded-for")?.split(",")[0]?.trim()
    ?? c.req.header("x-real-ip")
    ?? null;
}

async function auditLogMutation(params: {
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  status: "success" | "failed";
  ipAddress: string | null;
  userAgent: string | null;
  correlationId?: string;
}) {
  await db.insert(auditLogs).values({
    userId: params.userId ? String(params.userId) : null as any,
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId,
    status: params.status,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}
