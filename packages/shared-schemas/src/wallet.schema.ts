// packages/shared-schemas/src/wallet.schema.ts
import { z } from "zod";

// ── Quick Sync Wallet ──────────────────────────────────────────────
export const quickSyncWalletSchema = z.object({
  // newBalance: số dư thực tế user nhập vào sau khi đếm tiền mặt
  newBalance: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const n = typeof val === "number" ? val : parseFloat(val);
      if (isNaN(n) || n < 0) throw new Error("Số dư không được âm");
      return n.toFixed(2);
    }),
  note:       z.string().max(255).optional(),
});

// ── Response ───────────────────────────────────────────────────────
export const walletResponseSchema = z.object({
  userId:         z.string(),
  initialBalance: z.string(), // "0.00"
  balance:        z.string(), // "500000.00"
  // netChange = balance - initialBalance (computed at API)
  netChange:      z.string(),
  lastSyncedAt:   z.coerce.date().nullable(),
  updatedAt:      z.coerce.date(),
});

// ── Internal Transfer ────────────────────────────────────────────────
export const transferSchema = z.object({
  fromWalletId: z.string(),
  toWalletId:   z.string(),
  amount:       z
    .union([z.string(), z.number()])
    .transform((val) => {
      const n = typeof val === "number" ? val : parseFloat(val);
      if (isNaN(n) || n <= 0) throw new Error("Số tiền phải lớn hơn 0");
      return n.toFixed(2);
    }),
  note: z.string().max(255).optional(),
});

export type QuickSyncWallet  = z.infer<typeof quickSyncWalletSchema>;
export type WalletResponse   = z.infer<typeof walletResponseSchema>;
export type TransferInput    = z.infer<typeof transferSchema>;
