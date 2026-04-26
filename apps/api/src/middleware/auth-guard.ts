// apps/api/src/middleware/auth-guard.ts
import { createMiddleware } from "hono/factory";
import { verifySessionCookie, verifyFirebaseIdToken } from "../lib/firebase-auth";
import { db, users } from "@finance/db";
import { eq } from "@finance/db";
import { err } from "../lib/response";

type AuthVariables = { userId: string; userEmail: string };

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    // 1. Ưu tiên Session Cookie
    const cookieHeader = c.req.header("cookie") ?? "";
    const sessionCookie = getCookieValue(cookieHeader, "session");

    if (sessionCookie) {
      try {
        const decodedClaims = await verifySessionCookie(sessionCookie);

        // Lấy internal user ID từ database
        const user = await db
          .select({ id: users.id, email: users.email })
          .from(users)
          .where(eq(users.firebaseUid, decodedClaims.uid))
          .limit(1)
          .then((rows) => rows[0]);

        if (user) {
          c.set("userId", String(user.id));
          c.set("userEmail", user.email || "");
          return await next();
        }
      } catch (e: any) {
        // Session cookie không hợp lệ — thử fallback Authorization header
        const fs = require('fs');
        const logMsg = `[${new Date().toISOString()}] Session verify error: ${e.message}\n`;
        fs.appendFileSync('apps/api/error.log', logMsg);
      }
    }

    // 2. Fallback: Authorization Bearer token
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const decodedToken = await verifyFirebaseIdToken(token);

        const user = await db
          .select({ id: users.id, email: users.email })
          .from(users)
          .where(eq(users.firebaseUid, decodedToken.uid))
          .limit(1)
          .then((rows) => rows[0]);

        if (user) {
          c.set("userId", String(user.id));
          c.set("userEmail", user.email || "");
          return await next();
        }
      } catch (e) {
        return err(c, 401, "TOKEN_INVALID", "Token không hợp lệ");
      }
    }

    return err(c, 401, "UNAUTHORIZED", "Vui lòng đăng nhập");
  }
);

function getCookieValue(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match?.split("=").slice(1).join("=");
}
