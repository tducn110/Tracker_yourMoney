// apps/api/src/routes/user.ts
// User profile & settings routes
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "../lib/validator";
import { db, userSettings, users, wallets, categories, transactions } from "@finance/db";
import { and, desc, eq } from "@finance/db";
import { updateProfileSchema } from "@finance/shared-schemas";
import { ok, err } from "../lib/response";

const onboardingCompleteSchema = z.object({
  seedSamplePack: z.boolean().default(false),
});

const DEFAULT_CATEGORIES = [
  { name: "Thu Nhập", icon: "💰", color: "#10B981", type: "income" as const, sortOrder: 1 },
  { name: "Ăn Uống", icon: "🍜", color: "#F59E0B", type: "expense" as const, sortOrder: 2 },
  { name: "Di Chuyển", icon: "🚗", color: "#EAB308", type: "expense" as const, sortOrder: 3 },
  { name: "Mua Sắm", icon: "🛍️", color: "#EC4899", type: "expense" as const, sortOrder: 4 },
  { name: "Nhà Ở", icon: "🏠", color: "#8B5CF6", type: "expense" as const, sortOrder: 5 },
  { name: "Hóa Đơn", icon: "📄", color: "#6B7280", type: "expense" as const, sortOrder: 6 },
  { name: "Giải Trí", icon: "🎬", color: "#EF4444", type: "expense" as const, sortOrder: 7 },
  { name: "Sức Khỏe", icon: "💊", color: "#10B981", type: "expense" as const, sortOrder: 8 },
  { name: "Giáo Dục", icon: "📚", color: "#6366F1", type: "expense" as const, sortOrder: 9 },
  { name: "Tiết Kiệm", icon: "🏦", color: "#14B8A6", type: "both" as const, sortOrder: 10 },
  { name: "Khác", icon: "📦", color: "#6B7280", type: "expense" as const, sortOrder: 99 },
];

const SAMPLE_TRANSACTIONS = [
  { categoryName: "Thu Nhập", amount: "12000000", type: "income" as const, note: "Thu nhập khởi tạo" },
  { categoryName: "Ăn Uống", amount: "180000", type: "expense" as const, note: "Bữa ăn đầu tiên" },
];

async function getOrCreateUserSettings(userId: string) {
  const [existing] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId as any))
    .limit(1);

  if (existing) return existing;

  await db.insert(userSettings).values({ userId: userId as any });

  const [created] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId as any))
    .limit(1);

  return created!;
}

async function getDefaultWallet(userId: string) {
  const [wallet] = await db
    .select({
      id: wallets.id,
      name: wallets.name,
      type: wallets.type,
      balance: wallets.balance,
      isDefault: wallets.isDefault,
    })
    .from(wallets)
    .where(eq(wallets.userId, userId as any))
    .orderBy(desc(wallets.isDefault))
    .limit(1);

  return wallet ?? null;
}

async function ensureDefaultCategories(userId: string) {
  const existing = await db
    .select({ name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId as any))
  const existingNames = new Set(existing.map((category) => category.name));
  const missingCategories = DEFAULT_CATEGORIES.filter((category) => !existingNames.has(category.name));

  if (missingCategories.length === 0) return;

  await db.insert(categories).values(
    missingCategories.map((category) => ({ userId, ...category }))
  );
}

async function seedSamplePackIfNeeded(userId: string, walletId: string) {
  const [existingTransaction] = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(eq(transactions.userId, userId as any))
    .limit(1);

  if (existingTransaction) return false;

  await ensureDefaultCategories(userId);

  for (const sample of SAMPLE_TRANSACTIONS) {
    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.userId, userId as any),
          eq(categories.name, sample.categoryName),
        ),
      )
      .limit(1);

    if (!category) continue;

    await db.insert(transactions).values({
      userId: userId as any,
      walletId: walletId as any,
      categoryId: category.id,
      amount: sample.amount,
      type: sample.type,
      note: sample.note,
      displayDate: new Date().toISOString().slice(0, 10),
      source: "manual",
    } as any);
  }

  return true;
}

export const userRoutes = new Hono<{ Variables: { userId: string } }>()
  // GET /api/v1/user/settings
  .get("/settings", async (c) => {
    const userId = c.get("userId");
    const row = await getOrCreateUserSettings(userId);
    return ok(c, row);
  })
  // PUT /api/v1/user/profile
  .put("/profile", zValidator("json", updateProfileSchema), async (c) => {
    const userId = c.get("userId");
    const updates = c.req.valid("json");

    if (!updates.fullName && !updates.avatarText) {
      return err(c, 400, "NO_FIELDS", "Không có trường nào để cập nhật");
    }

    await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId as any));

    const [profile] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        username: users.username,
        avatarUrl: users.avatarUrl,
        avatarText: users.avatarText,
        hasOnboarded: users.hasOnboarded,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId as any))
      .limit(1);

    return ok(c, profile);
  })
  // PUT /api/v1/user/settings
  .put("/settings", async (c) => {
    const userId = c.get("userId");
    const body = await c.req.json();

    // Only allow whitelisted fields
    const allowed = [
      "monthlyBudget", "emergencyBuffer", "incomeDate",
      "currency", "language", "timezone", "theme",
      "notifyBillBeforeDays", "notifyBudgetThreshold",
      "notifyEmail", "notifyPush",
    ];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }
    if (Object.keys(updates).length === 0) {
      return err(c, 400, "NO_FIELDS", "Không có trường nào để cập nhật");
    }

    // Upsert
    const [existing] = await db
      .select({ userId: userSettings.userId })
      .from(userSettings)
      .where(eq(userSettings.userId, userId as any))
      .limit(1);

    if (existing) {
      await db
        .update(userSettings)
        .set(updates)
        .where(eq(userSettings.userId, userId as any));
    } else {
      await db.insert(userSettings).values({ userId: userId as any, ...updates });
    }

    const [row] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId as any))
      .limit(1);

    return ok(c, row);
  })
  // GET /api/v1/user/onboarding/status
  .get("/onboarding/status", async (c) => {
    const userId = c.get("userId");
    const [profile] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        username: users.username,
        avatarUrl: users.avatarUrl,
        hasOnboarded: users.hasOnboarded,
        onboardingCompletedAt: users.onboardingCompletedAt,
      })
      .from(users)
      .where(eq(users.id, userId as any))
      .limit(1);

    if (!profile) {
      return err(c, 404, "NOT_FOUND", "Không tìm thấy người dùng");
    }

    const settings = await getOrCreateUserSettings(userId);
    const wallet = await getDefaultWallet(userId);

    return ok(c, {
      hasOnboarded: profile.hasOnboarded,
      canSkipToApp: profile.hasOnboarded,
      profile: {
        id: String(profile.id),
        email: profile.email,
        fullName: profile.fullName,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
      },
      walletSummary: wallet,
      settingsSummary: {
        monthlyBudget: settings.monthlyBudget,
        emergencyBuffer: settings.emergencyBuffer,
        incomeDate: settings.incomeDate,
        currency: settings.currency,
      },
    });
  })
  // POST /api/v1/user/onboarding/complete
  .post("/onboarding/complete", zValidator("json", onboardingCompleteSchema), async (c) => {
    const userId = c.get("userId");
    const { seedSamplePack } = c.req.valid("json");

    const [profile] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        hasOnboarded: users.hasOnboarded,
      })
      .from(users)
      .where(eq(users.id, userId as any))
      .limit(1);

    if (!profile) {
      return err(c, 404, "NOT_FOUND", "Không tìm thấy người dùng");
    }

    if (!profile.fullName.trim()) {
      return err(c, 400, "PROFILE_INCOMPLETE", "Vui lòng cập nhật tên hiển thị trước khi hoàn tất");
    }

    await getOrCreateUserSettings(userId);

    const wallet = await getDefaultWallet(userId);
    if (!wallet) {
      return err(c, 400, "WALLET_REQUIRED", "Vui lòng tạo ví đầu tiên trước khi hoàn tất");
    }

    const samplePackSeeded = seedSamplePack ? await seedSamplePackIfNeeded(userId, String(wallet.id)) : false;

    await db
      .update(users)
      .set({
        hasOnboarded: true,
        onboardingCompletedAt: new Date(),
      })
      .where(eq(users.id, userId as any));

    return ok(c, {
      success: true,
      hasOnboarded: true,
      samplePackSeeded,
    });
  });
