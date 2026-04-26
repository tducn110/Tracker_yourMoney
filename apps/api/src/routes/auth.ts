// apps/api/src/routes/auth.ts
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { zValidator } from "../lib/validator";
import { socialLoginSchema } from "@finance/shared-schemas";
import { db, users } from "@finance/db";
import { eq } from "@finance/db";
import {
  verifyFirebaseIdToken,
  createSessionCookie,
  verifySessionCookie,
} from "../lib/firebase-auth";
import { ok, err } from "../lib/response";

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax" as const,
  path: "/",
};

const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 ngày

export const authRoutes = new Hono()
  // POST /api/auth/social
  .post("/social", zValidator("json", socialLoginSchema), async (c) => {
    console.log("📥 [Auth] Social login request received");
    try {
      const { idToken } = c.req.valid("json");

      // 1. Verify Firebase ID Token
      const decodedToken = await verifyFirebaseIdToken(idToken);
      const { uid, email, name, picture } = decodedToken;

      if (!email) {
        return err(c, 400, "INVALID_TOKEN", "Token không chứa email");
      }

      // 2. Sync user với database
      let user = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, uid))
        .limit(1)
        .then((rows) => rows[0]);

      if (!user) {
        // Thử tìm bằng email
        user = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1)
          .then((rows) => rows[0]);

        if (user) {
          // Link tài khoản hiện có với Firebase UID
          await db.update(users).set({ firebaseUid: uid }).where(eq(users.id, user.id));
        } else {
          // Tạo tài khoản mới
          const username = email.split("@")[0] + Math.floor(Math.random() * 1000);
          const [result] = await db.insert(users).values({
            firebaseUid: uid,
            email,
            username,
            fullName: name || email.split("@")[0],
            avatarUrl: picture || null,
            emailVerified: 1,
          });

          // Handle both [ResultSetHeader, undefined] (mysql2) and { insertId } (tidb-serverless)
          const insertId = Array.isArray(result) ? result[0].insertId : (result as any).insertId;

          user = await db
            .select()
            .from(users)
            .where(eq(users.id, String(insertId)))
            .limit(1)
            .then((rows) => rows[0]);
        }
      }

      // 3. Tạo Firebase Session Cookie
      const sessionCookie = await createSessionCookie(idToken, SESSION_TTL_MS);

      // 4. Set HttpOnly cookie
      setCookie(c, "session", sessionCookie, {
        ...COOKIE_BASE,
        maxAge: SESSION_TTL_MS / 1000,
      });

      return ok(c, {
        user: {
          id: String(user!.id),
          email: user!.email,
          fullName: user!.fullName,
          username: user!.username,
          avatarUrl: user!.avatarUrl,
        },
      });
    } catch (e: any) {
      console.error("Social login error:", e);
      const fs = require('fs');
      const logMsg = `[${new Date().toISOString()}] Social login error: ${e.message}\n${e.stack}\n`;
      fs.appendFileSync('apps/api/error.log', logMsg);
      return err(c, 401, "AUTH_ERROR", "Đăng nhập thất bại");
    }
  })

  // POST /api/auth/logout
  .post("/logout", async (c) => {
    // Xóa session cookie
    setCookie(c, "session", "", { ...COOKIE_BASE, maxAge: 0 });
    return ok(c, { message: "Đã đăng xuất" });
  })

  // GET /api/auth/me
  .get("/me", async (c) => {
    const sessionCookie = getCookieValue(c.req.header("cookie") ?? "", "session");
    if (!sessionCookie) return err(c, 401, "UNAUTHORIZED", "Chưa đăng nhập");

    try {
      const decodedClaims = await verifySessionCookie(sessionCookie);

      const user = await db
        .select({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          username: users.username,
          avatarUrl: users.avatarUrl,
          avatarText: users.avatarText,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.firebaseUid, decodedClaims.uid))
        .limit(1)
        .then((rows) => rows[0]);

      if (!user) return err(c, 404, "NOT_FOUND", "Không tìm thấy người dùng");
      return ok(c, user);
    } catch {
      return err(c, 401, "TOKEN_INVALID", "Phiên đăng nhập đã hết hạn");
    }
  });

function getCookieValue(header: string, name: string) {
  return header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
}
