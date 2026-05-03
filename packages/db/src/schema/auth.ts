// packages/db/src/schema/auth.ts
// TABLE 2: user_settings — Cấu hình tài chính cá nhân (1:1 với users)
// TABLE 3: refresh_tokens — JWT refresh token management
import {
  bigint, integer, varchar, boolean, timestamp, numeric, pgTable, index, pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// ── Enums ──────────────────────────────────────────────────────────
export const themeEnum = pgEnum("theme", ["light", "dark", "system"]);

// ── TABLE 2: user_settings ──────────────────────────────────────
export const userSettings = pgTable("user_settings", {
  userId:               bigint("user_id", { mode: "bigint" }).$type<string>().primaryKey()
                          .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  monthlyBudget:        numeric("monthly_budget", { precision: 15, scale: 2 }).notNull().default("0.00"),
  emergencyBuffer:      numeric("emergency_buffer", { precision: 15, scale: 2 }).notNull().default("0.00"),
  incomeDate:           integer("income_date").notNull().default(1), // 1-31
  currency:             varchar("currency", { length: 10 }).notNull().default("VND"),
  language:             varchar("language", { length: 10 }).notNull().default("vi"),
  timezone:             varchar("timezone", { length: 50 }).notNull().default("Asia/Ho_Chi_Minh"),
  theme:                themeEnum("theme").notNull().default("light"),
  notifyBillBeforeDays: integer("notify_bill_before_days").notNull().default(3),
  notifyBudgetThreshold:numeric("notify_budget_threshold", { precision: 5, scale: 2 }).notNull().default("80.00"),
  notifyEmail:          boolean("notify_email").notNull().default(true),
  notifyPush:           boolean("notify_push").notNull().default(true),
  createdAt:            timestamp("created_at").notNull().defaultNow(),
  updatedAt:            timestamp("updated_at").notNull().defaultNow(),
});

export type UserSetting    = typeof userSettings.$inferSelect;
export type NewUserSetting = typeof userSettings.$inferInsert;

// ── TABLE 3: refresh_tokens ─────────────────────────────────────
export const refreshTokens = pgTable("refresh_tokens", {
  id:         bigint("id", { mode: "bigint" }).$type<string>().generatedAlwaysAsIdentity().primaryKey(),
  userId:     bigint("user_id", { mode: "bigint" }).$type<string>().notNull()
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
