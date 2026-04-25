import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../../../.env.local");
dotenv.config({ path: envPath });

import { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../schema/index";
import { db, users, userSettings, cashWallet, categories, transactions, bills, goals } from "../index";
import { eq } from "drizzle-orm";

const typedDb = db as unknown as MySql2Database<typeof schema>;

async function seed() {
  console.log("🌱 Seeding Demo User...");

  const email = "demouser@gmail.com";
  const passwordHash = "adc7e5451f44847766d34dd4e86d85f3:b173add1200aca979e727fda687c86e774ea347195e9b5be0133535b586ab409"; // Valid PBKDF2 hash for 'password123'
  
  // 1. Create User
  let [user] = await typedDb.select().from(users).where(eq(users.email, email));
  
  if (!user) {
    console.log("Creating demouser...");
    const [result] = await typedDb.insert(users).values({
      email,
      username: "demouser",
      fullName: "Demo User",
      passwordHash,
    });
    const insertId = result.insertId;
    [user] = await typedDb.select().from(users).where(eq(users.id, String(insertId)));
  } else {
    console.log("Demo user exists, updating password hash...");
    await typedDb.update(users).set({ passwordHash }).where(eq(users.id, user.id));
  }

  if (!user) throw new Error("User creation failed");
  const userId = user.id;

  // 2. Settings & Wallet
  console.log("Seeding settings & wallet...");
  await typedDb.insert(userSettings).values({
    userId: userId,
    monthlyBudget: "25000000",
    emergencyBuffer: "1500000",
    incomeDate: 5,
    currency: "VND",
  }).onDuplicateKeyUpdate({ set: { monthlyBudget: "25000000" } });

  await typedDb.insert(cashWallet).values({
    userId: userId,
    initialBalance: "1500000",
    balance: "1500000",
  }).onDuplicateKeyUpdate({ set: { balance: "1500000" } });

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
    await typedDb.insert(categories).values({
      userId: userId,
      ...cat,
    }).onDuplicateKeyUpdate({ set: { icon: cat.icon } });
  }

  const dbCategories = await typedDb.select().from(categories).where(eq(categories.userId, userId));
  const catMap = Object.fromEntries(dbCategories.map(c => [c.name, c.id]));

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
  await typedDb.delete(transactions).where(eq(transactions.userId, userId));

  for (const tx of mockTransactions) {
    await typedDb.insert(transactions).values({
      userId: userId,
      categoryId: catMap[tx.category] || catMap["Khác"],
      amount: tx.amount,
      type: tx.type,
      note: tx.note,
      displayDate: tx.date,
    });
  }

  // 5. Bills
  console.log("Seeding bills...");
  const mockBills = [
    { name: "Tiền trọ", amount: "5000000", dueDay: 5, category: "Nhà Ở", icon: "🏠" },
    { name: "Điện nước", amount: "450000", dueDay: 10, category: "Nhà Ở", icon: "💡" },
    { name: "Internet FPT", amount: "180000", dueDay: 15, category: "Khác", icon: "📶" },
  ];

  await typedDb.delete(bills).where(eq(bills.userId, userId));
  for (const bill of mockBills) {
    await typedDb.insert(bills).values({
      userId: userId,
      categoryId: catMap[bill.category] || catMap["Khác"],
      name: bill.name,
      amount: bill.amount,
      dueDay: bill.dueDay,
      icon: bill.icon,
    });
  }

  // 6. Goals
  console.log("Seeding goals...");
  const mockGoals = [
    { name: "Mua iPhone 16 Pro", targetAmount: "25000000", currentSaved: "8500000", monthlyContribution: "2000000", icon: "📱", deadline: "2026-12-31" },
    { name: "Du lịch Nhật Bản", targetAmount: "20000000", currentSaved: "12000000", monthlyContribution: "3000000", icon: "✈️", deadline: "2026-06-30" },
  ];

  await typedDb.delete(goals).where(eq(goals.userId, userId));
  for (const goal of mockGoals) {
    await typedDb.insert(goals).values({
      userId: userId,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentSaved: goal.currentSaved,
      monthlyContribution: goal.monthlyContribution,
      icon: goal.icon,
      deadline: goal.deadline,
    });
  }

  console.log("✅ Seeding completed!");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
