// apps/api/src/services/auth-service.ts
// Auth operations — login, register, refresh, logout
// Passwords: bcryptjs cost=12. Tokens: jose (Edge-compatible).
// Refresh tokens: SHA-256 hashed before DB storage.
import { db, users, userSettings, wallets, refreshTokens } from "@finance/db";
import { eq, and, isNull, gt } from "@finance/db";
import { signAccessToken, signRefreshToken, verifyToken } from "../lib/jwt";
import { verifyFirebaseIdToken } from "../lib/firebase-auth";

const BCRYPT_COST = 12; // Legacy, will be phased out

// Hash a token for safe DB storage (SHA-256)
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function socialLogin(
  idToken: string,
  deviceInfo?: string,
  ipAddress?: string,
) {
  const payload = await verifyFirebaseIdToken(idToken);
  const { email, name, picture, user_id: firebaseUid } = payload;

  if (!email) {
    throw Object.assign(new Error("Firebase token missing email"), { code: "INVALID_TOKEN" });
  }

  // Check existing by firebaseUid
  let [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.firebaseUid, firebaseUid), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    // Check by email (link if exists)
    [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    if (user) {
      await db
        .update(users)
        .set({ firebaseUid, avatarUrl: picture ?? user.avatarUrl })
        .where(eq(users.id, user.id as any));
    } else {
      // Create new
      await db.transaction(async (tx: any) => {
        // Generate a simple username from email
        const baseUsername = email.split("@")[0].replace(/[^a-z0-9_]/g, "_").toLowerCase();
        const username = `${baseUsername}_${Math.random().toString(36).substring(2, 7)}`;

        const [newUser] = await tx.insert(users).values({
          email,
          username,
          fullName: name ?? email.split("@")[0],
          avatarUrl: picture ?? null,
          firebaseUid,
          emailVerified: true, // Firebase verified email
        }).returning();

        if (!newUser) throw new Error("Failed to create user");
        const newUserId = String(newUser.id);

        await tx.insert(userSettings).values({ userId: newUserId as any });
        await tx.insert(wallets).values({ userId: newUserId as any, name: "Ví Tiền Mặt", type: "cash", isDefault: true });
      });

      [user] = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, firebaseUid))
        .limit(1);
    }
  }

  if (!user) throw new Error("Failed to sync user with database");
  if (!user.isActive) throw Object.assign(new Error("Tài khoản đã bị khóa"), { code: "ACCOUNT_DISABLED" });

  // Issue tokens
  const userIdStr = user.id.toString();
  const accessToken = await signAccessToken({ userId: userIdStr, email: user.email });
  const refreshToken = await signRefreshToken({ userId: userIdStr, email: user.email });
  const tokenHash = await hashToken(refreshToken);

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash,
    deviceInfo: deviceInfo ?? null,
    ipAddress: ipAddress ?? null,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id as any));

  return { accessToken, refreshToken, user };
}

export async function refreshAccessToken(incomingRefreshToken: string) {
  const payload = await verifyToken(incomingRefreshToken).catch(() => {
    throw Object.assign(new Error("Refresh token không hợp lệ"), { code: "INVALID_REFRESH" });
  });

  const tokenHash = await hashToken(incomingRefreshToken);

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

  if (!stored) throw Object.assign(new Error("Refresh token đã hết hạn"), { code: "REFRESH_EXPIRED" });

  return signAccessToken({ userId: payload.userId, email: payload.email });
}

export async function logout(incomingRefreshToken: string) {
  const tokenHash = await hashToken(incomingRefreshToken);
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.tokenHash, tokenHash));
}
