// apps/api/src/services/transaction-service.ts
import { TransactionRepository } from "@finance/db/src/repositories/transaction.repo";
import type { InsertTransaction } from "@finance/shared-schemas";
import type { INLPAdapter } from "./adapters/nlp-adapter";
import type { CategoryRepository } from "@finance/db/src/repositories/category-repository";
import type { ICache } from "@finance/cache";
import { eventBus } from "../lib/event-bus";

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
    private readonly cache: ICache
  ) {}

  async getAllTransactions(userId: string) {
    return this.repository.findAll(userId);
  }

  async createTransaction(userId: string, input: InsertTransaction & { walletId: string; idempotencyKey?: string }) {
    const result = await this.repository.create({
      ...input,
      userId: userId as any,
      walletId: input.walletId as any,
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

    return result;
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
   */
  async quickAdd(userId: string, text: string, options: { walletId: string; categoryId?: number; idempotencyKey?: string } = { walletId: "" }) {
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
      walletId: options.walletId,
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
