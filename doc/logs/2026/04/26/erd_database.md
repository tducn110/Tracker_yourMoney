# Database Schema (Drizzle)

## File: `packages/db/src/schema/_helpers.ts`

```typescript
// packages/db/src/schema/_helpers.ts
import { customType } from "drizzle-orm/mysql-core";

/**
 * [FIX #4] BigInt Safe ID Helper
 * 
 * MySQL BigInt columns in Drizzle for MySQL/TiDB only support 'number' or 'bigint' modes natively.
 * To prevent precision loss (> 2^53) while maintaining JSON serializability, we use a custom type
 * that maps the driver's BigInt value to a JS string.
 */
export const bigintSafe = (name: string) => customType<{ data: string; driverData: bigint | number | string }>({
  dataType() {
    return "bigint unsigned";
  },
  // From DB to JS
  fromDriver(value: bigint | number | string): string {
    return String(value);
  },
  // From JS to DB
  toDriver(value: string): string {
    return value;
  },
})(name);

```

## File: `packages/db/src/schema/auth.ts`

```typescript
// packages/db/src/schema/auth.ts
// TABLE 2: user_settings — Cấu hình tài chính cá nhân (1:1 với users)
// TABLE 3: refresh_tokens — JWT refresh token management
import {
  bigint, varchar, tinyint, timestamp, decimal, mysqlTable, index, mysqlEnum,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

// ── TABLE 2: user_settings ──────────────────────────────────────
export const userSettings = mysqlTable("user_settings", {
  userId:               bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>().primaryKey()
                          .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  monthlyBudget:        decimal("monthly_budget", { precision: 15, scale: 2 }).notNull().default("0.00"),
  emergencyBuffer:      decimal("emergency_buffer", { precision: 15, scale: 2 }).notNull().default("0.00"),
  incomeDate:           tinyint("income_date").notNull().default(1), // 1-31
  currency:             varchar("currency", { length: 10 }).notNull().default("VND"),
  language:             varchar("language", { length: 10 }).notNull().default("vi"),
  timezone:             varchar("timezone", { length: 50 }).notNull().default("Asia/Ho_Chi_Minh"),
  theme:                mysqlEnum("theme", ["light", "dark", "system"]).notNull().default("light"),
  notifyBillBeforeDays: tinyint("notify_bill_before_days").notNull().default(3),
  notifyBudgetThreshold:decimal("notify_budget_threshold", { precision: 5, scale: 2 }).notNull().default("80.00"),
  notifyEmail:          tinyint("notify_email").notNull().default(1),
  notifyPush:           tinyint("notify_push").notNull().default(1),
  createdAt:            timestamp("created_at").notNull().defaultNow(),
  updatedAt:            timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type UserSetting    = typeof userSettings.$inferSelect;
export type NewUserSetting = typeof userSettings.$inferInsert;

// ── TABLE 3: refresh_tokens ─────────────────────────────────────
export const refreshTokens = mysqlTable("refresh_tokens", {
  id:         bigint("id", { mode: "bigint", unsigned: true }).$type<string>().autoincrement().primaryKey(),
  userId:     bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>().notNull()
                .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  tokenHash:  varchar("token_hash", { length: 255 }).notNull().unique(),
  deviceInfo: varchar("device_info", { length: 255 }),
  ipAddress:  varchar("ip_address", { length: 45 }),
  expiresAt:  timestamp("expires_at").notNull(),
  revokedAt:  timestamp("revoked_at"),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx:   index("idx_refresh_token_user").on(table.userId),
  hashIdx:   index("idx_refresh_token_hash").on(table.tokenHash),
  expiryIdx: index("idx_refresh_token_expiry").on(table.expiresAt),
}));

export type RefreshToken    = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;

```

## File: `packages/db/src/schema/bills.ts`

```typescript
// packages/db/src/schema/bills.ts
// TABLE 6: bills — Hóa đơn cố định định kỳ
// TABLE 7: bill_payments — Lịch sử thanh toán
//
// [FIX #3] KHÔNG có UNIQUE KEY trên (bill_id, period_month)
//   → Mỗi row = 1 payment event thực tế (partial payments OK)
//   → Trạng thái tính tại API: SUM(amount_paid) WHERE bill_id + period_month
// [FIX #4] bigint mode: "bigint" — TiDB precision safety
import {
  bigint, int, decimal, varchar, tinyint, timestamp, char, text,
  mysqlTable, mysqlEnum, index, check,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { categories } from "./categories";

// ── TABLE 6: bills ──────────────────────────────────────────────
export const bills = mysqlTable("bills", {
  id:         bigint("id", { mode: "bigint", unsigned: true }).$type<string>().autoincrement().primaryKey(),
  userId:     bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>().notNull()
                .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  categoryId: int("category_id", { unsigned: true }).notNull()
                .references(() => categories.id, { onDelete: "restrict", onUpdate: "cascade" }),
  name:       varchar("name", { length: 100 }).notNull(),
  icon:       varchar("icon", { length: 20 }).notNull().default("📄"),
  amount:     decimal("amount", { precision: 15, scale: 2 }).notNull(),
  dueDay:     tinyint("due_day").notNull(), // 1-31
  frequency:  mysqlEnum("frequency", ["monthly", "quarterly", "yearly"]).notNull().default("monthly"),
  autoPay:    tinyint("auto_pay").notNull().default(0),
  isActive:   tinyint("is_active").notNull().default(1),
  notes:      text("notes"),
  deletedAt:  timestamp("deleted_at"),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
  updatedAt:  timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
}, (table) => ({
  userIdx:       index("idx_bills_user").on(table.userId, table.isActive),
  userDueDayIdx: index("idx_bills_user_dueday").on(table.userId, table.dueDay),
  deletedIdx:    index("idx_bills_deleted").on(table.deletedAt),
  amountCheck:   check("chk_bills_amount_positive", sql`amount > 0`),
  dueDayCheck:   check("chk_bills_due_day", sql`due_day BETWEEN 1 AND 31`),
}));

export type Bill    = typeof bills.$inferSelect;
export type NewBill = typeof bills.$inferInsert;

// ── TABLE 7: bill_payments ──────────────────────────────────────
// [FIX #3] NO unique constraint on (bill_id, period_month)
// Mỗi row = 1 payment event. UI tính status qua SUM tại API layer.
export const billPayments = mysqlTable("bill_payments", {
  id:          bigint("id", { mode: "bigint", unsigned: true }).$type<string>().autoincrement().primaryKey(),
  billId:      bigint("bill_id", { mode: "bigint", unsigned: true }).$type<string>().notNull()
                 .references(() => bills.id, { onDelete: "cascade", onUpdate: "cascade" }),
  userId:      bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>().notNull()
                 .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  // YYYY-MM format, e.g. "2026-04"
  periodMonth: char("period_month", { length: 7 }).notNull(),
  // amountPaid NOT NULL — mỗi row là 1 payment event thực tế
  amountPaid:  decimal("amount_paid", { precision: 15, scale: 2 }).notNull(),
  paidAt:      timestamp("paid_at").notNull().defaultNow(),
  note:        varchar("note", { length: 255 }),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  // NO updatedAt — payment events are immutable once recorded
}, (table) => ({
  userPeriodIdx:  index("idx_bill_payments_user").on(table.userId, table.periodMonth),
  // [FIX #3] Index thay vì UNIQUE → SUM query vẫn nhanh, nhưng N events/kỳ được phép
  billPeriodIdx:  index("idx_bill_payments_bill_period").on(table.billId, table.periodMonth),
  amountCheck:    check("chk_bill_payment_positive", sql`amount_paid > 0`),
}));

export type BillPayment    = typeof billPayments.$inferSelect;
export type NewBillPayment = typeof billPayments.$inferInsert;

// Tính trạng thái thanh toán tại apps/api/services/bill-service.ts:
// const total = SUM(amountPaid) WHERE billId=? AND periodMonth=?
// status = total >= bill.amount ? "paid" : total > 0 ? "partial" : "pending"

```

## File: `packages/db/src/schema/budgets.ts`

```typescript
import { mysqlTable, bigint, int, varchar, decimal, date, timestamp, mysqlEnum, tinyint, index } from "drizzle-orm/mysql-core";
import { users } from "./users";
import { categories } from "./categories";

export const budgets = mysqlTable(
  "budgets",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement().$type<string>(),
    userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }).$type<string>(),
    name: varchar("name", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 20 }).default("💰").notNull(),
    targetAmount: decimal("target_amount", { precision: 15, scale: 2 }).notNull(),
    periodType: mysqlEnum("period_type", ["weekly", "monthly", "quarterly", "yearly", "custom"]).default("monthly").notNull(),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }).notNull(),
    isAllCategories: tinyint("is_all_categories").default(0).notNull(),
    walletScope: mysqlEnum("wallet_scope", ["all", "specific"]).default("all").notNull(),
    status: mysqlEnum("status", ["active", "finished"]).default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userIdStatusIdx: index("idx_budgets_user_status").on(table.userId, table.status, table.deletedAt),
    userIdPeriodIdx: index("idx_budgets_user_period").on(table.userId, table.startDate, table.endDate),
  })
);

export const budgetCategories = mysqlTable(
  "budget_categories",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement().$type<string>(),
    budgetId: bigint("budget_id", { mode: "number" }).notNull().references(() => budgets.id, { onDelete: "cascade", onUpdate: "cascade" }).$type<string>(),
    categoryId: int("category_id").notNull().references(() => categories.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => ({
    budgetCategoriesIdx: index("idx_budget_categories").on(table.budgetId, table.categoryId),
    budgetCategoryUq: index("uq_budget_category").on(table.budgetId, table.categoryId),
  })
);

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type NewBudgetCategory = typeof budgetCategories.$inferInsert;

```

## File: `packages/db/src/schema/categories.ts`

```typescript
// packages/db/src/schema/categories.ts
// TABLE 4: categories — Danh mục thu/chi (system global + user custom)
// user_id = NULL → system category (global cho tất cả users)
// user_id = có giá trị → user-defined category
import {
  bigint, int, varchar, tinyint, timestamp, mysqlTable, index, uniqueIndex, mysqlEnum,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

export const categories = mysqlTable("categories", {
  id:        int("id", { unsigned: true }).autoincrement().primaryKey(),
  // nullable: NULL = system category, value = user category
  userId:    bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>()
               .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  name:      varchar("name", { length: 50 }).notNull(),
  type:      mysqlEnum("type", ["income", "expense", "both"]).notNull().default("expense"),
  icon:      varchar("icon", { length: 20 }).notNull().default("📦"),
  color:     varchar("color", { length: 7 }).notNull().default("#6B7280"),
  isDefault: tinyint("is_default").notNull().default(0),
  sortOrder: int("sort_order").notNull().default(0),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  // Unique: same user cannot have two categories with same name
  nameUserUq: uniqueIndex("uq_category_name_user").on(table.userId, table.name),
  userIdx:    index("idx_categories_user").on(table.userId),
  typeIdx:    index("idx_categories_type").on(table.type),
}));

export type Category    = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

```

## File: `packages/db/src/schema/extensions.ts`

```typescript
// packages/db/src/schema/extensions.ts
// TABLE 11: notifications — Thông báo hệ thống (Phase 2)
// TABLE 12: audit_logs — Ghi log thao tác quan trọng (Phase 2)
//
// Schema được định nghĩa sẵn để sử dụng khi cần.
// Insert thực hiện bởi service layer — KHÔNG dùng Triggers.
import {
  bigint, varchar, tinyint, timestamp, text, json,
  mysqlTable, mysqlEnum, index,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

// ── TABLE 11: notifications ──────────────────────────────────────
// Insert thực hiện bởi notification-service.ts — KHÔNG dùng Trigger
export const notifications = mysqlTable("notifications", {
  id:        bigint("id", { mode: "bigint", unsigned: true }).$type<string>().autoincrement().primaryKey(),
  userId:    bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>().notNull()
               .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  type:      mysqlEnum("type", [
               "bill_due", "bill_overdue", "budget_warning", "budget_exceeded",
               "goal_completed", "goal_milestone", "low_balance",
               "budget_negative", "system", "tip",
             ]).notNull(),
  title:     varchar("title", { length: 150 }).notNull(),
  body:      text("body").notNull(),
  icon:      varchar("icon", { length: 20 }).notNull().default("🔔"),
  actionUrl: varchar("action_url", { length: 255 }),
  isRead:    tinyint("is_read").notNull().default(0),
  readAt:    timestamp("read_at"),
  expiresAt: timestamp("expires_at"),
  // Extra context: bill_id, goal_id, etc.
  metadata:  json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userUnreadIdx: index("idx_notif_user_unread").on(table.userId, table.isRead, table.createdAt),
  userTypeIdx:   index("idx_notif_user_type").on(table.userId, table.type),
  expiresIdx:    index("idx_notif_expires").on(table.expiresAt),
}));

export type Notification    = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// ── TABLE 12: audit_logs ─────────────────────────────────────────
// Insert thực hiện bởi apps/api/middleware/audit.ts — KHÔNG dùng Trigger
export const auditLogs = mysqlTable("audit_logs", {
  id:         bigint("id", { mode: "bigint", unsigned: true }).$type<string>().autoincrement().primaryKey(),
  // NULL nếu system action (user đã bị xóa → giữ log)
  userId:     bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>()
                .references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
  action:     varchar("action", { length: 100 }).notNull(),    // e.g. "transaction.delete"
  resource:   varchar("resource", { length: 100 }),            // e.g. "transactions"
  resourceId: varchar("resource_id", { length: 50 }),          // affected record ID
  oldValues:  json("old_values"),                              // values before change
  newValues:  json("new_values"),                              // values after change
  ipAddress:  varchar("ip_address", { length: 45 }),
  userAgent:  varchar("user_agent", { length: 500 }),
  status:     mysqlEnum("status", ["success", "failed"]).notNull().default("success"),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx:     index("idx_audit_user").on(table.userId, table.createdAt),
  actionIdx:   index("idx_audit_action").on(table.action, table.createdAt),
  resourceIdx: index("idx_audit_resource").on(table.resource, table.resourceId),
}));

export type AuditLog    = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

```

## File: `packages/db/src/schema/goals.ts`

```typescript
// packages/db/src/schema/goals.ts
// TABLE 8: goals — Mục tiêu tiết kiệm dài hạn
//
// status được set bởi goal-service.ts::checkAndCompleteGoal() — KHÔNG dùng Trigger
// completedAt được set tự động khi current_saved >= target_amount (với 1% tolerance)
// [FIX #4] bigint mode: "bigint" — TiDB precision safety
import {
  bigint, varchar, tinyint, decimal, timestamp, date, text,
  mysqlTable, mysqlEnum, index, check,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const goals = mysqlTable("goals", {
  id:                  bigint("id", { mode: "bigint", unsigned: true }).$type<string>().autoincrement().primaryKey(),
  userId:              bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>().notNull()
                         .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  name:                varchar("name", { length: 100 }).notNull(),
  icon:                varchar("icon", { length: 20 }).notNull().default("🎯"),
  targetAmount:        decimal("target_amount", { precision: 15, scale: 2 }).notNull(),
  currentSaved:        decimal("current_saved", { precision: 15, scale: 2 }).notNull().default("0.00"),
  monthlyContribution: decimal("monthly_contribution", { precision: 15, scale: 2 }).notNull().default("0.00"),
  deadline:            date("deadline", { mode: "string" }),
  // 4-value status — paused/cancelled là trạng thái tài chính thực tế (không đơn giản hóa)
  status:              mysqlEnum("status", ["active", "completed", "paused", "cancelled"])
                         .notNull().default("active"),
  priority:            tinyint("priority").notNull().default(1), // 1=high, 2=medium, 3=low
  notes:               text("notes"),
  completedAt:         timestamp("completed_at"),
  deletedAt:           timestamp("deleted_at"),
  createdAt:           timestamp("created_at").notNull().defaultNow(),
  updatedAt:           timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  idempotencyKey:      varchar("idempotency_key", { length: 255 }).unique(),
}, (table) => ({
  userStatusIdx:   index("idx_goals_user_status").on(table.userId, table.status, table.deletedAt),
  userDeadlineIdx: index("idx_goals_user_deadline").on(table.userId, table.deadline),
  // CHECK: amounts phải hợp lệ — target > 0, saved >= 0, monthly >= 0
  amountsCheck:    check("chk_goals_amounts",
    sql`target_amount > 0 AND current_saved >= 0 AND monthly_contribution >= 0`),
  // 1% tolerance để tránh lỗi rounding khi tính completion
  savedLteTarget:  check("chk_goals_saved_lte_target",
    sql`current_saved <= target_amount * 1.01`),
}));

export type Goal    = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;

```

## File: `packages/db/src/schema/index.ts`

```typescript
// packages/db/src/schema/index.ts
// Re-export all schemas — single import point for apps/api and queries

// Phase 1 — MVP Core
export * from "./users";
export * from "./auth";         // user_settings, refresh_tokens
export * from "./categories";
export * from "./transactions";
export * from "./bills";        // bills, bill_payments
export * from "./goals";
export * from "./wallet";       // cash_wallet, cash_wallet_logs

// Phase 2 — Extended (schema available, activate when needed)
export * from "./extensions";   // notifications, audit_logs
export * from "./budgets";

```

## File: `packages/db/src/schema/transactions.ts`

```typescript
// packages/db/src/schema/transactions.ts
// TABLE 5: transactions — Nhật ký giao dịch tài chính (bảng cốt lõi)
//
// [v12.0-A] display_date DATE — ngày user tự chọn cho sổ cái, không có timezone confusion
//           Budget-First Engine filters: WHERE display_date BETWEEN '2026-04-01' AND '2026-04-30'
// [v12.0-B] Currency fields deferred to Phase 2 (VND-only MVP)
// [v12.0-C] type enum includes 'transfer' for wallet-to-wallet moves
// [FIX #4]  bigint mode: "string" — TiDB distributed ID safety
//
// ⚡ COMPOSITE INDEX (user_id, display_date) — CRITICAL for Budget-First Engine performance
import {
  bigint, int, decimal, varchar, timestamp, date,
  mysqlTable, mysqlEnum, index, check,
} from "drizzle-orm/mysql-core";
import { sql, relations } from "drizzle-orm";
import { users } from "./users";
import { categories } from "./categories";

export const transactions = mysqlTable("transactions", {
  id:          bigint("id", { mode: "bigint", unsigned: true }).$type<string>().autoincrement().primaryKey(),
  userId:      bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>().notNull()
                 .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  categoryId:  int("category_id", { unsigned: true }).notNull()
                 .references(() => categories.id, { onDelete: "restrict", onUpdate: "cascade" }),

  // Decimal Trap: amount từ DB là string → dùng new Decimal(tx.amount) tại service layer
  // KHÔNG .toNumber() trực tiếp
  amount:      decimal("amount", { precision: 15, scale: 2 }).notNull(),

  // [v12.0-C] 'transfer' cho phép ghi nhận chuyển ví
  type:        mysqlEnum("type", ["income", "expense", "transfer"]).notNull(),

  note:        varchar("note", { length: 500 }),

  // [v12.0-A] User-controlled date — không phải system timestamp
  // Cho phép log giao dịch quá khứ đúng ngày
  displayDate: date("display_date", { mode: "string" }).notNull(),

  receiptUrl:  varchar("receipt_url", { length: 500 }),
  source:      mysqlEnum("source", ["manual", "quick_add", "ocr", "import", "recurring"])
                 .notNull().default("manual"),
  
  // Idempotency: Khóa đúp từ DB — phòng thủ Cold Start Serverless
  // UNIQUE constraint đảm bảo cross-instance safety trên Vercel multi-region
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),

  // Soft delete — query Budget phải luôn có: WHERE deleted_at IS NULL
  deletedAt:   timestamp("deleted_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow().onUpdateNow(),

  // Phase 2 multi-currency (uncomment + migration when expanding):
  // currencyCode: varchar("currency_code", { length: 10 }).notNull().default("VND"),
  // exchangeRate: decimal("exchange_rate", { precision: 18, scale: 6 }).notNull().default("1.000000"),
  // baseAmount:   decimal("base_amount", { precision: 15, scale: 2 }).notNull(),
}, (table) => ({
  // ⚡ COMPOSITE INDEX — Budget-First Engine lifeblood
  userDateIdx:  index("idx_tx_user_date").on(table.userId, table.displayDate),
  userTypeIdx:  index("idx_tx_user_type").on(table.userId, table.type),
  userCatIdx:   index("idx_tx_user_cat").on(table.userId, table.categoryId),
  // Covering index cho Budget monthly query
  userMonthIdx: index("idx_tx_user_month").on(table.userId, table.displayDate, table.deletedAt),
  deletedIdx:   index("idx_tx_deleted").on(table.deletedAt),
  // CHECK: amount phải luôn dương
  amountCheck:  check("chk_tx_amount_positive", sql`amount > 0`),
}));

export type Transaction    = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
// tx.amount:      string "50000.00"
// tx.displayDate: string "2026-04-01"
// tx.userId:      string "1"

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

```

## File: `packages/db/src/schema/types.ts`

```typescript
import { customType } from "drizzle-orm/mysql-core";

export const bigintString = customType<{ data: string; driverParam: string | number }>({
  dataType() {
    return "bigint unsigned";
  },
  toDriver(value: string) {
    return value;
  },
  fromDriver(value: unknown) {
    return String(value);
  },
});

```

## File: `packages/db/src/schema/users.ts`

```typescript
import {
  bigint, varchar, tinyint, timestamp, mysqlTable, index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id:            bigint("id", { mode: "bigint", unsigned: true }).$type<string>().autoincrement().primaryKey(),
  username:      varchar("username", { length: 50 }).notNull().unique(),
  email:         varchar("email", { length: 255 }).notNull().unique(),
  passwordHash:  varchar("password_hash", { length: 255 }), // Nullable for social login
  firebaseUid:   varchar("firebase_uid", { length: 128 }).unique(), // Firebase UID
  fullName:      varchar("full_name", { length: 100 }).notNull(),
  avatarUrl:     varchar("avatar_url", { length: 500 }),
  avatarText:    varchar("avatar_text", { length: 5 }),
  isActive:      tinyint("is_active").notNull().default(1),
  emailVerified: tinyint("email_verified").notNull().default(0),
  lastLoginAt:   timestamp("last_login_at"),
  deletedAt:     timestamp("deleted_at"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  updatedAt:     timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  emailIdx:    index("idx_users_email").on(table.email),
  usernameIdx: index("idx_users_username").on(table.username),
  activeIdx:   index("idx_users_active").on(table.isActive, table.deletedAt),
}));

export type User    = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
// user.id: string → compare: user.id === "1" ✅ | user.id === 1 ❌

```

## File: `packages/db/src/schema/wallet.ts`

```typescript
// packages/db/src/schema/wallet.ts
// TABLE 9: cash_wallet — Ví tiền mặt (1:1 với users)
// TABLE 10: cash_wallet_logs — Lịch sử Quick Sync (Phase 2)
//
// [v12.0-D] initial_balance: snapshot khi user onboard, immutable sau khi set
//           net_change = balance - initial_balance (tính tại API, không lưu DB)
// cash_wallet record được tạo bởi user-service.ts::initializeNewUser() — KHÔNG dùng Trigger
import {
  bigint, decimal, timestamp, varchar, mysqlTable, index, check,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { transactions } from "./transactions";

// ── TABLE 9: cash_wallet ─────────────────────────────────────────
export const cashWallet = mysqlTable("cash_wallet", {
  // PK = userId (1:1 relationship)
  userId:         bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>().primaryKey()
                    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  // [v12.0-D] initial_balance: baseline onboarding snapshot — set once, immutable
  initialBalance: decimal("initial_balance", { precision: 15, scale: 2 }).notNull().default("0.00"),
  // current balance — updated by wallet-service.ts on Quick Sync
  balance:        decimal("balance", { precision: 15, scale: 2 }).notNull().default("0.00"),
  // net_change = balance - initial_balance (computed at API layer)
  lastSyncedAt:   timestamp("last_synced_at"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
  updatedAt:      timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  balanceCheck:        check("chk_cash_balance_non_negative", sql`balance >= 0`),
  initialBalanceCheck: check("chk_cash_initial_non_negative", sql`initial_balance >= 0`),
}));

export type CashWallet   = typeof cashWallet.$inferSelect;
export type UpdateWallet = typeof cashWallet.$inferInsert;
// wallet.balance:        string "500000.00"
// wallet.initialBalance: string "0.00"

// ── TABLE 10: cash_wallet_logs ───────────────────────────────────
// Phase 2 — Audit trail cho Quick Sync
// Insert thực hiện bởi wallet-service.ts — KHÔNG dùng Stored Procedure
export const cashWalletLogs = mysqlTable("cash_wallet_logs", {
  id:            bigint("id", { mode: "bigint", unsigned: true }).$type<string>().autoincrement().primaryKey(),
  userId:        bigint("user_id", { mode: "bigint", unsigned: true }).$type<string>().notNull()
                   .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  balanceBefore: decimal("balance_before", { precision: 15, scale: 2 }).notNull(),
  balanceAfter:  decimal("balance_after", { precision: 15, scale: 2 }).notNull(),
  // difference = after - before (âm = đã chi)
  difference:    decimal("difference", { precision: 15, scale: 2 }).notNull(),
  note:          varchar("note", { length: 255 }),
  // FK to transactions if a misc expense was auto-created
  autoTxId:      bigint("auto_tx_id", { mode: "bigint", unsigned: true }).$type<string>()
                   .references(() => transactions.id, { onDelete: "set null", onUpdate: "cascade" }),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
}, (table) => ({
  userIdx: index("idx_wallet_logs_user").on(table.userId, table.createdAt),
}));

export type CashWalletLog    = typeof cashWalletLogs.$inferSelect;
export type NewCashWalletLog = typeof cashWalletLogs.$inferInsert;

```

