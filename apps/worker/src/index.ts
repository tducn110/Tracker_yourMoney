import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

// ── ENVIRONMENT INITIALIZATION ──────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, "../../../");

if (process.env.NODE_ENV !== "production") {
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

import { db, bills, billPayments, transactions, wallets, categories } from "@finance/db";
import { eq, and, sql } from "drizzle-orm";

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Every hour
const AUTO_PAY_WALLET_ID = "1"; // Default wallet for auto-pay (configurable later)

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

    const totalPaid = parseFloat(payments[0]?.total || "0");
    if (totalPaid >= parseFloat(bill.amount)) continue; // Already fully paid

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
    // Find user's default wallet
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, bill.userId as any), eq(wallets.isDefault, true)))
      .limit(1);

    if (!wallet) {
      console.log(`[Worker] Auto-pay skipped for "${bill.name}": no default wallet`);
      return;
    }

    // Check balance
    if (parseFloat(wallet.balance) < parseFloat(bill.amount)) {
      console.log(`[Worker] Auto-pay skipped for "${bill.name}": insufficient balance`);
      return;
    }

    // Process payment in transaction
    await db.transaction(async (tx: any) => {
      // Create bill payment
      await tx.insert(billPayments).values({
        billId: bill.billId as any,
        userId: bill.userId as any,
        periodMonth: bill.periodMonth,
        amountPaid: bill.amount,
        note: "Tự động thanh toán",
        idempotencyKey: `autopay_${bill.billId}_${bill.periodMonth}`,
      });

      // Create transaction
      await tx.insert(transactions).values({
        userId: bill.userId as any,
        walletId: wallet.id,
        categoryId: bill.categoryId,
        amount: bill.amount,
        type: "expense",
        note: `Thanh toán tự động: ${bill.name}`,
        displayDate: new Date().toISOString().split("T")[0],
        source: "recurring",
      });

      // Deduct wallet balance
      await tx
        .update(wallets)
        .set({
          balance: String(parseFloat(wallet.balance) - parseFloat(bill.amount)),
        })
        .where(eq(wallets.id, wallet.id));
    });

    console.log(`[Worker] Auto-paid "${bill.name}" — ${bill.amount} ₫`);
  } catch (err: any) {
    // Duplicate idempotency key = already processed, safe to ignore
    if (err.message?.includes("ER_DUP_ENTRY") || err.message?.includes("Duplicate")) {
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
