import { Hono } from "hono";
import { timingSafeEqual } from "node:crypto";
import { db, users, transactions, userSettings, cashWallet, refreshTokens } from "@finance/db";
import { eq } from "@finance/db";
import { ok, err, created } from "../lib/response";
import { logError } from "../lib/logger";
import { hashPassword } from "../lib/crypto-utils";

export const internalRoutes = new Hono();

// PSK Middleware: Senior-grade Timing Attack Protection
internalRoutes.use("*", async (c, next) => {
  const secret = c.req.header("x-e2e-secret");
  const expected = process.env.E2E_ADMIN_SECRET;

  if (!secret || !expected) {
    return err(c, 403, "FORBIDDEN", "E2E Secret missing or environment misconfigured");
  }

  const secretBuffer = Buffer.from(secret);
  const expectedBuffer = Buffer.from(expected);

  if (
    secretBuffer.length === expectedBuffer.length &&
    timingSafeEqual(secretBuffer, expectedBuffer)
  ) {
    return await next();
  }

  return err(c, 403, "INVALID_SECRET", "Invalid E2E Secret Key");
});

/**
 * POST /api/internal/seed-user
 * Atomic Deterministic Seeding: Explicit ID Assignment
 */
internalRoutes.post("/seed-user", async (c) => {
  try {
    const { email, password, username, fullName } = await c.req.json();
    
    // Standard Cryptography
    const passwordHash = await hashPassword(password);

    let insertedUserId: number = 0;

    await db.transaction(async (tx: any) => {
      // Create user with autoincrement ID
      const result = await tx.insert(users).values({
        email,
        username,
        fullName,
        passwordHash,
      });

      insertedUserId = (result as any).insertId || (result as any)[0]?.insertId;

      // Initialize Settings & Wallet using the auto-generated ID
      await tx.insert(userSettings).values({ userId: insertedUserId });
      await tx.insert(cashWallet).values({ userId: insertedUserId });
    });
    
    return created(c, { message: "User seeded successfully (Dynamic ID)", user: { id: String(insertedUserId), email } });
  } catch (e: any) {
    logError(e, c.req.path, c.req.method, "internal-seed");
    return err(c, 500, "SEED_FAILED", `${e.message} \n ${e.stack}`);
  }
});

/**
 * POST /api/internal/teardown-user
 */
internalRoutes.post("/teardown-user", async (c) => {
  try {
    const { email } = await c.req.json();
    
    await db.transaction(async (tx: any) => {
      const [user] = await tx.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (!user) return;
      
      const userId = user.id;

      await tx.delete(transactions).where(eq(transactions.userId, userId));
      await tx.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
      await tx.delete(userSettings).where(eq(userSettings.userId, userId));
      await tx.delete(cashWallet).where(eq(cashWallet.userId, userId));
      await tx.delete(users).where(eq(users.id, userId));
    });

    return ok(c, { message: "Teardown completed successfully." });
  } catch (e: any) {
    logError(e, c.req.path, c.req.method, "internal-teardown");
    return err(c, 500, "TEARDOWN_FAILED", e.message);
  }
});
