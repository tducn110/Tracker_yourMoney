// apps/api/src/routes/bills.ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "../lib/validator";
import { insertBillSchema, updateBillSchema } from "@finance/shared-schemas";
import { billService } from "../services/container";
import { ok, created, err } from "../lib/response";

export const billRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/", async (c) => {
    const userId = c.get("userId");
    const bills = await billService.getActiveBills(userId);
    
    // Compute payment status for current month
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const billsWithStatus = await Promise.all(
      bills.map(async (bill) => {
        const { status: paymentStatus, totalPaid } = await billService.getBillPaymentStatus(
          userId, bill.id, currentPeriod
        );
        return { ...bill, paymentStatus, totalPaid };
      })
    );
    
    return ok(c, billsWithStatus);
  })

  .post("/", zValidator("json", insertBillSchema), async (c) => {
    const userId = c.get("userId");
    const idempotencyKey = c.req.header("Idempotency-Key");

    if (idempotencyKey) {
      const existing = await billService.getBillByIdempotencyKey(userId, idempotencyKey);
      if (existing) {
        return err(c, 409, "CONFLICT", "Hóa đơn đã tồn tại", { id: existing.id });
      }
    }

    const input = c.req.valid("json");
    const bill = await billService.createBill(userId, {
      ...input,
      idempotencyKey: idempotencyKey || undefined,
    });
    return created(c, bill);
  })

  .put("/:id", zValidator("json", updateBillSchema), async (c) => {
    const { id } = c.req.param();
    const userId = c.get("userId");
    const input = c.req.valid("json");
    
    try {
      const updated = await billService.updateBill(userId, id, input);
      return ok(c, updated);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  })

  .patch("/:id/pay", zValidator("json", z.object({
    walletId: z.string(),
    amount: z.union([z.string(), z.number()]).transform((val) => {
      const n = typeof val === "number" ? val : parseFloat(val);
      if (isNaN(n) || n <= 0) throw new Error("Số tiền phải là số dương");
      return n.toFixed(2);
    }),
    paymentDate: z.string(),
    note: z.string().max(255).optional(),
  })), async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.param();
    const idempotencyKey = c.req.header("Idempotency-Key");
    const input = c.req.valid("json");

    // Convert paymentDate → periodMonth (YYYY-MM)
    const d = new Date(input.paymentDate);
    const periodMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (idempotencyKey) {
      const existing = await billService.getPaymentByIdempotencyKey(userId, idempotencyKey);
      if (existing) {
        return ok(c, existing);
      }
    }

    try {
      const payment = await billService.payBill(userId, {
        billId: id,
        walletId: input.walletId,
        amountPaid: input.amount,
        periodMonth,
        note: input.note,
        idempotencyKey: idempotencyKey || undefined,
      });
      return ok(c, payment);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      if (e.code === "ALREADY_PAID") return err(c, 409, "ALREADY_PAID", e.message);
      throw e;
    }
  })

  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.param();
    try {
      await billService.deleteBill(userId, id);
      return ok(c, { message: "Đã xóa hóa đơn" });
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  });
