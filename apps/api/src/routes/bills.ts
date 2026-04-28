// apps/api/src/routes/bills.ts
import { Hono } from "hono";
import { zValidator } from "../lib/validator";
import { insertBillSchema, updateBillSchema, insertBillPaymentSchema } from "@finance/shared-schemas";
import { billService } from "../services/container";
import { ok, created, err } from "../lib/response";

export const billRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/", async (c) => {
    const userId = c.get("userId");
    const bills = await billService.getActiveBills(userId);
    return ok(c, bills);
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

  .patch("/:id/pay", zValidator("json", insertBillPaymentSchema), async (c) => {
    const userId = c.get("userId");
    const idempotencyKey = c.req.header("Idempotency-Key");

    if (idempotencyKey) {
      const existing = await billService.getPaymentByIdempotencyKey(userId, idempotencyKey);
      if (existing) {
        return ok(c, existing); // Return existing payment for idempotent retries
      }
    }

    try {
      const payment = await billService.payBill(userId, {
        ...c.req.valid("json"),
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
