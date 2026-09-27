// apps/api/src/routes/auth.ts
import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import bcrypt from "bcryptjs";
import { zValidator } from "../lib/validator";
import { insertUserSchema, loginSchema } from "@finance/shared-schemas";
import { db, users, userSettings, wallets, refreshTokens, categories } from "@finance/db";
import { eq, and, isNull, gt } from "@finance/db";
import { signAccessToken, signRefreshToken, verifyToken } from "../lib/jwt";
import { ok, created, err } from "../lib/response";
import { logger, logError } from "../lib/logger";
import { socialLogin as socialLoginService } from "../services/auth-service";

// ── Helpers ──────────────────────────────────────────────────────────

async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax" as const,
  path: "/",
};

const DEFAULT_CATEGORIES = [
  { name: "Thu Nhập",  icon: "💰", color: "#10B981", type: "income"  as const, sortOrder: 1 },
  { name: "Ăn Uống",  icon: "🍜", color: "#F59E0B", type: "expense" as const, sortOrder: 2 },
  { name: "Di Chuyển",icon: "🚗", color: "#EAB308", type: "expense" as const, sortOrder: 3 },
  { name: "Mua Sắm",  icon: "🛍️", color: "#EC4899", type: "expense" as const, sortOrder: 4 },
  { name: "Nhà Ở",    icon: "🏠", color: "#8B5CF6", type: "expense" as const, sortOrder: 5 },
  { name: "Hóa Đơn",  icon: "📄", color: "#6B7280", type: "expense" as const, sortOrder: 6 },
  { name: "Giải Trí", icon: "🎬", color: "#EF4444", type: "expense" as const, sortOrder: 7 },
  { name: "Sức Khỏe", icon: "💊", color: "#10B981", type: "expense" as const, sortOrder: 8 },
  { name: "Giáo Dục", icon: "📚", color: "#6366F1", type: "expense" as const, sortOrder: 9 },
  { name: "Tiết Kiệm",icon: "🏦", color: "#14B8A6", type: "both"    as const, sortOrder: 10 },
  { name: "Khác",     icon: "📦", color: "#6B7280", type: "expense" as const, sortOrder: 99 },
];

async function seedDefaultCategories(userId: string) {
  const existing = await db
    .select({ name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId));
  const existingNames = new Set(existing.map((c) => c.name));
  const missing = DEFAULT_CATEGORIES.filter((c) => !existingNames.has(c.name));
  if (missing.length === 0) return;
  await db.insert(categories).values(missing.map((c) => ({ userId, ...c })));
}

async function issueTokenPair(
  c: any,
  userId: string,
  email: string,
  deviceInfo?: string,
  ipAddress?: string,
) {
  const accessToken  = await signAccessToken({ userId: userId as any, email });
  const refreshToken = await signRefreshToken({ userId: userId as any, email });
  const tokenHash    = await hashToken(refreshToken);

  await db.insert(refreshTokens).values({
    userId: userId as any,
    tokenHash,
    deviceInfo: deviceInfo ?? null,
    ipAddress:  ipAddress  ?? null,
    expiresAt:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  // HttpOnly cookies — 15 min access, 30 day refresh
  setCookie(c, ACCESS_COOKIE, accessToken, {
    ...COOKIE_BASE,
    maxAge: 15 * 60,
  });
  setCookie(c, REFRESH_COOKIE, refreshToken, {
    ...COOKIE_BASE,
    maxAge: 30 * 24 * 60 * 60,
  });

  return { accessToken, refreshToken };
}

// ── Routes ────────────────────────────────────────────────────────────

export const authRoutes = new Hono()

  // POST /api/auth/register
  .post("/register", zValidator("json", insertUserSchema), async (c) => {
    const { email, password, fullName, username } = c.req.valid("json");
    logger.info({ event: "REGISTER_REQUEST", email });

    try {
      // Check uniqueness
      const [emailConflict] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, email), isNull(users.deletedAt)))
        .limit(1);
      if (emailConflict) return err(c, 409, "EMAIL_TAKEN", "Email đã được sử dụng");

      const [usernameConflict] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.username, username), isNull(users.deletedAt)))
        .limit(1);
      if (usernameConflict) return err(c, 409, "USERNAME_TAKEN", "Tên người dùng đã tồn tại");

      const passwordHash = await bcrypt.hash(password, 12);

      let newUserId = "";

      await db.transaction(async (tx: any) => {
        const [newUser] = await tx
          .insert(users)
          .values({ email, username, fullName, passwordHash, emailVerified: false })
          .returning({ id: users.id });

        newUserId = String(newUser.id);

        await tx.insert(userSettings).values({ userId: newUserId as any });
        await tx.insert(wallets).values({
          userId: newUserId as any,
          name: "Ví Tiền Mặt",
          type: "cash",
          isDefault: true,
        });
      });

      await seedDefaultCategories(newUserId!);

      const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
      await issueTokenPair(c, newUserId!, email, c.req.header("user-agent"), ip);

      logger.info({ event: "REGISTER_SUCCESS", userId: newUserId });

      const [user] = await db
        .select({
          id: users.id, email: users.email, fullName: users.fullName,
          username: users.username, avatarUrl: users.avatarUrl,
          hasOnboarded: users.hasOnboarded,
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return created(c, { user: { ...user, id: String(user.id) } });
    } catch (e: any) {
      logError(e, c.req.path, c.req.method, "register");
      return err(c, 500, "REGISTER_ERROR", "Đăng ký thất bại");
    }
  })

  // POST /api/auth/login
  .post("/login", zValidator("json", loginSchema), async (c) => {
    const { email, password } = c.req.valid("json");
    logger.info({ event: "LOGIN_REQUEST", email });

    try {
      const [user] = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email), isNull(users.deletedAt)))
        .limit(1);

      if (!user || !user.passwordHash) {
        return err(c, 401, "INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng");
      }
      if (!user.isActive) {
        return err(c, 403, "ACCOUNT_DISABLED", "Tài khoản đã bị khóa");
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return err(c, 401, "INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng");
      }

      const userId = String(user.id);
      const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
      await issueTokenPair(c, userId, user.email, c.req.header("user-agent"), ip);

      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id as any));

      logger.info({ event: "LOGIN_SUCCESS", userId });

      return ok(c, {
        user: {
          id: userId,
          email: user.email,
          fullName: user.fullName,
          username: user.username,
          avatarUrl: user.avatarUrl,
          hasOnboarded: user.hasOnboarded,
        },
      });
    } catch (e: any) {
      logError(e, c.req.path, c.req.method, "login");
      return err(c, 500, "LOGIN_ERROR", "Đăng nhập thất bại");
    }
  })

  // POST /api/auth/refresh
  .post("/refresh", async (c) => {
    // Accept token from cookie or body
    const cookieHeader = c.req.header("cookie") ?? "";
    const fromCookie   = getCookieValue(cookieHeader, REFRESH_COOKIE);
    const body         = await c.req.json().catch(() => ({}));
    const incomingToken: string | undefined = fromCookie ?? body?.refreshToken;

    if (!incomingToken) {
      return err(c, 401, "MISSING_TOKEN", "Refresh token không được cung cấp");
    }

    try {
      const payload   = await verifyToken(incomingToken);
      const tokenHash = await hashToken(incomingToken);

      const [stored] = await db
        .select()
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.tokenHash, tokenHash),
            isNull(refreshTokens.revokedAt),
            gt(refreshTokens.expiresAt, new Date()),
          ),
        )
        .limit(1);

      if (!stored) {
        return err(c, 401, "REFRESH_EXPIRED", "Refresh token đã hết hạn hoặc bị thu hồi");
      }

      // Rotate: revoke old, issue new pair
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.tokenHash, tokenHash));

      const userId = String(payload.userId);
      const ip     = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
      await issueTokenPair(c, userId, payload.email, undefined, ip);

      return ok(c, { message: "Token đã được làm mới" });
    } catch {
      return err(c, 401, "REFRESH_INVALID", "Refresh token không hợp lệ");
    }
  })

  // POST /api/auth/logout
  .post("/logout", async (c) => {
    const cookieHeader  = c.req.header("cookie") ?? "";
    const refreshCookie = getCookieValue(cookieHeader, REFRESH_COOKIE);

    if (refreshCookie) {
      try {
        const tokenHash = await hashToken(refreshCookie);
        await db
          .update(refreshTokens)
          .set({ revokedAt: new Date() })
          .where(eq(refreshTokens.tokenHash, tokenHash));
      } catch {
        // Best-effort revocation
      }
    }

    deleteCookie(c, ACCESS_COOKIE,  { ...COOKIE_BASE });
    deleteCookie(c, REFRESH_COOKIE, { ...COOKIE_BASE });

    return ok(c, { message: "Đã đăng xuất" });
  })

  // GET /api/auth/me  — requires valid access token (cookie or Bearer)
  .get("/me", async (c) => {
    const cookieHeader = c.req.header("cookie") ?? "";
    const fromCookie   = getCookieValue(cookieHeader, ACCESS_COOKIE);
    const fromHeader   = c.req.header("Authorization")?.replace("Bearer ", "");
    const token        = fromCookie ?? fromHeader;

    if (!token) return err(c, 401, "UNAUTHORIZED", "Chưa đăng nhập");

    try {
      const payload = await verifyToken(token);
      const userId  = String(payload.userId);

      const [user] = await db
        .select({
          id: users.id, email: users.email, fullName: users.fullName,
          username: users.username, avatarUrl: users.avatarUrl,
          avatarText: users.avatarText, hasOnboarded: users.hasOnboarded,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(and(eq(users.id, userId as any), isNull(users.deletedAt)))
        .limit(1);

      if (!user) return err(c, 404, "NOT_FOUND", "Không tìm thấy người dùng");

      return ok(c, { ...user, id: String(user.id) });
    } catch {
      return err(c, 401, "TOKEN_INVALID", "Token không hợp lệ hoặc đã hết hạn");
    }
  })

  // POST /api/auth/social — Firebase social login (Google, GitHub, etc.)
  // Body: { idToken: string } — Firebase ID token from client SDK
  .post("/social", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const idToken: string | undefined = body?.idToken;
    if (!idToken) return err(c, 400, "MISSING_TOKEN", "Firebase ID token không được cung cấp");

    try {
      const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
      const { accessToken, refreshToken, user } = await socialLoginService(
        idToken,
        c.req.header("user-agent"),
        ip,
      );

      // refreshToken already stored in DB by socialLoginService
      setCookie(c, ACCESS_COOKIE, accessToken, { ...COOKIE_BASE, maxAge: 15 * 60 });
      setCookie(c, REFRESH_COOKIE, refreshToken, { ...COOKIE_BASE, maxAge: 30 * 24 * 60 * 60 });

      logger.info({ event: "SOCIAL_LOGIN_SUCCESS", userId: String(user.id) });

      return ok(c, {
        user: {
          id: String(user.id),
          email: user.email,
          fullName: user.fullName,
          username: user.username,
          avatarUrl: user.avatarUrl,
          hasOnboarded: user.hasOnboarded,
        },
      });
    } catch (e: any) {
      logError(e, c.req.path, c.req.method, "social-login");
      if (e?.code === "ACCOUNT_DISABLED") return err(c, 403, "ACCOUNT_DISABLED", e.message);
      if (e?.code === "INVALID_TOKEN")    return err(c, 401, "INVALID_TOKEN",    e.message);
      return err(c, 500, "SOCIAL_LOGIN_ERROR", "Đăng nhập thất bại", {
        internalMessage: process.env.NODE_ENV !== "production" ? e.message : undefined,
      });
    }
  });

// ── Utility ───────────────────────────────────────────────────────────

function getCookieValue(header: string, name: string): string | undefined {
  return header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
}
