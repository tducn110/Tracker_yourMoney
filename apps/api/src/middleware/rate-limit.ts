// apps/api/src/middleware/rate-limit.ts
// Edge-safe, in-process Rate Limiter (Sliding Window)
// For MVP: protects individual endpoints from spam & runaway Serverless costs
//
// Strategy: O(1) per-request lookup via Map<key, {count, resetAt}>
// Limitation: per-instance only (acceptable for MVP, replace with Vercel KV for multi-region)
//
// Usage:
//   app.use('/api/transactions/quick', rateLimitMiddleware({ limit: 10, windowMs: 60_000 }));

import { createMiddleware } from "hono/factory";
import { logger } from "../lib/logger";

interface RateLimitOptions {
  /** Max requests allowed within window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Optional key extractor — defaults to IP + path */
  keyFn?: (req: Request) => string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-process store — will be reset on Cold Start (acceptable for spam protection)
// The worst case: after cold start, 1 new request window opens. Not a security risk.
const store = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leaks in long-running dev server
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60_000);

export function rateLimitMiddleware(opts: RateLimitOptions) {
  const { limit, windowMs, keyFn } = opts;

  return createMiddleware(async (c, next) => {
    const rawReq = c.req.raw;
    const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim()
      ?? c.req.header("x-real-ip")
      ?? "unknown";

    const key = keyFn ? keyFn(rawReq) : `${ip}:${c.req.path}`;
    const now = Date.now();

    let entry = store.get(key);

    // Initialize or reset expired window
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;
    const remaining = Math.max(0, limit - entry.count);
    const resetSecs = Math.ceil((entry.resetAt - now) / 1000);

    // Set standard rate limit headers
    c.header("X-RateLimit-Limit", String(limit));
    c.header("X-RateLimit-Remaining", String(remaining));
    c.header("X-RateLimit-Reset", String(resetSecs));

    if (entry.count > limit) {
      logger.warn({
        event: "RATE_LIMIT_EXCEEDED",
        key,
        count: entry.count,
        limit,
        path: c.req.path,
        ip,
      });
      return c.json(
        {
          success: false,
          error: {
            code: "rate_limit_exceeded",
            message: "Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau.",
            retryAfterSecs: resetSecs,
          },
        },
        429,
      );
    }

    await next();
  });
}
