// apps/api/src/middleware/auth-guard.ts
import { createMiddleware } from "hono/factory";
import { verifyToken } from "../lib/jwt";
import { db, users } from "@finance/db";
import { eq, and, isNull } from "@finance/db";
import { err } from "../lib/response";
import { logger } from "../lib/logger";

type AuthVariables = { userId: string; userEmail: string };

const ACCESS_COOKIE = "access_token";

function getCookieValue(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match?.split("=").slice(1).join("=");
}

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    // 1. HttpOnly cookie (browser sessions)
    const cookieHeader = c.req.header("cookie") ?? "";
    const fromCookie   = getCookieValue(cookieHeader, ACCESS_COOKIE);

    // 2. Authorization: Bearer <token> (mobile / API / programmatic)
    const fromHeader = c.req.header("Authorization")?.replace("Bearer ", "");

    const token = fromCookie ?? fromHeader;

    if (!token) {
      return err(c, 401, "UNAUTHORIZED", "Vui lòng đăng nhập");
    }

    try {
      const payload = await verifyToken(token);
      const userId  = String(payload.userId);

      // Verify user still exists and is active
      const [user] = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(and(eq(users.id, userId as any), isNull(users.deletedAt)))
        .limit(1);

      if (!user) {
        return err(c, 401, "USER_NOT_FOUND", "Tài khoản không tồn tại");
      }

      c.set("userId",    String(user.id));
      c.set("userEmail", user.email ?? "");
      return await next();
    } catch (e: any) {
      logger.warn({
        event: "AUTH_GUARD_FAILED",
        message: e.message,
        path:    c.req.path,
        method:  c.req.method,
      });
      return err(c, 401, "TOKEN_INVALID", "Token không hợp lệ hoặc đã hết hạn");
    }
  }
);
