import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// ── ENVIRONMENT INITIALIZATION ──────────────────────────────────────
// Walk up from __dirname (or cwd) to find the monorepo root with .env
function findMonorepoRoot(startDir: string): string {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return startDir;
}

if (process.env.NODE_ENV !== "production") {
  const rootPath = findMonorepoRoot(process.cwd());
  const envPath = path.join(rootPath, ".env");
  const envLocalPath = path.join(rootPath, ".env.local");

  dotenv.config({ path: envPath, override: true });
  dotenv.config({ path: envLocalPath, override: true });
}

/**
 * Worker Service — Recurring Bills Processor (Phase 15)
 *
 * Runs daily to:
 * 1. Identify bills due today
 * 2. Process auto-pay bills
 * 3. Log due/overdue bills (Phase 20: will create notifications)
 *
 * Designed to run as a long-lived process with setInterval.
 * For serverless: trigger via HTTP endpoint or cron service.
 */

import { db, bills, billPayments, transactions, wallets, walletLogs } from "@finance/db";
import { eq, and, sql } from "drizzle-orm";
import Decimal from "decimal.js";

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Every hour

interface BillDue {
  billId: string;
  userId: string;
  name: string;
  amount: string;
  dueDay: number;
  periodMonth: string;
  autoPay: boolean;
  categoryId: number;
}

function getCurrentPeriodMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getToday(): number {
  return new Date().getDate();
}

async function findDueBills(): Promise<BillDue[]> {
  const today = getToday();
  const periodMonth = getCurrentPeriodMonth();

  const activeBills = await db
    .select()
    .from(bills)
    .where(eq(bills.isActive, true));

  const dueBills: BillDue[] = [];
  for (const bill of activeBills) {
    // Check if today matches due day (handle month-end: day 31 → last day of shorter months)
    const effectiveDueDay = Math.min(bill.dueDay, new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate());
    if (today !== effectiveDueDay) continue;

    // Check if already paid for this period
    const payments = await db
      .select({ total: sql<string>`COALESCE(SUM(${billPayments.amountPaid}), 0)` })
      .from(billPayments)
      .where(
        and(
          eq(billPayments.billId, bill.id as any),
          eq(billPayments.periodMonth, periodMonth),
        ),
      );

    const totalPaid = new Decimal(payments[0]?.total || "0");
    if (totalPaid.gte(new Decimal(bill.amount))) continue; // Already fully paid

    dueBills.push({
      billId: String(bill.id),
      userId: String(bill.userId),
      name: bill.name,
      amount: bill.amount,
      dueDay: bill.dueDay,
      periodMonth,
      autoPay: Boolean(bill.autoPay),
      categoryId: bill.categoryId,
    });
  }

  return dueBills;
}

async function processAutoPay(bill: BillDue) {
  try {
    // Process payment in transaction
    await db.transaction(async (tx: any) => {
      // 1. Fetch wallet inside transaction for OCC + race condition prevention
      const [wallet] = await tx
        .select()
        .from(wallets)
        .where(and(eq(wallets.userId, bill.userId as any), eq(wallets.isDefault, true)))
        .limit(1);

      if (!wallet) {
        console.log(`[Worker] Auto-pay skipped for "${bill.name}": no default wallet`);
        return;
      }

      // 2. Check balance with Decimal.js
      const balanceBefore = new Decimal(wallet.balance);
      const billAmount = new Decimal(bill.amount);
      if (balanceBefore.lt(billAmount)) {
        console.log(`[Worker] Auto-pay skipped for "${bill.name}": insufficient balance`);
        return;
      }

      const balanceAfter = balanceBefore.minus(billAmount);
      // 3. Create bill payment
      await tx.insert(billPayments).values({
        billId: bill.billId as any,
        userId: bill.userId as any,
        periodMonth: bill.periodMonth,
        amountPaid: bill.amount,
        note: "Tự động thanh toán",
        idempotencyKey: `autopay_${bill.billId}_${bill.periodMonth}`,
      });

      // 4. Create transaction
      const [autoTx] = await tx.insert(transactions).values({
        userId: bill.userId as any,
        walletId: wallet.id,
        categoryId: bill.categoryId,
        amount: bill.amount,
        type: "expense",
        note: `Thanh toán tự động: ${bill.name}`,
        displayDate: new Date().toISOString().split('T')[0],
        source: "recurring",
      }).returning();
      const newTxId = autoTx?.id ?? null;

      // 5. Deduct wallet balance (OCC)
      const updateResult = await tx
        .update(wallets)
        .set({
          balance: balanceAfter.toFixed(2),
          version: sql`version + 1`,
          updatedAt: new Date(),
        })
        .where(and(
          eq(wallets.id, wallet.id),
          eq(wallets.version, wallet.version ?? 0)
        ));

      if ((updateResult as any).rowCount === 0) {
        throw new Error("Xung đột cập nhật ví trong worker (OCC)");
      }

      // 6. Audit log
      await tx.insert(walletLogs).values({
        walletId: wallet.id as any,
        userId: bill.userId as any,
        transactionId: newTxId as any,
        balanceBefore: balanceBefore.toFixed(2),
        balanceAfter: balanceAfter.toFixed(2),
        difference: billAmount.negated().toFixed(2),
        note: `Tự động thanh toán: ${bill.name}`,
        idempotencyKey: `autopay_log_${bill.billId}_${bill.periodMonth}`,
      });
    });

    console.log(`[Worker] Auto-paid "${bill.name}" — ${bill.amount} ₫`);
  } catch (err: any) {
    // Duplicate idempotency key = already processed, safe to ignore
    if (err.message?.includes("23505") || err.message?.includes("Duplicate") || err.message?.includes("unique constraint")) {
      console.log(`[Worker] Auto-pay for "${bill.name}" already processed (idempotent)`);
      return;
    }
    console.error(`[Worker] Auto-pay failed for "${bill.name}":`, err.message);
  }
}

async function runDailyCheck() {
  const start = Date.now();
  console.log(`[Worker] Running daily check — ${new Date().toISOString()}`);

  try {
    const dueBills = await findDueBills();
    console.log(`[Worker] Found ${dueBills.length} bills due today`);

    for (const bill of dueBills) {
      console.log(`[Worker] Due: "${bill.name}" — ${bill.amount} ₫ (period: ${bill.periodMonth})${bill.autoPay ? " [AUTO-PAY]" : ""}`);

      if (bill.autoPay) {
        await processAutoPay(bill);
      }
      // Phase 20: create notification for non-auto-pay bills
    }
  } catch (err) {
    console.error("[Worker] Daily check error:", err);
  }

  const duration = Date.now() - start;
  console.log(`[Worker] Daily check completed in ${duration}ms`);
}

// ── Main Loop ──────────────────────────────────────────────────────────

console.log("[Worker] Recurring Bills Processor started");
console.log(`[Worker] Check interval: ${CHECK_INTERVAL_MS / 1000 / 60} minutes`);

// Run immediately on startup
runDailyCheck();

// Then run on interval
setInterval(runDailyCheck, CHECK_INTERVAL_MS);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[Worker] SIGTERM received. Shutting down...");
  process.exit(0);
});
