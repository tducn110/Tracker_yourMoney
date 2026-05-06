// packages/db/src/schema/extensions.ts
// TABLE 11: notifications — Thông báo hệ thống (Phase 2)
// TABLE 12: audit_logs — Ghi log thao tác quan trọng (Phase 2)
import {
  bigint, varchar, boolean, timestamp, text, json,
  pgTable, pgEnum, index, bigserial,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const notificationTypeEnum = pgEnum("notification_type", [
  "bill_due", "bill_overdue", "budget_warning", "budget_exceeded",
  "goal_completed", "goal_milestone", "low_balance",
  "budget_negative", "system", "tip",
]);

export const auditStatusEnum = pgEnum("audit_status", ["success", "failed"]);

// ── TABLE 11: notifications ──────────────────────────────────────
export const notifications = pgTable("notifications", {
  id:             bigint("id", { mode: "bigint" }).$type<string>().primaryKey().generatedAlwaysAsIdentity(),
  userId:    bigint("user_id", { mode: "bigint" }).$type<string>().notNull()
               .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  type:      notificationTypeEnum("type").notNull(),
  title:     varchar("title", { length: 150 }).notNull(),
  body:      text("body").notNull(),
  icon:      varchar("icon", { length: 20 }).notNull().default("🔔"),
  actionUrl: varchar("action_url", { length: 255 }),
  isRead:    boolean("is_read").notNull().default(false),
  readAt:    timestamp("read_at"),
  expiresAt: timestamp("expires_at"),
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
export const auditLogs = pgTable("audit_logs", {
  id:         bigint("id", { mode: "bigint" }).$type<string>().generatedAlwaysAsIdentity().primaryKey(),
  userId:     bigint("user_id", { mode: "bigint" }).$type<string>()
                .references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
  action:     varchar("action", { length: 100 }).notNull(),
  resource:   varchar("resource", { length: 100 }),
  resourceId: varchar("resource_id", { length: 50 }),
  oldValues:  json("old_values"),
  newValues:  json("new_values"),
  ipAddress:  varchar("ip_address", { length: 45 }),
  userAgent:  varchar("user_agent", { length: 500 }),
  status:     auditStatusEnum("status").notNull().default("success"),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx:     index("idx_audit_user").on(table.userId, table.createdAt),
  actionIdx:   index("idx_audit_action").on(table.action, table.createdAt),
  resourceIdx: index("idx_audit_resource").on(table.resource, table.resourceId),
}));

export type AuditLog    = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
