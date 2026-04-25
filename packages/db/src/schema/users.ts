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
