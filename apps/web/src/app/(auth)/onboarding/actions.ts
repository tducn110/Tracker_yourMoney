"use server";

import { db, users, wallets, goals, budgets, transactions, categories } from "@finance/db";
import { eq, and } from "@finance/db";

/* ── Dev shortcut ──────────────────────────────────────────────── */

const DEV = process.env.NODE_ENV === "development";

/**
 * Onboarding Step 1: Save personal info.
 */
export async function savePersonalInfo(data: { fullName: string }) {
  if (DEV) {
    await new Promise((r) => setTimeout(r, 200));
    return { success: true };
  }
  const userId = await getUserId();
  await db.update(users).set({ fullName: data.fullName }).where(eq(users.id, userId as any));
  return { success: true };
}

/**
 * Onboarding Step 2: Create an initial wallet.
 */
export async function setupWallet(data: {
  name: string;
  balance: number;
  type?: "cash" | "bank" | "credit" | "e_wallet" | "investment" | "other";
}) {
  if (DEV) {
    await new Promise((r) => setTimeout(r, 200));
    return { success: true, walletId: "dev-wallet-1" };
  }
  const userId = await getUserId();
  const [wallet] = await db.insert(wallets).values({
    userId: userId as any,
    name: data.name,
    type: data.type ?? "cash",
    balance: String(data.balance),
    initialBalance: String(data.balance),
    isDefault: true,
  } as any).returning();
  return { success: true, walletId: String(wallet!.id) };
}

/**
 * Onboarding Step 3: Create a first budget.
 */
export async function saveBudget(data: {
  name: string;
  targetAmount: number;
  periodType?: "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
}) {
  if (DEV) {
    await new Promise((r) => setTimeout(r, 200));
    return { success: true };
  }
  const userId = await getUserId();
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  await db.insert(budgets).values({
    userId: userId as any,
    name: data.name,
    targetAmount: String(data.targetAmount),
    periodType: data.periodType ?? "monthly",
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
    isAllCategories: true,
    status: "active",
  } as any);

  return { success: true };
}

/**
 * Onboarding Step 4: Create a sample transaction.
 */
export async function saveTransaction(data: {
  walletId: string;
  type: "income" | "expense";
  amount: number;
  note: string;
  displayDate?: string;
}) {
  if (DEV) {
    await new Promise((r) => setTimeout(r, 200));
    return { success: true };
  }

  const userId = await getUserId();
  const today = data.displayDate ?? new Date().toISOString().slice(0, 10);

  // Find the matching system category by type
  const categoryName = data.type === "income" ? "Thu Nhập" : "Khác";
  const [cat] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId as any),
        eq(categories.name, categoryName),
      ),
    )
    .limit(1);

  await db.insert(transactions).values({
    userId: userId as any,
    walletId: data.walletId as any,
    categoryId: cat?.id ?? 1,
    amount: String(data.amount),
    type: data.type,
    note: data.note,
    displayDate: today,
    source: "manual",
  } as any);

  return { success: true };
}

/**
 * Complete onboarding — mark user as onboarded.
 */
export async function completeOnboarding() {
  if (DEV) {
    await new Promise((r) => setTimeout(r, 200));
    return { success: true };
  }
  const userId = await getUserId();
  await db.update(users).set({
    hasOnboarded: true,
    onboardingCompletedAt: new Date(),
  }).where(eq(users.id, userId as any));
  return { success: true };
}

/* ── Internal helpers ──────────────────────────────────────────── */

async function getUserId(): Promise<string> {
  if (DEV) return "1";
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) throw new Error("UNAUTHORIZED");

  const API_BASE = process.env.INTERNAL_API_URL ?? "http://localhost:3001";
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Cookie: `session=${sessionCookie}` },
  });
  if (!res.ok) throw new Error("UNAUTHORIZED");
  const body = await res.json();
  return body.data.id;
}
