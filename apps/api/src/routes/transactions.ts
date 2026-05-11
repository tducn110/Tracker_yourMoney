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
  categoryId: z.coerce.number().optional(),
  type:        z.enum(["income", "expense", "transfer"]).optional(),
  search:      z.string().optional(),
  dateFrom:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  amountMin:   z.string().optional(),
  amountMax:   z.string().optional(),
  page:        z.coerce.number().default(1),
  limit:       z.coerce.number().max(100).default(20),
});

const quickAddSchema = z.object({
  text: z.string().min(1),
  walletId: z.string().optional(),
  categoryId: z.coerce.number().optional(),
});

export const transactionRoutes = new Hono<{ Variables: { userId: string, correlationId: string } }>()

  .get("/", zValidator("query", querySchema), async (c) => {
    const userId = c.get("userId");
    const q = c.req.valid("query");
    const data = await getTransactionsPaginated(userId, {
      month: q.month, categoryId: q.categoryId, type: q.type,
      search: q.search, dateFrom: q.dateFrom, dateTo: q.dateTo,
      amountMin: q.amountMin, amountMax: q.amountMax,
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
      const result = await transactionService.quickAdd(userId, text, {
        walletId,
        categoryId,
        idempotencyKey
      });

      let message = 'Giao dịch đã được lưu!';
      if (result.type === 'wallet') {
        message = `Ví "${result.data.name}" đã được tạo thành công!`;
      } else if (result.type === 'category') {
        message = `Danh mục "${result.data.name}" đã được tạo thành công!`;
      }

      return created(c, {
        success: true,
        message,
        type: result.type,
        data: result.data,
        // Keep transaction for backward compatibility if needed by some clients
        transaction: result.type === 'transaction' ? result.data : undefined
      });
    } catch (e: any) {
      if (e instanceof UnparseableInputError) {
        logger.warn({ event: 'QUICK_ADD_PARSE_FAILED', correlationId, input: e.input });
        return err(c, 422, "unprocessable_input", "Không thể nhận diện được thông tin. Vui lòng thử lại với nội dung rõ ràng hơn (VD: 'ăn sáng 50k', 'tạo ví Tiết kiệm', 'tạo danh mục Ăn uống').");
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

  // POST /api/v1/transactions/import — CSV bulk import
  .post("/import", async (c) => {
    const userId = c.get("userId");
    const correlationId = c.get("correlationId");
    const idempotencyKey = c.req.header("Idempotency-Key");

    // Idempotency check for the entire import batch
    if (idempotencyKey) {
      const existing = await transactionService.getTransactionByIdempotencyKey(userId, idempotencyKey);
      if (existing) {
        return err(c, 409, "CONFLICT", "File này đã được import trước đó", { id: existing.id });
      }
    }

    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const walletId = formData.get("walletId") as string | null;

    if (!file) return err(c, 400, "BAD_REQUEST", "Vui lòng chọn file CSV");
    if (!walletId) return err(c, 400, "BAD_REQUEST", "Vui lòng chọn ví");

    try {
      const text = await file.text();
      const result = await transactionService.importCSV(userId, text, walletId, idempotencyKey);
      logger.info({
        event: "CSV_IMPORT_COMPLETE",
        correlationId,
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors,
      });
      return created(c, result);
    } catch (e: any) {
      logger.error({
        event: "CSV_IMPORT_FAILED",
        correlationId,
        message: e.message,
      });
      return err(c, 422, "IMPORT_FAILED", e.message || "Không thể import file CSV");
    }
  })

  ;

