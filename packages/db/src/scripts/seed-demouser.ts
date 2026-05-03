import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../../../.env.local");
dotenv.config({ path: envPath });

import { db, users, userSettings, wallets, categories, transactions, bills, goals } from "../index";
import { eq, and } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding Demo User...");

  const email = "demouser@gmail.com";
  const passwordHash = "adc7e5451f44847766d34dd4e86d85f3:b173add1200aca979e727fda687c86e774ea347195e9b5be0133535b586ab409"; // Valid PBKDF2 hash for 'password123'

  // 1. Create User (PostgreSQL uses returning() instead of insertId)
  const existingUsers = await db.select().from(users).where(eq(users.email, email));
  let user = existingUsers[0];

  if (!user) {
    console.log("Creating demouser...");
    const [newUser] = await db.insert(users).values({
      email,
      username: "demouser",
      fullName: "Demo User",
      passwordHash,
    }).returning();
    user = newUser;
  } else {
    console.log("Demo user exists, updating password hash...");
    await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));
  }

  if (!user) throw new Error("User creation failed");
  const userId = user.id;

  // 2. Settings & Wallet (PG: use ON CONFLICT DO UPDATE via onConflictDoUpdate)
  console.log("Seeding settings & wallet...");
  await db.insert(userSettings).values({
    userId: userId,
    monthlyBudget: "25000000",
    emergencyBuffer: "1500000",
    incomeDate: 5,
    currency: "VND",
  }).onConflictDoUpdate({
    target: userSettings.userId,
    set: { monthlyBudget: "25000000" }
  });

  // Delete existing default wallet, then insert fresh
  await db.delete(wallets).where(
    and(eq(wallets.userId, userId), eq(wallets.name, "Ví Tiền Mặt"))
  );
  await db.insert(wallets).values({
    userId: userId,
    name: "Ví Tiền Mặt",
    type: "cash" as const,
    initialBalance: "1500000",
    balance: "1500000",
    isDefault: true,
    icon: "💵",
  });

  // Get wallet id for transactions
  const [defaultWallet] = await db.select({ id: wallets.id }).from(wallets)
    .where(eq(wallets.userId, userId as any)).limit(1);
  const walletId = defaultWallet?.id;

  // 3. Categories
  console.log("Seeding categories...");
  const mockCategories = [
    { name: "Thu Nhập", icon: "💰", color: "#10B981", type: "income" as const },
    { name: "Ăn Uống", icon: "🍔", color: "#F59E0B", type: "expense" as const },
    { name: "Đồ Uống", icon: "🥤", color: "#3B82F6", type: "expense" as const },
    { name: "Di Chuyển", icon: "🚗", color: "#EAB308", type: "expense" as const },
    { name: "Nhà Ở", icon: "🏠", color: "#8B5CF6", type: "expense" as const },
    { name: "Tiết Kiệm", icon: "🏦", color: "#10B981", type: "expense" as const },
    { name: "Khác", icon: "📦", color: "#6B7280", type: "expense" as const },
  ];

  for (const cat of mockCategories) {
    const existingCats = await db.select().from(categories)
      .where(eq(categories.name, cat.name));
    if (existingCats.length === 0) {
      await db.insert(categories).values({
        userId: userId,
        ...cat,
      } as any);
    }
  }

  const dbCategories = await db.select().from(categories).where(eq(categories.userId, userId));
  const catMap: Record<string, number> = {};
  for (const c of dbCategories) {
    catMap[c.name] = c.id;
  }

  // 4. Transactions
  console.log("Seeding transactions...");
  const mockTransactions = [
    { category: "Thu Nhập", note: "Lương tháng 4", amount: "25000000", type: "income" as const, date: "2026-04-01" },
    { category: "Đồ Uống", note: "Cafe sáng", amount: "35000", type: "expense" as const, date: "2026-04-01" },
    { category: "Ăn Uống", note: "Ăn trưa văn phòng", amount: "55000", type: "expense" as const, date: "2026-04-01" },
    { category: "Di Chuyển", note: "Grab đi làm", amount: "45000", type: "expense" as const, date: "2026-04-01" },
    { category: "Ăn Uống", note: "Siêu thị VinMart", amount: "285000", type: "expense" as const, date: "2026-03-31" },
    { category: "Đồ Uống", note: "Trà sữa Gong Cha", amount: "65000", type: "expense" as const, date: "2026-03-31" },
    { category: "Tiết Kiệm", note: "Tiết kiệm iPhone", amount: "2000000", type: "expense" as const, date: "2026-03-30" },
    { category: "Tiết Kiệm", note: "Tiết kiệm Du lịch Nhật", amount: "3000000", type: "expense" as const, date: "2026-03-30" },
  ];

  // Clear old transactions to avoid duplicates for this demo
  await db.delete(transactions).where(eq(transactions.userId, userId));

  for (const tx of mockTransactions) {
    await db.insert(transactions).values({
      userId: userId,
      walletId: walletId,
      categoryId: catMap[tx.category] || catMap["Khác"],
      amount: tx.amount,
      type: tx.type,
      note: tx.note,
      displayDate: tx.date,
    } as any);
  }

  // 5. Bills
  console.log("Seeding bills...");
  const mockBills = [
    { name: "Tiền trọ", amount: "5000000", dueDay: 5, category: "Nhà Ở", icon: "🏠" },
    { name: "Điện nước", amount: "450000", dueDay: 10, category: "Nhà Ở", icon: "💡" },
    { name: "Internet FPT", amount: "180000", dueDay: 15, category: "Khác", icon: "📶" },
  ];

  await db.delete(bills).where(eq(bills.userId, userId));
  for (const bill of mockBills) {
    await db.insert(bills).values({
      userId: userId,
      categoryId: catMap[bill.category] || catMap["Khác"],
      name: bill.name,
      amount: bill.amount,
      dueDay: bill.dueDay,
      icon: bill.icon,
    } as any);
  }

  // 6. Goals
  console.log("Seeding goals...");
  const mockGoals = [
    { name: "Mua iPhone 16 Pro", targetAmount: "25000000", currentSaved: "8500000", monthlyContribution: "2000000", icon: "📱", deadline: "2026-12-31" },
    { name: "Du lịch Nhật Bản", targetAmount: "20000000", currentSaved: "12000000", monthlyContribution: "3000000", icon: "✈️", deadline: "2026-06-30" },
  ];

  await db.delete(goals).where(eq(goals.userId, userId));
  for (const goal of mockGoals) {
    await db.insert(goals).values({
      userId: userId,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentSaved: goal.currentSaved,
      monthlyContribution: goal.monthlyContribution,
      icon: goal.icon,
      deadline: goal.deadline,
    } as any);
  }

  console.log("✅ Seeding completed!");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
