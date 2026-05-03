// packages/db/src/schema/categories.ts
// TABLE 4: categories — Danh mục thu/chi (system global + user custom)
// user_id = NULL → system category (global cho tất cả users)
// user_id = có giá trị → user-defined category
import {
  bigint, integer, varchar, boolean, timestamp, pgTable, index, uniqueIndex, pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const categoryTypeEnum = pgEnum("category_type", ["income", "expense", "both"]);

export const categories = pgTable("categories", {
  id:        integer("id").generatedAlwaysAsIdentity().primaryKey(),
  // nullable: NULL = system category, value = user category
  userId:    bigint("user_id", { mode: "bigint" }).$type<string>()
               .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  name:      varchar("name", { length: 50 }).notNull(),
  type:      categoryTypeEnum("type").notNull().default("expense"),
  icon:      varchar("icon", { length: 20 }).notNull().default("📦"),
  color:     varchar("color", { length: 7 }).notNull().default("#6B7280"),
  isDefault: boolean("is_default").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // Unique: same user cannot have two categories with same name
  nameUserUq: uniqueIndex("uq_category_name_user").on(table.userId, table.name),
  userIdx:    index("idx_categories_user").on(table.userId),
  typeIdx:    index("idx_categories_type").on(table.type),
}));

export type Category    = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
