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
