// apps/api/src/routes/wallet.ts
import { Hono } from "hono";
import { zValidator } from "../lib/validator";
import { quickSyncWalletSchema } from "@finance/shared-schemas";
import { walletService } from "../services/container";
import { ok, err } from "../lib/response";

export const walletRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/cash", async (c) => {
    const wallet = await walletService.getWallet(c.get("userId"));
    if (!wallet) return err(c, 404, "NOT_FOUND", "Không tìm thấy ví tiền mặt");
    return ok(c, wallet);
  })

  .put("/cash", zValidator("json", quickSyncWalletSchema), async (c) => {
    const userId = c.get("userId");
    const { newBalance, note } = c.req.valid("json");
    const idempotencyKey = c.req.header("Idempotency-Key");

    if (idempotencyKey) {
      const existing = await walletService.getSyncByIdempotencyKey(userId, idempotencyKey);
      if (existing) {
        return ok(c, await walletService.getWallet(userId)); // Return current wallet state for idempotent retries
      }
    }

    const wallet = await walletService.quickSync(userId, newBalance, note, {
      idempotencyKey: idempotencyKey || undefined,
    });
    return ok(c, wallet);
  });
