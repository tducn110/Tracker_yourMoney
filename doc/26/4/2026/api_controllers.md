# API Endpoints (Controllers) & Middleware

## File: `apps/api/src/routes/analytics.ts`

```typescript
// apps/api/src/routes/analytics.ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "../lib/validator";
import { analyticsService } from "../services/container";
import { ok } from "../lib/response";

const monthQuery = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).default(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }),
});

const trendQuery = z.object({
  months: z.coerce.number().min(1).max(24).default(6),
});

export const analyticsRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/category-spending", zValidator("query", monthQuery), async (c) => {
    const { month } = c.req.valid("query");
    const data = await analyticsService.getCategorySpending(c.get("userId"), month);
    return ok(c, data);
  })

  .get("/monthly-trend", zValidator("query", trendQuery), async (c) => {
    const { months } = c.req.valid("query");
    const data = await analyticsService.getMonthlyTrend(c.get("userId"), months);
    return ok(c, data);
  });

```

## File: `apps/api/src/routes/auth.ts`

```typescript
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

```

## File: `apps/api/src/routes/bills.ts`

```typescript
// apps/api/src/routes/bills.ts
import { Hono } from "hono";
import { zValidator } from "../lib/validator";
import { insertBillSchema, updateBillSchema, insertBillPaymentSchema } from "@finance/shared-schemas";
import { billService } from "../services/container";
import { ok, created, err } from "../lib/response";

export const billRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/", async (c) => {
    const userId = c.get("userId");
    const bills = await billService.getActiveBills(userId);
    return ok(c, bills);
  })

  .post("/", zValidator("json", insertBillSchema), async (c) => {
    const userId = c.get("userId");
    const idempotencyKey = c.req.header("Idempotency-Key");

    if (idempotencyKey) {
      const existing = await billService.getBillByIdempotencyKey(userId, idempotencyKey);
      if (existing) {
        return err(c, 409, "CONFLICT", "Hóa đơn đã tồn tại", { id: existing.id });
      }
    }

    const input = c.req.valid("json");
    const bill = await billService.createBill(userId, {
      ...input,
      idempotencyKey: idempotencyKey || undefined,
    });
    return created(c, bill);
  })

  .put("/:id", zValidator("json", updateBillSchema), async (c) => {
    const { id } = c.req.param();
    const userId = c.get("userId");
    const input = c.req.valid("json");
    
    try {
      const updated = await billService.updateBill(userId, id, input);
      return ok(c, updated);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  })

  .patch("/:id/pay", zValidator("json", insertBillPaymentSchema), async (c) => {
    const userId = c.get("userId");
    const idempotencyKey = c.req.header("Idempotency-Key");

    if (idempotencyKey) {
      const existing = await billService.getPaymentByIdempotencyKey(userId, idempotencyKey);
      if (existing) {
        return ok(c, existing); // Return existing payment for idempotent retries
      }
    }

    try {
      const payment = await billService.payBill(userId, {
        ...c.req.valid("json"),
        idempotencyKey: idempotencyKey || undefined,
      });
      return ok(c, payment);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      if (e.code === "ALREADY_PAID") return err(c, 409, "ALREADY_PAID", e.message);
      throw e;
    }
  })

  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.param();
    try {
      await billService.deleteBill(userId, id);
      return ok(c, { message: "Đã xóa hóa đơn" });
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  });

```

## File: `apps/api/src/routes/budgets.ts`

```typescript
import { Hono } from "hono";
import { zValidator } from "../lib/validator";
import {
  insertBudgetSchema,
  updateBudgetSchema,
} from "@finance/shared-schemas";
import { budgetService } from "../services/container";
import { ok, created, err } from "../lib/response";

export const budgetRoutes = new Hono<{ Variables: { userId: string } }>()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const budgets = await budgetService.getBudgets(userId);
    return ok(c, budgets);
  })
  .get("/summary", async (c) => {
    const userId = c.get("userId");
    const summary = await budgetService.getBudgetSummary(userId);
    return ok(c, summary);
  })
  .get("/:id", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    try {
      const detail = await budgetService.getBudgetDetail(userId, id);
      return ok(c, detail);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  })
  .post("/", zValidator("json", insertBudgetSchema), async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");
    const budget = await budgetService.createBudget(userId, input);
    return created(c, budget);
  })
  .put("/:id", zValidator("json", updateBudgetSchema), async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const input = c.req.valid("json");
    try {
      const updated = await budgetService.updateBudget(userId, id, input);
      return ok(c, updated);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  })
  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    try {
      await budgetService.deleteBudget(userId, id);
      return ok(c, { message: "Đã xóa ngân sách" });
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  });

```

## File: `apps/api/src/routes/categories.ts`

```typescript
// apps/api/src/routes/categories.ts
import { Hono } from "hono";
import { zValidator } from "../lib/validator";
import { insertCategorySchema, updateCategorySchema } from "@finance/shared-schemas";
import { categoryService } from "../services/container";
import { ok, created, err } from "../lib/response";

export const categoryRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/", async (c) => {
    const data = await categoryService.getCategories(c.get("userId"));
    return ok(c, data);
  })

  .post("/", zValidator("json", insertCategorySchema), async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");
    try {
      const category = await categoryService.createCategory(userId, input);
      return created(c, category);
    } catch (e: any) {
      if (e.message?.includes("Duplicate")) {
        return err(c, 409, "DUPLICATE", "Danh mục đã tồn tại");
      }
      throw e;
    }
  })

  .put("/:id", zValidator("json", updateCategorySchema), async (c) => {
    const userId = c.get("userId");
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return err(c, 400, "INVALID_ID", "ID danh mục không hợp lệ");

    try {
      const category = await categoryService.updateCategory(userId, id, c.req.valid("json"));
      return ok(c, category);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  })

  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return err(c, 400, "INVALID_ID", "ID danh mục không hợp lệ");

    try {
      await categoryService.deleteCategory(userId, id);
      return ok(c, { message: "Đã xóa danh mục" });
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  });


```

## File: `apps/api/src/routes/goals.ts`

```typescript
// apps/api/src/routes/goals.ts
import { Hono } from "hono";
import { zValidator } from "../lib/validator";
import { insertGoalSchema, updateGoalSchema, contributeGoalSchema } from "@finance/shared-schemas";
import { goalService } from "../services/container";
import { ok, created, err } from "../lib/response";

export const goalRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/", async (c) => {
    const data = await goalService.getActiveGoals(c.get("userId"));
    return ok(c, data);
  })

  .post("/", zValidator("json", insertGoalSchema), async (c) => {
    const userId = c.get("userId");
    const idempotencyKey = c.req.header("Idempotency-Key");

    if (idempotencyKey) {
      const existing = await goalService.getGoalByIdempotencyKey(userId, idempotencyKey);
      if (existing) {
        return err(c, 409, "CONFLICT", "Mục tiêu đã tồn tại", { id: existing.id });
      }
    }

    const goal = await goalService.createGoal(userId, {
      ...c.req.valid("json"),
      idempotencyKey: idempotencyKey || undefined,
    });
    return created(c, goal);
  })

  .put("/:id", zValidator("json", updateGoalSchema), async (c) => {
    const { id } = c.req.param();
    const userId = c.get("userId");
    try {
      const updated = await goalService.updateGoal(userId, id, c.req.valid("json"));
      return ok(c, updated);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  })

  .post("/:id/contribute", zValidator("json", contributeGoalSchema), async (c) => {
    const { id } = c.req.param();
    const userId = c.get("userId");
    const idempotencyKey = c.req.header("Idempotency-Key");

    // Note: In current simple implementation, we don't store contribution idempotency separately
    // but we still pass it to service if we decide to add it later.
    try {
      const updated = await goalService.contributeToGoal(userId, id, {
        ...c.req.valid("json"),
        idempotencyKey: idempotencyKey || undefined,
      });
      return ok(c, updated);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      if (e.code === "GOAL_INACTIVE") return err(c, 409, "GOAL_INACTIVE", e.message);
      throw e;
    }
  })

  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.param();
    try {
      await goalService.deleteGoal(userId, id);
      return ok(c, { message: "Đã xóa mục tiêu" });
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  });

```

## File: `apps/api/src/routes/internal.ts`

```typescript
import { Hono } from "hono";
import { timingSafeEqual } from "node:crypto";
import { db, users, transactions, userSettings, cashWallet, refreshTokens } from "@finance/db";
import { eq } from "@finance/db";
import { ok, err, created } from "../lib/response";
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
    console.error('❌ [INTERNAL-SEED] FAILED:', e);
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
    console.error('❌ [INTERNAL-TEARDOWN] FAILED:', e);
    return err(c, 500, "TEARDOWN_FAILED", e.message);
  }
});

```

## File: `apps/api/src/routes/transactions.ts`

```typescript
// apps/api/src/routes/transactions.ts
import { Hono } from "hono";
import { zValidator } from "../lib/validator";
import { insertTransactionSchema, updateTransactionSchema } from "@finance/shared-schemas";
import { getTransactionsPaginated } from "@finance/db";
import { transactionService } from "../services/container";
import { UnparseableInputError } from "../services/adapters/nlp-adapter";
import { ok, created, err } from "../lib/response";
import { z } from "zod";
import { logger } from "../lib/logger";

const querySchema = z.object({
  month:       z.string().regex(/^\d{4}-\d{2}$/).optional(),
  category_id: z.coerce.number().optional(),
  type:        z.enum(["income", "expense", "transfer"]).optional(),
  page:        z.coerce.number().default(1),
  limit:       z.coerce.number().max(100).default(20),
});

const quickAddSchema = z.object({
  text: z.string().min(1),
  categoryId: z.coerce.number().optional(),
});

export const transactionRoutes = new Hono<{ Variables: { userId: string, correlationId: string } }>()

  .get("/", zValidator("query", querySchema), async (c) => {
    const userId = c.get("userId");
    const q = c.req.valid("query");
    const data = await getTransactionsPaginated(userId, {
      month: q.month, categoryId: q.category_id, type: q.type,
      page: q.page, limit: q.limit,
    });
    const transactionsWithSafeAmount = data.transactions.map((tx: any) => ({
      ...tx,
      amount: String(tx.amount), // Defensive normalization
    }));
    return ok(c, { ...data, transactions: transactionsWithSafeAmount }, { page: q.page, limit: q.limit });
  })

  .post("/quick", zValidator("json", quickAddSchema), async (c) => {
    const userId = c.get("userId");
    const correlationId = c.get("correlationId");
    const { text, categoryId } = c.req.valid("json");
    const idempotencyKey = c.req.header("Idempotency-Key");
    
    if (idempotencyKey) {
      const existing = await transactionService.getTransactionByIdempotencyKey(userId, idempotencyKey);
      if (existing) {
        return ok(c, {
          success: true,
          message: 'Giao dịch đã được lưu! (Idempotent)',
          transaction: existing
        });
      }
    }

    try {
      const tx = await transactionService.quickAdd(userId, text, { 
        categoryId,
        idempotencyKey 
      });
      return created(c, {
        success: true,
        message: 'Giao dịch đã được lưu!',
        transaction: tx
      });
    } catch (e: any) {
      if (e instanceof UnparseableInputError) {
        logger.warn({ event: 'QUICK_ADD_PARSE_FAILED', correlationId, input: e.input });
        return err(c, 422, "unprocessable_input", "Không thể nhận diện được thông tin giao dịch. Vui lòng thử lại.");
      }
      throw e;
    }
  })

  .post("/", zValidator("json", insertTransactionSchema), async (c) => {
    const userId = c.get("userId");
    const idempotencyKey = c.req.header("Idempotency-Key");

    if (idempotencyKey) {
      const existing = await transactionService.getTransactionByIdempotencyKey(userId, idempotencyKey);
      if (existing) {
        return err(c, 409, "CONFLICT", "Giao dịch đã tồn tại", { id: existing.id });
      }
    }

    const transaction = await transactionService.createTransaction(userId, {
      ...c.req.valid("json"),
      idempotencyKey: idempotencyKey || undefined,
    });
    return created(c, transaction);
  })

  .put("/:id", zValidator("json", updateTransactionSchema), async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.param();
    try {
      const tx = await transactionService.updateTransaction(userId, id, c.req.valid("json"));
      return ok(c, tx);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  })

  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.param();
    try {
      await transactionService.deleteTransaction(userId, id);
      return ok(c, { message: "Đã xóa giao dịch" });
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  });


```

## File: `apps/api/src/routes/wallet.ts`

```typescript
// apps/api/src/routes/wallet.ts
import { Hono } from "hono";
import { zValidator } from "../lib/validator";
import { quickSyncWalletSchema } from "@finance/shared-schemas";
import { walletService } from "../services/container";
import { ok, err } from "../lib/response";

export const walletRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/cash", async (c) => {
    const wallet = await walletService.getWallet(c.get("userId"));
    if (!wallet) return err(c, 404, "NOT_FOUND", "Không tìm thấy ví tiền mặt");
    return ok(c, wallet);
  })

  .put("/cash", zValidator("json", quickSyncWalletSchema), async (c) => {
    const userId = c.get("userId");
    const { newBalance, note } = c.req.valid("json");
    const idempotencyKey = c.req.header("Idempotency-Key");

    if (idempotencyKey) {
      const existing = await walletService.getSyncByIdempotencyKey(userId, idempotencyKey);
      if (existing) {
        return ok(c, await walletService.getWallet(userId)); // Return current wallet state for idempotent retries
      }
    }

    const wallet = await walletService.quickSync(userId, newBalance, note, {
      idempotencyKey: idempotencyKey || undefined,
    });
    return ok(c, wallet);
  });

```

## File: `apps/api/src/middleware/auth-guard.ts`

```typescript
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

```

## File: `apps/api/src/middleware/error.ts`

```typescript
// apps/api/src/middleware/error.ts
// Global error handler — no stack traces to client (security)
import { ErrorHandler } from "hono";
import { ZodError } from "zod";

export const errorHandler: ErrorHandler = (err, c) => {
  // Zod validation error → 400 with field details
  if (err instanceof ZodError) {
    return c.json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Dữ liệu không hợp lệ",
        details: err.issues.map((e: any) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
    }, 400);
  }

  // Generic error — log internally, return safe message
  console.error("[API Error]", {
    message: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });

  return c.json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Đã có lỗi xảy ra. Vui lòng thử lại.",
    },
  }, 500);
};

```

## File: `apps/api/src/middleware/rate-limit.ts`

```typescript
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

```

## File: `apps/api/src/middleware/security-headers.ts`

```typescript
// apps/api/src/middleware/security-headers.ts
// Security headers middleware (OWASP recommended)
import { createMiddleware } from "hono/factory";

export const securityHeaders = createMiddleware(async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  // Safe environment check
  const isDevelopment = (c.env as any)?.NODE_ENV === "development";
  if (!isDevelopment) {
    c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  
  await next();
});

```

