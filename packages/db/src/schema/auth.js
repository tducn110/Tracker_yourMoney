// packages/db/src/schema/auth.ts
// TABLE 2: user_settings — Cấu hình tài chính cá nhân (1:1 với users)
// TABLE 3: refresh_tokens — JWT refresh token management
import { bigint, varchar, tinyint, timestamp, decimal, mysqlTable, index, mysqlEnum, } from "drizzle-orm/mysql-core";
import { users } from "./users";
// ── TABLE 2: user_settings ──────────────────────────────────────
export const userSettings = mysqlTable("user_settings", {
    userId: bigint("user_id", { mode: "bigint", unsigned: true }).primaryKey()
        .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    monthlyBudget: decimal("monthly_budget", { precision: 15, scale: 2 }).notNull().default("0.00"),
    emergencyBuffer: decimal("emergency_buffer", { precision: 15, scale: 2 }).notNull().default("0.00"),
    incomeDate: tinyint("income_date").notNull().default(1), // 1-31
    currency: varchar("currency", { length: 10 }).notNull().default("VND"),
    language: varchar("language", { length: 10 }).notNull().default("vi"),
    timezone: varchar("timezone", { length: 50 }).notNull().default("Asia/Ho_Chi_Minh"),
    theme: mysqlEnum("theme", ["light", "dark", "system"]).notNull().default("light"),
    notifyBillBeforeDays: tinyint("notify_bill_before_days").notNull().default(3),
    notifyBudgetThreshold: decimal("notify_budget_threshold", { precision: 5, scale: 2 }).notNull().default("80.00"),
    notifyEmail: tinyint("notify_email").notNull().default(1),
    notifyPush: tinyint("notify_push").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});
// ── TABLE 3: refresh_tokens ─────────────────────────────────────
export const refreshTokens = mysqlTable("refresh_tokens", {
    id: bigint("id", { mode: "bigint", unsigned: true }).autoincrement().primaryKey(),
    userId: bigint("user_id", { mode: "bigint", unsigned: true }).notNull()
        .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
    deviceInfo: varchar("device_info", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
    userIdx: index("idx_refresh_token_user").on(table.userId),
    hashIdx: index("idx_refresh_token_hash").on(table.tokenHash),
    expiryIdx: index("idx_refresh_token_expiry").on(table.expiresAt),
}));
