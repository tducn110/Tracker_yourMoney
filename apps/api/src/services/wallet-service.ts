import Decimal from "decimal.js";
import { sql } from "drizzle-orm";
import { wallets, walletLogs, transactions, db, and } from "@finance/db";
import { eq, isNull, desc } from "@finance/db";
import type { CategoryRepository } from "@finance/db/src/repositories/category-repository";

/**
 * Multi-wallet service (v13.0).
 * Replaces the old 1:1 cash_wallet with full multi-wallet CRUD.
 * All balance mutations go through wallet_logs for audit trail.
 */
export class WalletService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  /** Get all active wallets for a user (excluding soft-deleted). */
  async getWallets(userId: string) {
    const rows = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, userId as any), isNull(wallets.deletedAt)))
      .orderBy(desc(wallets.isDefault));
    return rows.map((w) => {
      const netChange = new Decimal(w.balance).minus(new Decimal(w.initialBalance));
      return { ...w, netChange: netChange.toFixed(2) };
    });
  }

  /** Get the user's default wallet (first by isDefault, then by creation date). */
  async getDefaultWallet(userId: string) {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, userId as any), isNull(wallets.deletedAt)))
      .orderBy(desc(wallets.isDefault))
      .limit(1);
    if (!wallet) return null;
    const netChange = new Decimal(wallet.balance).minus(new Decimal(wallet.initialBalance));
    return { ...wallet, netChange: netChange.toFixed(2) };
  }

  /** Get a single wallet by id. */
  async getWallet(userId: string, walletId: string) {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.id, walletId as any), eq(wallets.userId, userId as any), isNull(wallets.deletedAt)))
      .limit(1);
    if (!wallet) return null;
    const netChange = new Decimal(wallet.balance).minus(new Decimal(wallet.initialBalance));
    return { ...wallet, netChange: netChange.toFixed(2) };
  }

  /** Create a new wallet. */
  async createWallet(userId: string, input: {
    name: string;
    type: "cash" | "bank" | "credit" | "e_wallet" | "investment" | "other";
    initialBalance?: string;
    icon?: string;
    color?: string;
    isDefault?: boolean;
  }) {
    const [created] = await db.insert(wallets).values({
      userId: userId as any,
      name: input.name,
      type: input.type,
      initialBalance: input.initialBalance ?? "0.00",
      balance: input.initialBalance ?? "0.00",
      icon: input.icon ?? "💵",
      color: input.color ?? "#6B7280",
      isDefault: input.isDefault ?? false,
    } as any).returning();
    if (!created) throw new Error("Failed to create wallet");
    return this.getWallet(userId, String(created.id));
  }

  /** Update wallet metadata (name, icon, color, isDefault). Does not change balance. */
  async updateWallet(userId: string, walletId: string, input: {
    name?: string;
    icon?: string;
    color?: string;
    isDefault?: boolean;
  }) {
    const existing = await this.getWallet(userId, walletId);
    if (!existing) throw Object.assign(new Error("Không tìm thấy ví"), { code: "NOT_FOUND" });

    await db.update(wallets).set({
      ...input,
      updatedAt: new Date(),
    } as any).where(and(eq(wallets.id, walletId as any), eq(wallets.userId, userId as any)));

    return this.getWallet(userId, walletId);
  }

  /** Soft-delete a wallet. */
  async deleteWallet(userId: string, walletId: string) {
    const existing = await this.getWallet(userId, walletId);
    if (!existing) throw Object.assign(new Error("Không tìm thấy ví"), { code: "NOT_FOUND" });

    await db.update(wallets).set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    } as any).where(and(eq(wallets.id, walletId as any), eq(wallets.userId, userId as any)));
  }

  /**
   * Quick Sync: user enters actual balance → auto-detect difference.
   * If diff < 0 → auto-create misc expense transaction.
   * OCC: updates balance with optimistic concurrency control.
   */
  async quickSync(userId: string, walletId: string, newBalance: string, note?: string, options?: { idempotencyKey?: string }) {
    const wallet = await this.getWallet(userId, walletId);
    if (!wallet) throw Object.assign(new Error("Không tìm thấy ví"), { code: "NOT_FOUND" });

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

        const [autoTx] = await tx.insert(transactions).values({
          userId: userId as any,
          walletId: walletId as any,
          categoryId: catId,
          amount: diff.abs().toFixed(2),
          type: "expense",
          note: note ?? "Chi phí không ghi nhận (Quick Sync)",
          displayDate: new Date().toISOString().split('T')[0],
          source: "quick_add",
        }).returning();
        autoTxId = autoTx ? String(autoTx.id) : null;
      }

      // OCC: update wallet balance with version check
      const updateResult = await tx.update(wallets).set({
        balance: after.toFixed(2),
        version: sql`version + 1`,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      }).where(and(
        eq(wallets.id, walletId as any),
        eq(wallets.userId, userId as any),
        eq(wallets.version, (wallet as any).version ?? 0),
      ));

      if (updateResult.rowCount === 0) {
        throw Object.assign(new Error("Xung đột cập nhật — vui lòng thử lại"), { code: "CONFLICT" });
      }

      // Insert audit log
      await tx.insert(walletLogs).values({
        walletId: walletId as any,
        userId: userId as any,
        transactionId: autoTxId as any,
        balanceBefore: before.toFixed(2),
        balanceAfter: after.toFixed(2),
        difference: diff.toFixed(2),
        note: note ?? null,
        idempotencyKey: options?.idempotencyKey,
      });
    });

    return this.getWallet(userId, walletId);
  }

  /** Add funds to a wallet (income). */
  async addFunds(userId: string, walletId: string, amount: string, categoryId: number, note?: string, options?: { idempotencyKey?: string }) {
    const wallet = await this.getWallet(userId, walletId);
    if (!wallet) throw Object.assign(new Error("Không tìm thấy ví"), { code: "NOT_FOUND" });

    const before = new Decimal(wallet.balance);
    const after = before.plus(amount);

    await db.transaction(async (tx: any) => {
      const [fundsTx] = await tx.insert(transactions).values({
        userId: userId as any,
        walletId: walletId as any,
        categoryId,
        amount,
        type: "income",
        note: note ?? null,
        displayDate: new Date().toISOString().split('T')[0],
        source: "manual",
        idempotencyKey: options?.idempotencyKey,
      }).returning();
      const autoTxId = fundsTx ? String(fundsTx.id) : null;

      // OCC: update wallet balance with version check
      const updateResult = await tx.update(wallets).set({
        balance: after.toFixed(2),
        version: sql`version + 1`,
        updatedAt: new Date(),
      }).where(and(
        eq(wallets.id, walletId as any),
        eq(wallets.userId, userId as any),
        eq(wallets.version, (wallet as any).version ?? 0),
      ));

      if (updateResult.rowCount === 0) {
        throw Object.assign(new Error("Xung đột cập nhật — vui lòng thử lại"), { code: "CONFLICT" });
      }

      await tx.insert(walletLogs).values({
        walletId: walletId as any,
        userId: userId as any,
        transactionId: autoTxId as any,
        balanceBefore: before.toFixed(2),
        balanceAfter: after.toFixed(2),
        difference: amount,
        note: note ?? null,
        idempotencyKey: options?.idempotencyKey,
      });
    });

    return this.getWallet(userId, walletId);
  }

  async getSyncByIdempotencyKey(userId: string, walletId: string, key: string) {
    const [log] = await db
      .select()
      .from(walletLogs)
      .where(and(eq(walletLogs.walletId, walletId as any), eq(walletLogs.userId, userId as any), eq(walletLogs.idempotencyKey, key)))
      .limit(1);
    return log;
  }

}
