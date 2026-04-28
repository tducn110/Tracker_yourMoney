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
