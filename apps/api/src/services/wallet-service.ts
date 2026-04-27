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
        const matched = await this.categoryRepository.findByName("Khác", userId, tx);
        const catId = matched?.id;

        if (!catId) {
          throw new Error("Không tìm thấy danh mục 'Khác' để tạo giao dịch tự động");
        }

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
