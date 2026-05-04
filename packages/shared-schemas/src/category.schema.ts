// packages/shared-schemas/src/category.schema.ts
import { z } from "zod";

export const insertCategorySchema = z.object({
  name:      z.string().min(1).max(50).trim(),
  type:      z.enum(["income", "expense"]).default("expense"),
  icon:      z.string().max(20).default("📦"),
  color:     z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Hex color hợp lệ: #RRGGBB").default("#6B7280"),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = insertCategorySchema.partial();

export const categoryResponseSchema = z.object({
  id:        z.number(),
  userId:    z.string().nullable(),
  name:      z.string(),
  type:      z.enum(["income", "expense"]),
  icon:      z.string(),
  color:     z.string(),
  isDefault: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.coerce.date(),
});

export type InsertCategory    = z.infer<typeof insertCategorySchema>;
export type UpdateCategory    = z.infer<typeof updateCategorySchema>;
export type CategoryResponse  = z.infer<typeof categoryResponseSchema>;
