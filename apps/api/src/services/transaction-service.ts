// apps/api/src/services/transaction-service.ts
import { TransactionRepository } from "@finance/db/src/repositories/transaction.repo";
import type { InsertTransaction } from "@finance/shared-schemas";
import type { INLPAdapter } from "./adapters/nlp-adapter";
import type { CategoryRepository } from "@finance/db/src/repositories/category-repository";
import type { ICache } from "@finance/cache";
import { eventBus } from "../lib/event-bus";
import { db, wallets, walletLogs, transactions, and, eq, sql } from "@finance/db";
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
    private readonly cache: ICache
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
   * CSV Import: parse CSV rows and bulk-create transactions.
   * Expected CSV format: date,amount,type,note,category (header row optional)
   * Returns summary with count of imported, skipped, and errors.
   */
  async importCSV(userId: string, csvText: string, walletId: string, batchKey?: string) {
    const lines = csvText.trim().split("\n");
    if (lines.length < 1) throw new Error("File CSV rỗng");

    // Detect and skip header row
    const headerLine = lines[0].toLowerCase();
    const hasHeader = /ngày|date|số tiền|amount|loại|type|ghi chú|note|danh mục|category/.test(headerLine);
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const errors: string[] = [];
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) { skipped++; continue; }

      const rowNumber = i + (hasHeader ? 2 : 1);
      const cols = this.parseCSVLine(line);
      if (cols.length < 4) {
        errors.push(`Dòng ${rowNumber}: không đủ cột (cần: ngày,số tiền,loại,ghi chú)`);
        skipped++;
        continue;
      }

      const [dateStr, amountStr, typeStr, noteStr, categoryStr] = cols;

      // Validate date
      const dateMatch = dateStr?.trim().match(/^(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})$/);
      if (!dateMatch) {
        errors.push(`Dòng ${rowNumber}: ngày không hợp lệ (${dateStr})`);
        skipped++;
        continue;
      }
      let displayDate = dateStr.trim();
      // Convert DD/MM/YYYY to YYYY-MM-DD
      if (displayDate.includes("/")) {
        const [d, m, y] = displayDate.split("/");
        displayDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }

      // Validate amount
      const cleanAmount = amountStr?.trim().replace(/[^0-9.-]/g, "") || "0";
      if (!/^-?\d+(\.\d+)?$/.test(cleanAmount) || parseFloat(cleanAmount) === 0) {
        errors.push(`Dòng ${rowNumber}: số tiền không hợp lệ (${amountStr})`);
        skipped++;
        continue;
      }

      // Validate type
      const rawType = typeStr?.trim().toLowerCase() || "";
      const type = rawType.includes("thu") || rawType === "income" ? "income" :
                   rawType.includes("chi") || rawType === "expense" ? "expense" :
                   rawType === "transfer" ? "transfer" : null;
      if (!type) {
        errors.push(`Dòng ${rowNumber}: loại không hợp lệ (${typeStr}), dùng 'income' hoặc 'expense'`);
        skipped++;
        continue;
      }

      // Category lookup by name (optional)
      let categoryId: number | undefined;
      const catName = categoryStr?.trim();
      if (catName) {
        const categories = await this.categoryRepository.findAll(userId);
        const matched = categories.find((c: any) =>
          c.name.toLowerCase() === catName.toLowerCase() ||
          c.name.toLowerCase().includes(catName.toLowerCase())
        );
        if (matched) categoryId = matched.id;
      }

      try {
        await this.createTransaction(userId, {
          walletId: walletId as any,
          categoryId: categoryId || 1,
          amount: cleanAmount,
          type,
          note: noteStr?.trim() || undefined,
          displayDate,
          source: "import",
          idempotencyKey: batchKey ? `${batchKey}_row${rowNumber}` : undefined,
        });
        imported++;
      } catch (e: any) {
        // Duplicate idempotency key = safe to skip
        if (e.message?.includes("ER_DUP_ENTRY") || e.message?.includes("Duplicate")) {
          skipped++;
        } else {
          errors.push(`Dòng ${rowNumber}: ${e.message}`);
          skipped++;
        }
      }
    }

    return { imported, skipped, errors };
  }

  /** Parse a CSV line handling quoted fields */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current);
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
      displayDate: new Date().toISOString().split('T')[0] as any,
      source: 'quick_add',
      idempotencyKey: options.idempotencyKey,
    });
  }
}
