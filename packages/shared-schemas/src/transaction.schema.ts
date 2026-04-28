// packages/shared-schemas/src/transaction.schema.ts
import { z } from "zod";

// ── Decimal string coercion helper ────────────────────────────────
// Input: number hoặc string → Output: string decimal "50000.00"
// Dùng string để tránh floating-point errors khi lưu vào Drizzle Decimal column
const decimalString = z
  .union([z.string(), z.number()])
  .transform((val) => {
    const str = String(val);
    if (!/^\d+(\.\d+)?$/.test(str)) throw new Error("Số tiền không hợp lệ");
    return str; // Keep as string to preserve precision
  });

// ── Insert ─────────────────────────────────────────────────────────
export const insertTransactionSchema = z.object({
  categoryId:  z.number().int().positive(),
  amount:      decimalString,
  type:        z.enum(["income", "expense", "transfer"]),
  note:        z.string().max(500).optional(),
  // [v12.0-A] displayDate: user gửi "YYYY-MM-DD"
  // Transform -> chuẩn hóa thành string "YYYY-MM-DD" cho Drizzle DATE column
  // Tránh timezone confusion bằng cách ép dùng YYYY-MM-DD string thay vì khởi tạo Date()
  displayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Ngày phải có định dạng YYYY-MM-DD" }),
  source:      z.enum(["manual", "quick_add", "ocr", "import", "recurring"]).default("manual"),
  receiptUrl:  z.string().url().optional(),
});

// ── Update ─────────────────────────────────────────────────────────
export const updateTransactionSchema = insertTransactionSchema.partial();

// ── Response ────────────────────────────────────────────────────────
// amount: string "50000.00" — giữ nguyên string, client tự format với Intl.NumberFormat
export const transactionResponseSchema = z.object({
  id:          z.string(),
  userId:      z.string(),
  categoryId:  z.number(),
  categoryName: z.string().optional(),
  categoryIcon: z.string().optional(),
  amount:      z.string(),   // "50000.00"
  type:        z.enum(["income", "expense", "transfer"]),
  note:        z.string().nullable(),
  displayDate: z.string(),   // "2026-04-01"
  source:      z.string(),
  receiptUrl:  z.string().nullable(),
  createdAt:   z.coerce.date(),
});

export type InsertTransaction    = z.infer<typeof insertTransactionSchema>;
export type UpdateTransaction    = z.infer<typeof updateTransactionSchema>;
export type TransactionResponse  = z.infer<typeof transactionResponseSchema>;
