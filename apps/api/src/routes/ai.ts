// apps/api/src/routes/ai.ts
// AI-powered endpoints: category & wallet suggestions, auto-creation
import { Hono } from "hono";
import { aiService, walletService, categoryRepo } from "../services/container";
import { ok, created, err } from "../lib/response";
import { logger } from "../lib/logger";

export const aiRoutes = new Hono<{ Variables: { userId: string } }>()

  // ── Category Suggestions ────────────────────────────────────────
  // GET /api/v1/ai/suggest-categories — AI generates a complete category set
  .get("/suggest-categories", async (c) => {
    const userId = c.get("userId");

    try {
      const suggestions = await aiService.suggestCategories(userId);
      return ok(c, { categories: suggestions });
    } catch (e: any) {
      logger.error({ event: "AI_SUGGEST_CATEGORIES_ERROR", error: e.message, userId });
      return err(c, 500, "AI_ERROR", "Không thể tạo gợi ý danh mục");
    }
  })

  // ── Bulk Create Categories from Suggestions ─────────────────────
  // POST /api/v1/ai/apply-suggested-categories — creates all suggested categories
  .post("/apply-suggested-categories", async (c) => {
    const userId = c.get("userId");

    try {
      const suggestions = await aiService.suggestCategories(userId);
      const existing = await categoryRepo.findAll(userId);
      const existingNames = new Set(existing.map(c => c.name.toLowerCase()));

      const createdList: Array<{ name: string; icon: string; type: string }> = [];
      const skipped: string[] = [];

      for (const cat of suggestions) {
        if (existingNames.has(cat.name.toLowerCase())) {
          skipped.push(cat.name);
          continue;
        }

        const newCat = await categoryRepo.create({
          userId: userId as any,
          name: cat.name,
          type: cat.type as any,
          icon: cat.icon || "📦",
          color: cat.color || "#6b7280",
          sortOrder: existing.length + createdList.length,
        });

        createdList.push({ name: newCat.name, icon: newCat.icon || "", type: newCat.type || "" });
        existingNames.add(cat.name.toLowerCase());
      }

      logger.info({
        event: "AI_APPLIED_SUGGESTED_CATEGORIES",
        userId,
        created: createdList.length,
        skipped: skipped.length,
      });

      return created(c, { created: createdList, skipped });
    } catch (e: any) {
      logger.error({ event: "AI_APPLY_CATEGORIES_ERROR", error: e.message, userId });
      return err(c, 500, "AI_ERROR", "Không thể áp dụng danh mục gợi ý");
    }
  })

  // ── Wallet Suggestions ──────────────────────────────────────────
  // GET /api/v1/ai/suggest-wallets — AI generates a complete wallet set
  .get("/suggest-wallets", async (c) => {
    const userId = c.get("userId");

    try {
      const suggestions = await aiService.suggestWallets(userId);
      return ok(c, { wallets: suggestions });
    } catch (e: any) {
      logger.error({ event: "AI_SUGGEST_WALLETS_ERROR", error: e.message, userId });
      return err(c, 500, "AI_ERROR", "Không thể tạo gợi ý ví");
    }
  })

  // ── Bulk Create Wallets from Suggestions ────────────────────────
  // POST /api/v1/ai/apply-suggested-wallets — creates all suggested wallets
  .post("/apply-suggested-wallets", async (c) => {
    const userId = c.get("userId");

    try {
      const suggestions = await aiService.suggestWallets(userId);
      const existing = await walletService.getWallets(userId);
      const existingNames = new Set(existing.map((w: any) => w.name.toLowerCase()));

      const createdList: Array<{ name: string; type: string; icon: string }> = [];
      const skipped: string[] = [];

      for (const w of suggestions) {
        if (existingNames.has(w.name.toLowerCase())) {
          skipped.push(w.name);
          continue;
        }

        const newWallet = await walletService.createWallet(userId, {
          name: w.name,
          type: w.type as any,
          icon: w.icon || "💵",
          color: w.color || "#6b7280",
          initialBalance: "0.00",
        });

        createdList.push({ name: (newWallet as any).name, type: (newWallet as any).type, icon: (newWallet as any).icon || "" });
        existingNames.add(w.name.toLowerCase());
      }

      logger.info({
        event: "AI_APPLIED_SUGGESTED_WALLETS",
        userId,
        created: createdList.length,
        skipped: skipped.length,
      });

      return created(c, { created: createdList, skipped });
    } catch (e: any) {
      logger.error({ event: "AI_APPLY_WALLETS_ERROR", error: e.message, userId });
      return err(c, 500, "AI_ERROR", "Không thể áp dụng ví gợi ý");
    }
  })

  // ── Auto-create wallet by name ──────────────────────────────────
  // POST /api/v1/ai/resolve-wallet — resolve or create wallet from name hint
  .post("/resolve-wallet", async (c) => {
    const userId = c.get("userId");
    const body = await c.req.json();
    const hint = body?.hint || body?.name;

    if (!hint || typeof hint !== "string") {
      return err(c, 400, "BAD_REQUEST", "Thiếu hint/name cho ví");
    }

    try {
      const walletId = await aiService.resolveOrCreateWallet(userId, hint);
      const wallet = await walletService.getWallet(userId, walletId);
      return ok(c, { wallet, created: wallet ? true : false });
    } catch (e: any) {
      logger.error({ event: "AI_RESOLVE_WALLET_ERROR", error: e.message, userId, hint });
      return err(c, 500, "AI_ERROR", "Không thể tạo/tìm ví");
    }
  });
