// apps/api/src/routes/wallet.ts
import { Hono } from "hono";
import { zValidator } from "../lib/validator";
import { quickSyncWalletSchema } from "@finance/shared-schemas";
import { walletService } from "../services/container";
import { ok, err } from "../lib/response";

export const walletRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/", async (c) => {
    const wallets = await walletService.getWallets(c.get("userId"));
    return ok(c, wallets);
  })

  .get("/cash", async (c) => {
    const userId = c.get("userId");
    const wallet = await walletService.getDefaultWallet(userId);
    if (!wallet) return err(c, 404, "NOT_FOUND", "Không tìm thấy ví tiền mặt");
    return ok(c, wallet);
  })

  .put("/cash", zValidator("json", quickSyncWalletSchema), async (c) => {
    const userId = c.get("userId");
    const { newBalance, note } = c.req.valid("json");
    const idempotencyKey = c.req.header("Idempotency-Key");

    const defaultWallet = await walletService.getDefaultWallet(userId);
    if (!defaultWallet) return err(c, 404, "NOT_FOUND", "Không tìm thấy ví để đồng bộ");

    const walletId = String(defaultWallet.id);

    if (idempotencyKey) {
      const existing = await walletService.getSyncByIdempotencyKey(userId, walletId, idempotencyKey);
      if (existing) {
        return ok(c, await walletService.getWallet(userId, walletId));
      }
    }

    const wallet = await walletService.quickSync(userId, walletId, newBalance, note, {
      idempotencyKey: idempotencyKey || undefined,
    });
    return ok(c, wallet);
  })

  .post("/", async (c) => {
    const userId = c.get("userId");
    const body = await c.req.json();
    const wallet = await walletService.createWallet(userId, body);
    return ok(c, wallet);
  })

  .put("/:id", async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.param();
    const body = await c.req.json();
    const wallet = await walletService.updateWallet(userId, id, body);
    return ok(c, wallet);
  })

  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.param();
    await walletService.deleteWallet(userId, id);
    return ok(c, { message: "Đã xóa ví" });
  });
