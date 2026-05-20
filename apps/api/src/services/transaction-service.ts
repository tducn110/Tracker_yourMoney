// apps/api/src/services/transaction-service.ts
import { TransactionRepository } from "@finance/db/src/repositories/transaction.repo";
import type { InsertTransaction } from "@finance/shared-schemas";
import { type INLPAdapter, type NLPParsedResult, UnparseableInputError } from "./adapters/nlp-adapter";
import { GeminiNLPAdapter } from "./adapters/gemini-nlp-adapter";
import { logger } from "../lib/logger";
import type { CategoryRepository } from "@finance/db/src/repositories/category-repository";
import type { ICache } from "@finance/cache";
import type { AIService } from "./ai-service";
import { eventBus } from "../lib/event-bus";
import { db, wallets, walletLogs, transactions, notifications, and, eq, sql } from "@finance/db";
import Decimal from "decimal.js";

/**
 * Service for managing financial transactions.
 * Orchestrates repositories and handles business logic like Quick Add parsing.
 * Phase 26: Emits events for async background processing (budget recalc, cache invalidation).
 */
export class TransactionService {
  constructor(
    private readonly repository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly nlpAdapter: INLPAdapter,
    private readonly cache: ICache,
    private readonly aiService: AIService,
    private readonly fallbackNLPAdapter?: INLPAdapter  // Regex fallback when AI fails
  ) {}

  async getAllTransactions(userId: string) {
    return this.repository.findAll(userId);
  }

  async createTransaction(userId: string, input: InsertTransaction & { walletId: string; idempotencyKey?: string }) {
    if (!input.walletId) {
      throw Object.assign(new Error("walletId là bắt buộc"), { code: "BAD_REQUEST" });
    }

    // Fetch current wallet to get balance and version for OCC
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.id, input.walletId as any), eq(wallets.userId, userId as any)))
      .limit(1);

    if (!wallet) {
      throw Object.assign(new Error("Không tìm thấy ví"), { code: "NOT_FOUND" });
    }

    const amount = new Decimal(input.amount);
    const balanceBefore = new Decimal(wallet.balance);
    const isIncome = input.type === "income";
    const balanceAfter = isIncome ? balanceBefore.plus(amount) : balanceBefore.minus(amount);

    // Normalize displayDate: shared-schema sends string, DB expects Date
    const displayDate = input.displayDate
      ? new Date(input.displayDate as string)
      : new Date();

    // Atomic: insert transaction + update wallet balance + audit log
    const result = await db.transaction(async (tx: any) => {
      const [created] = await tx.insert(transactions).values({
        ...input,
        userId: userId as any,
        walletId: input.walletId as any,
        displayDate,
      }).returning();
      if (!created) throw new Error("Failed to create transaction");

      // OCC: update wallet balance with version check
      const updateResult = await tx.update(wallets).set({
        balance: balanceAfter.toFixed(2),
        version: sql`version + 1`,
        updatedAt: new Date(),
      }).where(and(
        eq(wallets.id, input.walletId as any),
        eq(wallets.userId, userId as any),
        eq(wallets.version, wallet.version ?? 0),
      ));

      if (updateResult.rowCount === 0) {
        throw Object.assign(new Error("Xung đột cập nhật — vui lòng thử lại"), { code: "CONFLICT" });
      }

      // Audit log
      await tx.insert(walletLogs).values({
        walletId: input.walletId as any,
        userId: userId as any,
        transactionId: created.id as any,
        balanceBefore: balanceBefore.toFixed(2),
        balanceAfter: balanceAfter.toFixed(2),
        difference: isIncome ? amount.toFixed(2) : amount.negated().toFixed(2),
        note: input.note ?? null,
        idempotencyKey: input.idempotencyKey ?? null,
      });

      return created;
    });

    // Emit event for async processing (budget recalc, cache invalidation)
    eventBus.emit({
      type: 'transaction:created',
      transactionId: String(result.id),
      userId,
      amount: input.amount,
      categoryId: input.categoryId!,
      walletId: input.walletId,
    });

    // Invalidate related caches
    eventBus.emit({ type: 'budget:invalidated', userId });

    await this.createTransactionNotification(userId, result, input.type);

    return result;
  }

  private async createTransactionNotification(userId: string, transaction: any, type: string) {
    try {
      const isIncome = type === "income";
      const amount = new Decimal(transaction.amount ?? "0").toNumber();
      const formatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
      const note = transaction.note ? String(transaction.note) : isIncome ? "Thu nhập" : "Chi tiêu";

      await db.insert(notifications).values({
        userId: userId as any,
        type: "system",
        title: isIncome ? "Đã ghi nhận thu nhập" : "Đã ghi nhận chi tiêu",
        body: `
          ${note} - ${formatter.format(amount)} đã được thêm vào giao dịch.
        `.trim(),
        icon: isIncome ? "💰" : "✅",
        actionUrl: "/transactions",
        metadata: {
          event: "transaction_created",
          transactionId: String(transaction.id),
          amount: transaction.amount,
          transactionType: type,
        },
      });
    } catch (error: any) {
      logger.warn({ event: "NOTIFICATION_CREATE_FAILED", userId, transactionId: transaction?.id, error: error?.message });
    }
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

    const result = await this.repository.update(id, userId, {
      ...input,
      userId: undefined,
    } as any);

    eventBus.emit({ type: 'transaction:updated', transactionId: String(result.id), userId });
    eventBus.emit({ type: 'budget:invalidated', userId });

    return result;
  }

  /**
   * High-level business logic for "Quick Add" via Natural Language.
   * 
   * Chain: Regex first (fast, reliable) → AI fallback (handles complex/unstructured input).
   * AI adapter has 2 API key fallback (AI_API_KEY → AI_API_KEY_2).
   */
  async quickAdd(userId: string, text: string, options: { walletId?: string; categoryId?: number; idempotencyKey?: string } = {}): Promise<any> {
    let parsed: NLPParsedResult | undefined;

    // ── Attempt 1: Regex parser (sync, fast, no API cost) ──
    if (this.fallbackNLPAdapter) {
      try {
        parsed = this.fallbackNLPAdapter.parse(text);
        logger.info({ event: "QUICK_ADD_PARSED_BY_REGEX", input: text, intent: parsed.intent });
      } catch (_regexError: any) {
        // Regex failed → fall through to AI
        logger.info({ event: "QUICK_ADD_REGEX_FAILED", input: text, error: _regexError.message });
      }
    }

    // ── Attempt 2: AI adapter (Gemini) with dual API key fallback ──
    if (!parsed) {
      try {
        if (this.nlpAdapter instanceof GeminiNLPAdapter) {
          parsed = await (this.nlpAdapter as GeminiNLPAdapter).parseAsync(text);
          logger.info({ event: "QUICK_ADD_PARSED_BY_AI", input: text, intent: parsed.intent });
        } else {
          parsed = this.nlpAdapter.parse(text);
        }
      } catch (e: any) {
        if (e instanceof UnparseableInputError) throw e;
        throw new UnparseableInputError(text);
      }
    }

    if (!parsed) {
      throw new UnparseableInputError(text);
    }

    // ── Handle Non-Transaction Intents ──

    // Unknown intent: AI couldn't identify a financial action
    if (parsed.intent === "unknown") {
      return {
        type: "unknown",
        suggestion: parsed.suggestion || "Mình chưa hiểu ý bạn 😊 Bạn có muốn ghi một khoản chi tiêu không? Ví dụ: 'ăn tối 80k' hoặc 'nhận lương 5tr'",
      };
    }

    if (parsed.intent === "create_wallet") {
      const walletName = parsed.walletName || parsed.keyword || "Ví mới";
      const resolvedWalletId = await this.aiService.resolveOrCreateWallet(userId, walletName, parsed.metadata);
      const [wallet] = await db.select().from(wallets).where(and(eq(wallets.id, resolvedWalletId as any), eq(wallets.userId, userId as any))).limit(1);
      return { type: "wallet", data: wallet };
    }

    if (parsed.intent === "create_category") {
      const categoryName = parsed.keyword || "Danh mục mới";
      const type = (parsed.type === "income" ? "income" : "expense") as "income" | "expense";
      const resolvedCategoryId = await this.aiService.resolveOrCreateCategory(userId, categoryName, type, parsed.metadata);
      const category = await this.categoryRepository.findById(resolvedCategoryId, userId);
      return { type: "category", data: category };
    }

    let categoryId = options.categoryId;

    // If no category ID provided, use AI to resolve or auto-create
    if (!categoryId && parsed.keyword) {
      try {
        const resolvedType = (parsed.type === "income" ? "income" : "expense") as "income" | "expense";
        categoryId = await this.aiService.resolveOrCreateCategory(
          userId,
          parsed.keyword,
          resolvedType,
          parsed.metadata
        );
      } catch (e: any) {
        logger.warn({ event: "AI_RESOLVE_CATEGORY_FAILED", keyword: parsed.keyword, error: e.message });
        // Fallback: try simple match
        const categories = await this.categoryRepository.findAll(userId);
        const matched = categories.find((c: any) =>
          c.name.toLowerCase().includes(parsed.keyword!.toLowerCase())
        );
        categoryId = matched?.id;
      }
    }

    // Default to a fallback category (e.g., ID 1) if still not found
    categoryId = categoryId || 1;

    let walletId = options.walletId;

    // Resolve or auto-create wallet if hint exists
    if (parsed.walletName) {
      try {
        const resolvedWalletId = await this.aiService.resolveOrCreateWallet(userId, parsed.walletName, parsed.metadata);
        if (resolvedWalletId) {
          walletId = resolvedWalletId;
        }
      } catch (e: any) {
        logger.warn({ event: "AI_RESOLVE_WALLET_FAILED", walletName: parsed.walletName, error: e.message });
      }
    }

    // Fallback: if no walletId provided or resolved, pick the first one
    if (!walletId) {
      const [firstWallet] = await db.select().from(wallets).where(eq(wallets.userId, userId as any)).limit(1);
      if (!firstWallet) {
        // Create a default "Ví tiền mặt" if user has no wallets at all
        walletId = await this.aiService.resolveOrCreateWallet(userId, "Ví tiền mặt");
      } else {
        walletId = String(firstWallet.id);
      }
    }

    if (!parsed.amount || !parsed.type) {
      throw new UnparseableInputError(text);
    }

    const transaction = await this.createTransaction(userId, {
      walletId: walletId!,
      categoryId,
      amount: parsed.amount,
      type: parsed.type,
      note: parsed.note,
      displayDate: new Date().toISOString().split('T')[0] as any,
      source: 'quick_add',
      idempotencyKey: options.idempotencyKey,
    });

    return { type: "transaction", data: transaction };
  }
}
