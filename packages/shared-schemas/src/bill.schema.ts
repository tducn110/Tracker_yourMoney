// packages/shared-schemas/src/bill.schema.ts
import { z } from "zod";

const decimalString = z
  .union([z.string(), z.number()])
  .transform((val) => {
    const n = typeof val === "number" ? val : parseFloat(val);
    if (isNaN(n) || n <= 0) throw new Error("Số tiền phải là số dương");
    return n.toFixed(2);
  });

// ── Insert Bill ────────────────────────────────────────────────────
export const insertBillSchema = z.object({
  categoryId: z.number().int().positive(),
  name:       z.string().min(1).max(100).trim(),
  icon:       z.string().max(20).default("📄"),
  amount:     decimalString,
  dueDay:     z.number().int().min(1).max(31),
  frequency:  z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
  autoPay:    z.number().min(0).max(1).default(0),
  isActive:   z.number().min(0).max(1).default(1),
  notes:      z.string().max(65535).optional(),
});

export const updateBillSchema = insertBillSchema.partial();

// ── Pay Bill — [FIX #3] Không có status field ────────────────────
// Mỗi record = 1 payment event thực tế
// Trạng thái "paid/partial/pending" tính tại bill-service.ts qua SUM
export const insertBillPaymentSchema = z.object({
  billId:      z.string(),  // bigint string
  amountPaid:  decimalString,
  // YYYY-MM format validator
  periodMonth: z.string().regex(
    /^\d{4}-(0[1-9]|1[0-2])$/,
    "Format bắt buộc: YYYY-MM (vd: 2026-04)",
  ),
  note:        z.string().max(255).optional(),
  // paidAt: server tự set DEFAULT CURRENT_TIMESTAMP, không nhận từ client
});

// ── Response ────────────────────────────────────────────────────────
export const billResponseSchema = z.object({
  id:         z.string(),
  userId:     z.string(),
  categoryId: z.number(),
  name:       z.string(),
  icon:       z.string(),
  amount:     z.string(),
  dueDay:     z.number(),
  frequency:  z.enum(["monthly", "quarterly", "yearly"]),
  autoPay:    z.boolean(),
  isActive:   z.boolean(),
  notes:      z.string().nullable(),
  createdAt:  z.coerce.date(),
  updatedAt:  z.coerce.date(),
});

export const billPaymentResponseSchema = z.object({
  id:          z.string(),
  billId:      z.string(),
  userId:      z.string(),
  periodMonth: z.string(),
  amountPaid:  z.string(),
  paidAt:      z.coerce.date(),
  note:        z.string().nullable(),
});

export type InsertBill         = z.infer<typeof insertBillSchema>;
export type UpdateBill         = z.infer<typeof updateBillSchema>;
export type InsertBillPayment  = z.infer<typeof insertBillPaymentSchema>;
export type BillResponse       = z.infer<typeof billResponseSchema>;
export type BillPaymentResponse = z.infer<typeof billPaymentResponseSchema>;
