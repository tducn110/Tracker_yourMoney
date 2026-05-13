// apps/api/src/routes/auth.ts
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { zValidator } from "../lib/validator";
import { socialLoginSchema } from "@finance/shared-schemas";
import { db, users, categories } from "@finance/db";
import { eq } from "@finance/db";
import {
  verifyFirebaseIdToken,
  createSessionCookie,
  verifySessionCookie,
} from "../lib/firebase-auth";
import { ok, err } from "../lib/response";

import { logger, logError } from "../lib/logger";

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax" as const,
  path: "/",
};

const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 ngày

const DEFAULT_CATEGORIES = [
  { name: "Thu Nhập", icon: "💰", color: "#10B981", type: "income" as const, sortOrder: 1 },
  { name: "Ăn Uống", icon: "🍜", color: "#F59E0B", type: "expense" as const, sortOrder: 2 },
  { name: "Di Chuyển", icon: "🚗", color: "#EAB308", type: "expense" as const, sortOrder: 3 },
  { name: "Mua Sắm", icon: "🛍️", color: "#EC4899", type: "expense" as const, sortOrder: 4 },
  { name: "Nhà Ở", icon: "🏠", color: "#8B5CF6", type: "expense" as const, sortOrder: 5 },
  { name: "Hóa Đơn", icon: "📄", color: "#6B7280", type: "expense" as const, sortOrder: 6 },
  { name: "Giải Trí", icon: "🎬", color: "#EF4444", type: "expense" as const, sortOrder: 7 },
  { name: "Sức Khỏe", icon: "💊", color: "#10B981", type: "expense" as const, sortOrder: 8 },
  { name: "Giáo Dục", icon: "📚", color: "#6366F1", type: "expense" as const, sortOrder: 9 },
  { name: "Tiết Kiệm", icon: "🏦", color: "#14B8A6", type: "both" as const, sortOrder: 10 },
  { name: "Khác", icon: "📦", color: "#6B7280", type: "expense" as const, sortOrder: 99 },
];

async function seedDefaultCategories(userId: string) {
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.userId, userId))
    .limit(1);
  
  if (existing.length > 0) return; // Already has categories
  
  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((cat) => ({ userId, ...cat }))
  );
}

export const authRoutes = new Hono()
  // POST /api/auth/social
  .post("/social", zValidator("json", socialLoginSchema), async (c) => {
    logger.info({ event: "SOCIAL_LOGIN_REQUEST", path: c.req.path });
    let step = "init";
    try {
      const { idToken } = c.req.valid("json");

      // 1. Verify Firebase ID Token
      step = "verify_firebase_token";
      const decodedToken = await verifyFirebaseIdToken(idToken);
      const { uid, email, name, picture } = decodedToken;
      logger.info({ event: "FIREBASE_TOKEN_VERIFIED", uid, email });

      if (!email) {
        return err(c, 400, "INVALID_TOKEN", "Token không chứa email");
      }

      // 2. Sync user với database
      step = "sync_user_db";
      logger.info({ event: "DB_SYNC_START", uid });
      let user = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, uid))
        .limit(1)
        .then((rows) => rows[0]);
      logger.info({ event: "DB_SYNC_FOUND", found: !!user });

      if (!user) {
        // Thử tìm bằng email
        user = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1)
          .then((rows) => rows[0]);

        if (user) {
          // Link existing account with Firebase UID
          await db.update(users).set({ firebaseUid: uid }).where(eq(users.id, user.id));
        } else {
          // Create new account
          const username = email.split("@")[0] + Math.floor(Math.random() * 1000);
          const [createdUser] = await db.insert(users).values({
            firebaseUid: uid,
            email,
            username,
            fullName: name || email.split("@")[0],
            avatarUrl: picture || null,
            emailVerified: true,
          }).returning();

          user = createdUser;
        }
      }

      // Seed default categories if user doesn't have any yet
      step = "seed_categories";
      await seedDefaultCategories(String(user!.id));

      // 3. Tạo Firebase Session Cookie
      step = "create_session_cookie";
      const sessionCookie = await createSessionCookie(idToken, SESSION_TTL_MS);

      // 4. Set HttpOnly cookie
      step = "set_hono_cookie";
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
          hasOnboarded: user!.hasOnboarded ?? false,
        },
      });
    } catch (e: any) {
      logError(e, c.req.path, c.req.method, `social-login:${step}`);
      return err(c, 401, "AUTH_ERROR", `Xác thực thất bại tại bước: ${step}`, {
        step,
        internalMessage: e.message
      });
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
          hasOnboarded: users.hasOnboarded,
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
