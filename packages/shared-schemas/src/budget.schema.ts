import { z } from "zod";

export const insertBudgetSchema = z.object({
  name: z.string().min(1, "Tên ngân sách không được để trống").max(100),
  icon: z.string().default("💰"),
  targetAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Số tiền không hợp lệ"),
  periodType: z.enum(["weekly", "monthly", "quarterly", "yearly", "custom"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày bắt đầu không hợp lệ (YYYY-MM-DD)"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày kết thúc không hợp lệ (YYYY-MM-DD)"),
  isAllCategories: z.boolean().default(false),
  categoryIds: z.array(z.number()).optional(),
});

export const updateBudgetSchema = insertBudgetSchema.partial();

export type InsertBudgetInput = z.infer<typeof insertBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
