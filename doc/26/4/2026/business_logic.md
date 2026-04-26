# Business Logic (Services)

## File: `apps/api/src/services/ai-service.ts`

```typescript
import { db, categories } from "@finance/db";
import { eq, and, sql, like, isNull } from "@finance/db";
import type { INLPAdapter, NLPParsedResult } from "./adapters/nlp-adapter";

interface NLPResult extends NLPParsedResult {
  categoryId: number;
}

/**
 * AI Service for sophisticated language processing.
 * Delegates parsing to an INLPAdapter and handles category resolution.
 */
export class AIService {
  constructor(private readonly nlpAdapter: INLPAdapter) {}

  async parseQuickAdd(userId: string, text: string): Promise<NLPResult> {
    const parsed = this.nlpAdapter.parse(text);

    // Find best category match based on keyword hint from adapter
    const keyword = parsed.keyword || "Khác";
    const [category] = await (db as any)
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          like(categories.name, `%${keyword}%`),
          isNull(categories.deletedAt)
        )
      )
      .limit(1);

    return {
      ...parsed,
      categoryId: category?.id ?? 11, // Fallback to Misc
    };
  }
}


```

## File: `apps/api/src/services/analytics-service.ts`

```typescript
import { db, transactions, categories } from "@finance/db";
import { eq, and, gte, lte, isNull, sum, desc, sql } from "@finance/db";
import Decimal from "decimal.js";

interface CategorySpending {
  categoryId: number;
  categoryName: string;
  amount: string;
  icon: string;
  color: string;
}

/**
 * Service for financial analytics.
 * Calculates spending by category and monthly trends.
 */
export class AnalyticsService {
  async getCategorySpending(userId: string, month: string): Promise<CategorySpending[]> {
    const [year, mon] = month.split("-").map(Number);
    const startDate = `${year}-${String(mon).padStart(2, "0")}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${year}-${String(mon).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const rows = await (db as any)
      .select({
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        icon: categories.icon,
        color: categories.color,
        total: sum(transactions.amount),
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId as any),
          eq(transactions.type, "expense"),
          gte(transactions.displayDate, startDate),
          lte(transactions.displayDate, endDate),
          isNull(transactions.deletedAt)
        )
      )
      .groupBy(transactions.categoryId, categories.name, categories.icon, categories.color)
      .orderBy(desc(sql`total`));

    return rows.map((row: any) => ({
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      icon: row.icon,
      color: row.color,
      amount: new Decimal(row.total ?? "0").toFixed(2),
    }));
  }

  async getMonthlyTrend(userId: string, numMonths: number = 6) {
    const now = new Date();
    const year = now.getFullYear();
    const mon = now.getMonth() + 1; // 1-12
    
    // N-th month ago start date
    const startMonthDate = new Date(year, mon - numMonths, 1);
    const startDate = `${startMonthDate.getFullYear()}-${String(startMonthDate.getMonth() + 1).padStart(2, "0")}-01`;

    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${year}-${String(mon).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const rows = await (db as any)
      .select({
        month: sql<string>`DATE_FORMAT(${transactions.displayDate}, '%Y-%m')`.as("month"),
        type: transactions.type,
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId as any),
          gte(transactions.displayDate, startDate),
          lte(transactions.displayDate, endDate),
          isNull(transactions.deletedAt)
        )
      )
      .groupBy(sql`month`, transactions.type);

    const result: Record<string, { month: string, income: string, expense: string }> = {};

    for (let i = 0; i < numMonths; i++) {
      const d = new Date(year, mon - numMonths + i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      result[mStr] = { month: mStr, income: "0.00", expense: "0.00" };
    }

    for (const row of rows as any[]) {
      if (!result[row.month]) continue; 
      
      if (row.type === "income") {
        result[row.month].income = new Decimal(row.total ?? "0").toFixed(2);
      } else if (row.type === "expense") {
        result[row.month].expense = new Decimal(row.total ?? "0").toFixed(2);
      }
    }

    return Object.values(result).sort((a, b) => a.month.localeCompare(b.month));
  }
}

```

## File: `apps/api/src/services/auth-service.ts`

```typescript
// apps/api/src/services/auth-service.ts
// Auth operations — login, register, refresh, logout
// Passwords: bcryptjs cost=12. Tokens: jose (Edge-compatible).
// Refresh tokens: SHA-256 hashed before DB storage.
import { db, users, userSettings, cashWallet, refreshTokens } from "@finance/db";
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
        
        const insertResult = await tx.insert(users).values({
          email,
          username,
          fullName: name ?? email.split("@")[0],
          avatarUrl: picture ?? null,
          firebaseUid,
          emailVerified: 1, // Firebase verified email
        });

        // Handle both [ResultSetHeader, undefined] (mysql2) and { insertId } (tidb-serverless)
        const insertId = Array.isArray(insertResult) ? insertResult[0].insertId : (insertResult as any).insertId;
        const newUserId = insertId.toString();
        
        await tx.insert(userSettings).values({ userId: newUserId as any });
        await tx.insert(cashWallet).values({ userId: newUserId as any });
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

```

## File: `apps/api/src/services/bill-service.ts`

```typescript
// apps/api/src/services/bill-service.ts
import Decimal from "decimal.js";
import type { BillRepository } from "@finance/db/src/repositories/bill.repo";
import type { InsertBill, UpdateBill, InsertBillPayment } from "@finance/shared-schemas";

export type BillStatus = "paid" | "partial" | "pending";

export class BillService {
  constructor(private readonly repository: BillRepository) {}

  async getBillPaymentStatus(userId: string, billId: string, periodMonth: string): Promise<{ status: BillStatus; totalPaid: string }> {
    const totalPaidStr = await this.repository.sumPayments(billId, periodMonth);
    const totalPaid = new Decimal(totalPaidStr);
    
    const bill = await this.repository.findById(billId, userId);
    if (!bill) throw Object.assign(new Error("Hóa đơn không tồn tại"), { code: "NOT_FOUND" });
    
    const billAmount = new Decimal(bill.amount);

    const status: BillStatus =
      totalPaid.gte(billAmount) ? "paid" :
      totalPaid.gt(0)           ? "partial" : "pending";

    return { status, totalPaid: totalPaid.toFixed(2) };
  }

  async payBill(userId: string, input: InsertBillPayment & { idempotencyKey?: string }) {
    const billIdNum = input.billId;
    const bill = await this.repository.findById(billIdNum, userId);

    if (!bill) throw Object.assign(new Error("Hóa đơn không tồn tại"), { code: "NOT_FOUND" });

    const { status } = await this.getBillPaymentStatus(userId, billIdNum, input.periodMonth);
    if (status === "paid") {
      throw Object.assign(new Error("Hóa đơn kỳ này đã thanh toán đủ"), { code: "ALREADY_PAID" });
    }

    return this.repository.createPayment({
      billId:      billIdNum as any,
      userId:      userId as any,
      periodMonth: input.periodMonth,
      amountPaid:  input.amountPaid,
      note:        input.note ?? null,
      idempotencyKey: input.idempotencyKey,
    });
  }

  async getBillByIdempotencyKey(userId: string, key: string) {
    return this.repository.findByIdempotencyKey(userId, key);
  }

  async getPaymentByIdempotencyKey(userId: string, key: string) {
    return this.repository.findPaymentByIdempotencyKey(userId, key);
  }

  async getActiveBills(userId: string) {
    return this.repository.findActive(userId);
  }

  async getAllBills(userId: string) {
    return this.repository.findAll(userId);
  }

  async createBill(userId: string, input: InsertBill & { idempotencyKey?: string }) {
    return this.repository.create({
      ...input,
      userId: userId as any,
      idempotencyKey: input.idempotencyKey,
    });
  }

  async updateBill(userId: string, id: string, input: UpdateBill) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) throw Object.assign(new Error("Hóa đơn không tồn tại"), { code: "NOT_FOUND" });

    return this.repository.update(id, userId, {
      ...input,
    });
  }

  async deleteBill(userId: string, id: string) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) throw Object.assign(new Error("Hóa đơn không tồn tại"), { code: "NOT_FOUND" });
    
    await this.repository.delete(id, userId);
  }
}


```

## File: `apps/api/src/services/budget-service.ts`

```typescript
import { db } from "@finance/db";
import {
  budgets,
  budgetCategories,
  type NewBudget,
} from "@finance/db/src/schema/budgets";
import { transactions } from "@finance/db/src/schema/transactions";
import { and, eq, isNull, sum, between, inArray, sql, desc } from "drizzle-orm";
import Decimal from "decimal.js";

export class BudgetService {
  async getBudgets(userId: string) {
    return db
      .select()
      .from(budgets)
      .where(
        and(eq(budgets.userId, userId), isNull(budgets.deletedAt)),
      );
  }

  async getBudgetSummary(userId: string) {
    const activeBudgets = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.status, "active"),
          isNull(budgets.deletedAt),
        ),
      );

    let totalLimit = new Decimal(0);
    let totalSpent = new Decimal(0);
    let totalProjected = new Decimal(0);

    for (const budget of activeBudgets) {
      const detail = await this.getBudgetDetail(userId, String(budget.id));
      totalLimit = totalLimit.plus(budget.targetAmount);
      totalSpent = totalSpent.plus(detail.spent);
      totalProjected = totalProjected.plus(detail.projectedSpending);
    }

    // Get total income for current month
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const [incomeRow] = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "income"),
          between(transactions.displayDate, startDate, endDate),
          isNull(transactions.deletedAt),
        ),
      );

    const left = totalLimit.minus(totalSpent);
    const percent = totalLimit.isZero()
      ? 0
      : totalSpent.div(totalLimit).times(100).toNumber();

    return {
      totalLimit: totalLimit.toFixed(2),
      totalSpent: totalSpent.toFixed(2),
      totalIncome: new Decimal(incomeRow?.total ?? "0").toFixed(2),
      projectedSpending: totalProjected.toFixed(2),
      left: left.toFixed(2),
      percent: Math.round(percent),
    };
  }

  async getBudgetDetail(userId: string, budgetId: string) {
    const [budget] = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.id, budgetId),
          eq(budgets.userId, userId),
          isNull(budgets.deletedAt),
        ),
      )
      .limit(1);
    if (!budget)
      throw Object.assign(new Error("Budget not found"), { code: "NOT_FOUND" });

    const spent = await this.calculateSpent(budget);
    const left = new Decimal(budget.targetAmount).minus(spent);
    const percent = new Decimal(budget.targetAmount).isZero()
      ? 0
      : new Decimal(spent).div(budget.targetAmount).times(100).toNumber();

    // Lấy danh sách giao dịch thuộc budget
    let categoryIds: number[] = [];
    if (!budget.isAllCategories) {
      const budgetCats = await db
        .select({ categoryId: budgetCategories.categoryId })
        .from(budgetCategories)
        .where(eq(budgetCategories.budgetId, budget.id));
      categoryIds = budgetCats.map((c) => Number(c.categoryId));
    }
    const txFilters = [
      eq(transactions.userId, userId),
      eq(transactions.type, "expense"),
      between(transactions.displayDate, budget.startDate, budget.endDate),
      isNull(transactions.deletedAt),
    ];
    if (!budget.isAllCategories && categoryIds.length > 0) {
      txFilters.push(inArray(transactions.categoryId, categoryIds));
    }
    const relatedTxs = await db
      .select()
      .from(transactions)
      .where(and(...txFilters))
      .orderBy(desc(transactions.displayDate));

    // Tính recommended daily và projected spending
    const today = new Date();
    const start = new Date(budget.startDate);
    const end = new Date(budget.endDate);
    const totalDays =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysElapsed = Math.max(
      1,
      Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const daysRemaining = Math.max(
      0,
      Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const recommendedDaily =
      daysRemaining > 0
        ? new Decimal(budget.targetAmount)
            .minus(spent)
            .div(daysRemaining)
            .toNumber()
        : 0;
    const projectedSpending =
      daysElapsed > 0
        ? new Decimal(spent).div(daysElapsed).times(totalDays).toNumber()
        : 0;

    return {
      ...budget,
      spent: spent.toFixed(2),
      left: left.toFixed(2),
      percent: Math.round(percent),
      recommendedDaily,
      projectedSpending,
      daysElapsed,
      daysRemaining,
      transactions: relatedTxs,
    };
  }

  async createBudget(userId: string, input: any) {
    const newBudget: NewBudget = {
      userId: userId,
      name: input.name,
      icon: input.icon,
      targetAmount: input.targetAmount,
      periodType: input.periodType,
      startDate: input.startDate,
      endDate: input.endDate,
      isAllCategories: input.isAllCategories ? 1 : 0,
      walletScope: input.walletScope,
      status: "active",
    };
    const [result] = await db.insert(budgets).values(newBudget);
    const budgetId = result.insertId;
    if (!input.isAllCategories && input.categoryIds?.length) {
      await db.insert(budgetCategories).values(
        input.categoryIds.map((catId: number) => ({
          budgetId: budgetId,
          categoryId: catId,
        })),
      );
    }
    return this.getBudgetDetail(userId, String(budgetId));
  }

  async updateBudget(userId: string, budgetId: string, input: any) {
    const [existing] = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.id, budgetId),
          eq(budgets.userId, userId),
          isNull(budgets.deletedAt),
        ),
      )
      .limit(1);
    if (!existing)
      throw Object.assign(new Error("Budget not found"), { code: "NOT_FOUND" });

    await db
      .update(budgets)
      .set({
        name: input.name,
        icon: input.icon,
        targetAmount: input.targetAmount,
        periodType: input.periodType,
        startDate: input.startDate,
        endDate: input.endDate,
        isAllCategories: input.isAllCategories ? 1 : 0,
        walletScope: input.walletScope,
        updatedAt: new Date(),
      })
      .where(eq(budgets.id, budgetId));

    if (input.isAllCategories !== undefined || input.categoryIds) {
      await db
        .delete(budgetCategories)
        .where(eq(budgetCategories.budgetId, budgetId));
      
      if (input.isAllCategories === false && input.categoryIds?.length) {
        await db.insert(budgetCategories).values(
          input.categoryIds.map((catId: number) => ({
            budgetId: budgetId,
            categoryId: catId,
          })),
        );
      }
    }

    return this.getBudgetDetail(userId, budgetId);
  }

  async deleteBudget(userId: string, budgetId: string) {
    const [existing] = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.id, budgetId),
          eq(budgets.userId, userId),
          isNull(budgets.deletedAt),
        ),
      )
      .limit(1);
    if (!existing)
      throw Object.assign(new Error("Budget not found"), { code: "NOT_FOUND" });
    await db
      .update(budgets)
      .set({ deletedAt: new Date() })
      .where(eq(budgets.id, budgetId));
  }

  private async calculateSpent(budget: any): Promise<Decimal> {
    let categoryIds: number[] = [];
    if (!budget.isAllCategories) {
      const budgetCats = await db
        .select({ categoryId: budgetCategories.categoryId })
        .from(budgetCategories)
        .where(eq(budgetCategories.budgetId, budget.id));
      categoryIds = budgetCats.map((c) => Number(c.categoryId));
    }
    const filters = [
      eq(transactions.userId, budget.userId),
      eq(transactions.type, "expense"),
      between(transactions.displayDate, budget.startDate, budget.endDate),
      isNull(transactions.deletedAt),
    ];
    if (!budget.isAllCategories && categoryIds.length > 0) {
      filters.push(inArray(transactions.categoryId, categoryIds));
    }
    const [row] = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(...filters));
    return new Decimal(row?.total ?? "0");
  }
}

```

## File: `apps/api/src/services/category-service.ts`

```typescript
// apps/api/src/services/category-service.ts
import type { CategoryRepository } from "@finance/db/src/repositories/category-repository";
import type { InsertCategory, UpdateCategory } from "@finance/shared-schemas";

/**
 * Service for managing categories.
 * Implements business logic and uses CategoryRepository for data access.
 */
export class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

  async getCategories(userId: string) {
    return this.repository.findAll(userId);
  }

  async createCategory(userId: string, input: InsertCategory) {
    return this.repository.create({
      userId: userId as any,
      name: input.name,
      type: input.type,
      icon: input.icon,
      color: input.color,
      sortOrder: input.sortOrder,
    });
  }

  async updateCategory(userId: string, id: number, input: UpdateCategory) {
    const existing = await this.repository.findById(id, userId);

    if (!existing) {
      throw Object.assign(new Error("Danh mục không tồn tại hoặc không có quyền sửa"), { code: "NOT_FOUND" });
    }

    return this.repository.update(id, userId, {
      ...input,
    });
  }

  async deleteCategory(userId: string, id: number) {
    const existing = await this.repository.findById(id, userId);

    if (!existing) {
      throw Object.assign(new Error("Danh mục không tồn tại hoặc không có quyền xóa"), { code: "NOT_FOUND" });
    }

    await this.repository.delete(id, userId);
  }
}

```

## File: `apps/api/src/services/container.ts`

```typescript
import { db } from "@finance/db";
import { 
  TransactionRepository, 
  AnalyticsRepository, 
  CategoryRepository,
  BillRepository,
  GoalRepository
} from "@finance/db/src/repositories";
import { getCache, type ICache } from "@finance/cache";
import { CategoryService } from "./category-service";
import { TransactionService } from "./transaction-service";
import { RegexNLPAdapter } from "./adapters/nlp-adapter";
import { BudgetService } from "./budget-service";
import { AIService } from "./ai-service";
import { WalletService } from "./wallet-service";
import { AnalyticsService } from "./analytics-service";
import { BillService } from "./bill-service";
import { GoalService } from "./goal-service";

/**
 * Enterprise Service Container
 * Supports dynamic re-initialization for "Transaction-per-Test" isolation.
 * Standard Path: Uses DI and avoids global state pollution.
 */
export class Container {
  private _categoryRepo!: CategoryRepository;
  private _transactionRepo!: TransactionRepository;
  private _analyticsRepo!: AnalyticsRepository;
  private _billRepo!: BillRepository;
  private _goalRepo!: GoalRepository;
  private _cache!: ICache;
  private _nlpAdapter!: RegexNLPAdapter;
  private _categoryService!: CategoryService;
  private _transactionService!: TransactionService;
  private _budgetService!: BudgetService;
  private _aiService!: AIService;
  private _walletService!: WalletService;
  private _analyticsService!: AnalyticsService;
  private _billService!: BillService;
  private _goalService!: GoalService;

  constructor() {
    this.initialize(db);
  }

  public initialize(dbInstance: any) {
    this._categoryRepo = new CategoryRepository(dbInstance);
    this._transactionRepo = new TransactionRepository(dbInstance);
    this._analyticsRepo = new AnalyticsRepository(dbInstance);
    this._billRepo = new BillRepository(dbInstance);
    this._goalRepo = new GoalRepository(dbInstance);
    this._cache = getCache();
    this._nlpAdapter = new RegexNLPAdapter();

    this._categoryService = new CategoryService(this._categoryRepo);
    this._transactionService = new TransactionService(
      this._transactionRepo,
      this._categoryRepo,
      this._nlpAdapter,
      this._cache
    );
    this._budgetService = new BudgetService();
    this._aiService = new AIService(this._nlpAdapter);
    this._walletService = new WalletService(this._categoryRepo);
    this._analyticsService = new AnalyticsService();
    this._billService = new BillService(this._billRepo);
    this._goalService = new GoalService(this._goalRepo);
  }

  get categoryService() { return this._categoryService; }
  get transactionService() { return this._transactionService; }
  get budgetService() { return this._budgetService; }
  get aiService() { return this._aiService; }
  get walletService() { return this._walletService; }
  get analyticsService() { return this._analyticsService; }
  get billService() { return this._billService; }
  get goalService() { return this._goalService; }
  get cache() { return this._cache; }
  
  // Repositories
  get transactionRepo() { return this._transactionRepo; }
  get analyticsRepo() { return this._analyticsRepo; }
  get categoryRepo() { return this._categoryRepo; }
  get billRepo() { return this._billRepo; }
  get goalRepo() { return this._goalRepo; }
}

export const container = new Container();

/**
 * Dynamic Service Proxy
 * Allows routes to use 'service' imports while still benefiting from 
 * runtime re-initialization (e.g. during integration tests).
 */
function createServiceProxy<T extends object>(getService: () => T): T {
  return new Proxy({} as T, {
    get: (_, prop) => {
      const service = getService();
      const val = (service as any)[prop];
      if (typeof val === 'function') {
        return val.bind(service);
      }
      return val;
    }
  });
}

export const categoryService = createServiceProxy(() => container.categoryService);
export const transactionService = createServiceProxy(() => container.transactionService);
export const budgetService = createServiceProxy(() => container.budgetService);
export const aiService = createServiceProxy(() => container.aiService);
export const walletService = createServiceProxy(() => container.walletService);
export const analyticsService = createServiceProxy(() => container.analyticsService);
export const billService = createServiceProxy(() => container.billService);
export const goalService = createServiceProxy(() => container.goalService);
export const cache = createServiceProxy(() => container.cache);

// Export repositories too
export const transactionRepo = createServiceProxy(() => container.transactionRepo);
export const analyticsRepo = createServiceProxy(() => container.analyticsRepo);
export const categoryRepo = createServiceProxy(() => container.categoryRepo);
export const billRepo = createServiceProxy(() => container.billRepo);
export const goalRepo = createServiceProxy(() => container.goalRepo);


```

## File: `apps/api/src/services/goal-service.ts`

```typescript
// apps/api/src/services/goal-service.ts
import Decimal from "decimal.js";
import { db, notifications } from "@finance/db";
import type { GoalRepository } from "@finance/db/src/repositories/goal.repo";
import type { InsertGoal, UpdateGoal, ContributeGoal } from "@finance/shared-schemas";

export class GoalService {
  constructor(private readonly repository: GoalRepository) {}

  async getActiveGoals(userId: string) {
    return this.repository.findActive(userId);
  }

  async getAllGoals(userId: string) {
    return this.repository.findAll(userId);
  }

  async createGoal(userId: string, input: InsertGoal & { idempotencyKey?: string }) {
    return this.repository.create({
      userId: userId as any,
      name: input.name,
      icon: input.icon,
      targetAmount: input.targetAmount,
      monthlyContribution: input.monthlyContribution,
      deadline: input.deadline ?? null,
      priority: input.priority,
      notes: input.notes ?? null,
      status: "active",
      idempotencyKey: input.idempotencyKey,
    });
  }

  async getGoalByIdempotencyKey(userId: string, key: string) {
    return this.repository.findByIdempotencyKey(userId, key);
  }

  async contributeToGoal(userId: string, goalId: string, input: ContributeGoal & { idempotencyKey?: string }) {
    const goal = await this.repository.findById(goalId, userId);
    if (!goal) throw Object.assign(new Error("Mục tiêu không tồn tại"), { code: "NOT_FOUND" });

    if (goal.status === "completed" || goal.status === "cancelled") {
      throw Object.assign(
        new Error(`Không thể thêm tiền vào mục tiêu đã ${goal.status === "completed" ? "hoàn thành" : "hủy"}`),
        { code: "GOAL_INACTIVE" },
      );
    }

    const newSaved = new Decimal(goal.currentSaved).plus(new Decimal(input.amount));
    const target   = new Decimal(goal.targetAmount);
    const isComplete = newSaved.gte(target);

    const updated = await this.repository.update(goalId, userId, {
      currentSaved: newSaved.toFixed(2),
      ...(isComplete && { status: "completed", completedAt: new Date() }),
    });

    if (isComplete) {
      // @ts-ignore - Drizzle Proxy issue
      await db.insert(notifications).values({
        userId: userId as any,
        type: "goal_completed",
        title: "🎉 Mục tiêu hoàn thành!",
        body: `Chúc mừng! Bạn đã đạt mục tiêu "${goal.name}"`,
      });
    }

    return updated;
  }

  async updateGoal(userId: string, id: string, input: UpdateGoal) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) throw Object.assign(new Error("Mục tiêu không tồn tại"), { code: "NOT_FOUND" });

    return this.repository.update(id, userId, {
      ...input,
      deadline: input.deadline ?? undefined,
    });
  }

  async deleteGoal(userId: string, goalId: string) {
    const existing = await this.repository.findById(goalId, userId);
    if (!existing) throw Object.assign(new Error("Không tìm thấy mục tiêu"), { code: "NOT_FOUND" });
    await this.repository.delete(goalId, userId);
  }
}


```

## File: `apps/api/src/services/idempotency.ts`

```typescript
// apps/api/src/services/idempotency.ts
// L1 Cache Adapter for Idempotency — Throttles duplicate requests using In-Memory Map
// Can be easily swapped with Redis/Upstash KV in production.

const MEMORY_KV = new Map<string, { expiresAt: number }>();

export const IdempotencyStorageAdapter = {
  async get(key: string): Promise<boolean> {
    const record = MEMORY_KV.get(key);
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      MEMORY_KV.delete(key);
      return false;
    }
    return true;
  },

  async set(key: string, ttlSeconds: number = 300): Promise<void> {
    MEMORY_KV.set(key, { expiresAt: Date.now() + ttlSeconds * 1000 });
  },

  // Cleanup job meant to be run periodically
  cleanUpStaleKeys() {
    const now = Date.now();
    for (const [key, val] of MEMORY_KV.entries()) {
      if (now > val.expiresAt) {
        MEMORY_KV.delete(key);
      }
    }
  }
};

```

## File: `apps/api/src/services/transaction-service.ts`

```typescript
// apps/api/src/services/transaction-service.ts
import { TransactionRepository } from "@finance/db/src/repositories/transaction.repo";
import type { InsertTransaction } from "@finance/shared-schemas";
import type { INLPAdapter } from "./adapters/nlp-adapter";
import type { CategoryRepository } from "@finance/db/src/repositories/category-repository";
import type { ICache } from "@finance/cache";

/**
 * Service for managing financial transactions.
 * Orchestrates repositories and handles business logic like Quick Add parsing.
 */
export class TransactionService {
  constructor(
    private readonly repository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly nlpAdapter: INLPAdapter,
    private readonly cache: ICache
  ) {}

  async getAllTransactions(userId: string) {
    // Current simple implementation: returns recent transactions
    return this.repository.findAll(userId);
  }

  async createTransaction(userId: string, input: InsertTransaction & { idempotencyKey?: string }) {
    return this.repository.create({
      ...input,
      userId: userId as any,
    });
  }

  async getTransaction(userId: string, id: string) {
    return this.repository.findById(id, userId);
  }

  async getTransactionByIdempotencyKey(userId: string, key: string) {
    return this.repository.findByIdempotencyKey(key, userId);
  }

  async updateTransaction(userId: string, id: string, input: Partial<InsertTransaction>) {
    const tx = await this.getTransaction(userId, id);
    if (!tx) throw Object.assign(new Error("Giao dịch không tồn tại"), { code: "NOT_FOUND" });

    return this.repository.update(id, userId, {
      ...input,
      // userId cannot be updated
      userId: undefined,
    } as any);
  }

  async deleteTransaction(userId: string, id: string) {
    const tx = await this.getTransaction(userId, id);
    if (!tx) throw Object.assign(new Error("Giao dịch không tồn tại"), { code: "NOT_FOUND" });

    await this.repository.delete(id, userId);
  }

  /**
   * High-level business logic for "Quick Add" via Natural Language.
   */
  async quickAdd(userId: string, text: string, options: { categoryId?: number; idempotencyKey?: string } = {}) {
    const parsed = this.nlpAdapter.parse(text);
    
    let categoryId = options.categoryId;
    
    // If no category ID provided, try to find one by keyword from NLP
    if (!categoryId && parsed.keyword) {
      const categories = await this.categoryRepository.findAll(userId);
      const matched = categories.find((c: any) => 
        c.name.toLowerCase().includes(parsed.keyword!.toLowerCase())
      );
      categoryId = matched?.id;
    }

    // Default to a fallback category (e.g., ID 1) if still not found
    categoryId = categoryId || 1;

    return this.createTransaction(userId, {
      categoryId,
      amount: parsed.amount,
      type: parsed.type,
      note: parsed.note,
      displayDate: new Date().toISOString().split('T')[0],
      source: 'quick_add',
      idempotencyKey: options.idempotencyKey,
    });
  }
}

```

## File: `apps/api/src/services/wallet-service.ts`

```typescript
import Decimal from "decimal.js";
import { cashWallet, cashWalletLogs, transactions, db, and } from "@finance/db";
import { eq } from "@finance/db";
import type { CategoryRepository } from "@finance/db/src/repositories/category-repository";

/**
 * Service for managing the cash wallet.
 * Handles quick sync logic and automated transaction creation.
 */
export class WalletService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getWallet(userId: string) {
    const [wallet] = await db
      .select()
      .from(cashWallet)
      .where(eq(cashWallet.userId, userId as any))
      .limit(1);

    if (!wallet) return null;

    const netChange = new Decimal(wallet.balance).minus(new Decimal(wallet.initialBalance));
    return { ...wallet, netChange: netChange.toFixed(2) };
  }

  /**
   * Quick Sync: user enters actual cash count → auto-detect difference
   * If diff < 0 → auto-create misc expense transaction
   */
  async quickSync(userId: string, newBalance: string, note?: string, options?: { idempotencyKey?: string }) {
    const [wallet] = await db.select().from(cashWallet).where(eq(cashWallet.userId, userId as any)).limit(1);
    if (!wallet) throw Object.assign(new Error("Không tìm thấy ví tiền mặt"), { code: "NOT_FOUND" });

    const before = new Decimal(wallet.balance);
    const after  = new Decimal(newBalance);
    const diff   = after.minus(before);

    await db.transaction(async (tx: any) => {
      let autoTxId: string | null = null;

      // Auto-create misc expense if money went down (diff negative)
      if (diff.isNegative()) {
        const categories = await this.categoryRepository.findAll(userId);
        const matched = categories.find((c: any) => c.name === "Khác");
        const catId = matched?.id ?? 11;

        const txResult = await tx.insert(transactions).values({
          userId: userId as any,
          categoryId: catId,
          amount: diff.abs().toFixed(2),
          type: "expense",
          note: note ?? "Chi phí không ghi nhận (Quick Sync)",
          displayDate: new Date().toISOString().split('T')[0],
          source: "quick_add",
        });

        autoTxId = txResult.lastInsertId?.toString() || null;
      }

      // Update wallet balance
      await tx.update(cashWallet).set({
        balance: after.toFixed(2),
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(cashWallet.userId, userId as any));

      // Insert audit log
      await tx.insert(cashWalletLogs).values({
        userId: userId as any,
        balanceBefore: before.toFixed(2),
        balanceAfter:  after.toFixed(2),
        difference:    diff.toFixed(2),
        note: note ?? null,
        autoTxId: autoTxId as any,
        idempotencyKey: options?.idempotencyKey,
      });
    });

    return this.getWallet(userId);
  }

  async getSyncByIdempotencyKey(userId: string, key: string) {
    const [log] = await db
      .select()
      .from(cashWalletLogs)
      .where(and(eq(cashWalletLogs.userId, userId as any), eq(cashWalletLogs.idempotencyKey, key)))
      .limit(1);
    return log;
  }
}

```

