// apps/api/src/routes/transactions.ts
import { Hono } from "hono";
import { zValidator } from "../lib/validator";
import { insertTransactionSchema, updateTransactionSchema } from "@finance/shared-schemas";
import { getTransactionsPaginated } from "@finance/db";
import { transactionService } from "../services/container";
import { UnparseableInputError } from "../services/adapters/nlp-adapter";
import { ok, created, err } from "../lib/response";
import { z } from "zod";
import { logger } from "../lib/logger";

const querySchema = z.object({
  month:       z.string().regex(/^\d{4}-\d{2}$/).optional(),
  category_id: z.coerce.number().optional(),
  type:        z.enum(["income", "expense", "transfer"]).optional(),
  page:        z.coerce.number().default(1),
  limit:       z.coerce.number().max(100).default(20),
});

const quickAddSchema = z.object({
  text: z.string().min(1),
  walletId: z.string(),
  categoryId: z.coerce.number().optional(),
});

export const transactionRoutes = new Hono<{ Variables: { userId: string, correlationId: string } }>()

  .get("/", zValidator("query", querySchema), async (c) => {
    const userId = c.get("userId");
    const q = c.req.valid("query");
    const data = await getTransactionsPaginated(userId, {
      month: q.month, categoryId: q.category_id, type: q.type,
      page: q.page, limit: q.limit,
    });
    const transactionsWithSafeAmount = data.transactions.map((tx: any) => ({
      ...tx,
      amount: String(tx.amount), // Defensive normalization
    }));
    return ok(c, { ...data, transactions: transactionsWithSafeAmount }, { page: q.page, limit: q.limit });
  })

  .post("/quick", zValidator("json", quickAddSchema), async (c) => {
    const userId = c.get("userId");
    const correlationId = c.get("correlationId");
    const { text, walletId, categoryId } = c.req.valid("json");
    const idempotencyKey = c.req.header("Idempotency-Key");
    
    if (idempotencyKey) {
      const existing = await transactionService.getTransactionByIdempotencyKey(userId, idempotencyKey);
      if (existing) {
        return ok(c, {
          success: true,
          message: 'Giao dịch đã được lưu! (Idempotent)',
          transaction: existing
        });
      }
    }

    try {
      const tx = await transactionService.quickAdd(userId, text, {
        walletId,
        categoryId,
        idempotencyKey
      });
      return created(c, {
        success: true,
        message: 'Giao dịch đã được lưu!',
        transaction: tx
      });
    } catch (e: any) {
      if (e instanceof UnparseableInputError) {
        logger.warn({ event: 'QUICK_ADD_PARSE_FAILED', correlationId, input: e.input });
        return err(c, 422, "unprocessable_input", "Không thể nhận diện được thông tin giao dịch. Vui lòng thử lại.");
      }
      throw e;
    }
  })

  .post("/", zValidator("json", insertTransactionSchema), async (c) => {
    const userId = c.get("userId");
    const idempotencyKey = c.req.header("Idempotency-Key");

    if (idempotencyKey) {
      const existing = await transactionService.getTransactionByIdempotencyKey(userId, idempotencyKey);
      if (existing) {
        return err(c, 409, "CONFLICT", "Giao dịch đã tồn tại", { id: existing.id });
      }
    }

    const transaction = await transactionService.createTransaction(userId, {
      ...c.req.valid("json"),
      idempotencyKey: idempotencyKey || undefined,
    });
    return created(c, transaction);
  })

  .put("/:id", zValidator("json", updateTransactionSchema), async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.param();
    try {
      const tx = await transactionService.updateTransaction(userId, id, c.req.valid("json"));
      return ok(c, tx);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  })

  // DELETE is intentionally not exposed — transactions are immutable ledger entries.
  // To reverse a transaction, create a reversal (income → expense or vice versa).
  ;

