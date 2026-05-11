import type { CategoryRepository } from "@finance/db/src/repositories/category-repository";
import type { WalletService } from "./wallet-service";
import { logger } from "../lib/logger";

/**
 * AI Service — full backend automation.
 *
 * Handles:
 * - Auto-creating categories when a keyword doesn't match any existing one
 * - Auto-creating wallets when a wallet name hint doesn't match
 * - Suggesting a complete category set for new users
 * - Suggesting a complete wallet set for new users
 *
 * Uses OpenRouter-compatible LLM API (config via env: AI_API_KEY, AI_BASE_URL, AI_MODEL).
 */
export class AIService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly walletService: WalletService,
    opts?: { apiKey?: string; baseUrl?: string; model?: string; timeoutMs?: number }
  ) {
    this.apiKey = opts?.apiKey || process.env.AI_API_KEY || "";
    this.baseUrl = opts?.baseUrl || process.env.AI_BASE_URL || "https://openrouter.ai/api/v1";
    this.model = opts?.model || process.env.AI_MODEL || "inclusionai/ring-2.6-1t:free";
    this.timeoutMs = opts?.timeoutMs || 8000;
  }

  // ── Category Auto-Creation ────────────────────────────────────────

  /**
   * Resolve a category by keyword/name.
   * If no match found, AI auto-creates one with appropriate icon + color.
   * Returns the category ID.
   */
  async resolveOrCreateCategory(
    userId: string,
    keyword: string,
    type: "income" | "expense",
    metadata?: { icon?: string; color?: string }
  ): Promise<number> {
    // 1. Search existing categories (user + system)
    const categories = await this.categoryRepo.findAll(userId);
    const keywordLower = keyword.toLowerCase();

    // Exact match first
    let matched = categories.find(
      (c) => c.name.toLowerCase() === keywordLower
    );
    // Then partial match
    if (!matched) {
      matched = categories.find(
        (c) =>
          c.name.toLowerCase().includes(keywordLower) ||
          keywordLower.includes(c.name.toLowerCase())
      );
    }

    if (matched) {
      logger.info({ event: "AI_CATEGORY_MATCHED", keyword, matched: matched.name, userId });
      return matched.id;
    }

    // 2. Ask AI to generate category metadata OR use provided metadata
    if (!this.apiKey && !metadata) {
      // No AI key and no metadata — create a basic category with keyword as name
      return this.createFallbackCategory(userId, keyword, type, categories.length);
    }

    try {
      const meta = metadata?.icon && metadata?.color ? 
        { name: keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase(), icon: metadata.icon, color: metadata.color, type } : 
        await this.generateCategoryMetadata(keyword, type);

      // 3. Double-check duplicate (AI might return a name that already exists)
      const exactMatch = categories.find(
        (c) => c.name.toLowerCase() === meta.name.toLowerCase()
      );
      if (exactMatch) return exactMatch.id;

      // 4. Create the new category
      const created = await this.categoryRepo.create({
        userId: userId as any,
        name: meta.name,
        type: meta.type as any,
        icon: meta.icon,
        color: meta.color,
        sortOrder: categories.length,
      });

      logger.info({
        event: "AI_CATEGORY_CREATED",
        name: meta.name,
        icon: meta.icon,
        keyword,
        userId,
      });

      return created.id;
    } catch (e: any) {
      logger.warn({ event: "AI_CATEGORY_CREATE_FAILED", keyword, error: e.message });
      // Fallback: create a basic category
      return this.createFallbackCategory(userId, keyword, type, categories.length);
    }
  }

  /**
   * Fallback: create a category with minimal metadata when AI is unavailable.
   */
  private async createFallbackCategory(
    userId: string,
    name: string,
    type: "income" | "expense",
    sortOrder: number
  ): Promise<number> {
    const fallbackIcons: Record<string, string> = {
      income: "💰",
      expense: "📦",
    };
    const fallbackColors: Record<string, string> = {
      income: "#10b981",
      expense: "#6b7280",
    };

    const capName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    const created = await this.categoryRepo.create({
      userId: userId as any,
      name: capName,
      type: type as any,
      icon: fallbackIcons[type] || "📦",
      color: fallbackColors[type] || "#6b7280",
      sortOrder,
    });

    logger.info({ event: "AI_CATEGORY_FALLBACK", name: capName, userId });
    return created.id;
  }

  /**
   * Call LLM to generate category metadata: name, icon, color, type.
   */
  private async generateCategoryMetadata(
    keyword: string,
    type: "income" | "expense"
  ): Promise<{ name: string; icon: string; color: string; type: string }> {
    const typeLabel = type === "income" ? "thu nhập" : "chi tiêu";

    const result = await this.chatCompletion(
      `Bạn là trợ lý thiết kế danh mục tài chính cá nhân bằng tiếng Việt.
Người dùng nhập từ khóa "${keyword}" cho danh mục loại "${typeLabel}".

Hãy trả về CHỈ JSON (không markdown, không giải thích):
{
  "name": "<tên danh mục tiếng Việt, ngắn gọn 2-4 từ, viết hoa đầu mỗi từ>",
  "icon": "<1 emoji phù hợp nhất>",
  "color": "<mã hex màu, chọn màu tươi sáng dễ nhìn>",
  "type": "<income|expense>"
}

Ví dụ:
- keyword "ăn" → name "Ăn Uống", icon "🍔", color "#f87171", type "expense"
- keyword "lương" → name "Lương", icon "💰", color "#10b981", type "income"
- keyword "xăng" → name "Di Chuyển", icon "🚗", color "#3b82f6", type "expense"
- keyword "cafe" → name "Cà Phê", icon "☕", color "#a855f7", type "expense"`,
      keyword
    );

    return {
      name: String(result.name || keyword),
      icon: String(result.icon || "📦"),
      color: String(result.color || "#6b7280"),
      type: String(result.type || type),
    };
  }

  // ── Wallet Auto-Creation ──────────────────────────────────────────

  /**
   * Resolve a wallet by name hint.
   * If not found, AI auto-creates one with appropriate type, icon, color.
   * Returns the wallet ID.
   */
  async resolveOrCreateWallet(
    userId: string,
    walletHint: string,
    metadata?: { type?: string; icon?: string; color?: string; initialBalance?: string }
  ): Promise<string> {
    // 1. Search existing wallets
    const wallets = await this.walletService.getWallets(userId);
    const hintLower = walletHint.toLowerCase();

    const matched = wallets.find(
      (w: any) =>
        w.name.toLowerCase().includes(hintLower) ||
        hintLower.includes(w.name.toLowerCase())
    );

    if (matched) {
      logger.info({ event: "AI_WALLET_MATCHED", hint: walletHint, matched: matched.name, userId });
      return String(matched.id);
    }

    // 2. Ask AI to generate wallet metadata OR use provided metadata
    if (!this.apiKey && !metadata) {
      return this.createFallbackWallet(userId, walletHint);
    }

    try {
      const meta = metadata?.icon && metadata?.color ?
        { name: walletHint.charAt(0).toUpperCase() + walletHint.slice(1), type: metadata.type || "cash", icon: metadata.icon, color: metadata.color } :
        await this.generateWalletMetadata(walletHint);

      // 3. Double-check duplicate
      const exact = wallets.find(
        (w: any) => w.name.toLowerCase() === meta.name.toLowerCase()
      );
      if (exact) return String(exact.id);

      // 4. Create wallet
      const created = await this.walletService.createWallet(userId, {
        name: meta.name,
        type: meta.type as any,
        icon: meta.icon,
        color: meta.color,
        initialBalance: metadata?.initialBalance || "0.00",
      });

      logger.info({
        event: "AI_WALLET_CREATED",
        name: meta.name,
        type: meta.type,
        hint: walletHint,
        userId,
      });

      return String((created as any).id);
    } catch (e: any) {
      logger.warn({ event: "AI_WALLET_CREATE_FAILED", hint: walletHint, error: e.message });
      return this.createFallbackWallet(userId, walletHint);
    }
  }

  private async createFallbackWallet(userId: string, name: string): Promise<string> {
    const capName = name.charAt(0).toUpperCase() + name.slice(1);
    const created = await this.walletService.createWallet(userId, {
      name: capName,
      type: "cash",
      icon: "💵",
      color: "#6b7280",
      initialBalance: "0.00",
    });
    logger.info({ event: "AI_WALLET_FALLBACK", name: capName, userId });
    return String((created as any).id);
  }

  private async generateWalletMetadata(
    hint: string
  ): Promise<{ name: string; type: string; icon: string; color: string }> {
    const result = await this.chatCompletion(
      `Bạn là trợ lý thiết kế ví tài chính cá nhân bằng tiếng Việt.
Người dùng gợi ý ví: "${hint}".

Hãy phân loại ví và trả về CHỈ JSON:
{
  "name": "<tên ví tiếng Việt, ngắn gọn, viết hoa đầu mỗi từ>",
  "type": "<cash|bank|credit|e_wallet|investment|other>",
  "icon": "<1 emoji phù hợp>",
  "color": "<mã hex màu>"
}

Loại ví:
- cash: tiền mặt
- bank: tài khoản ngân hàng (VCB, Techcombank, BIDV...)
- credit: thẻ tín dụng
- e_wallet: ví điện tử (Momo, ZaloPay, VNPay...)
- investment: đầu tư, chứng khoán
- other: khác

Ví dụ:
- "Momo" → name "Ví Momo", type "e_wallet", icon "📱", color "#c026d3"
- "Techcombank" → name "Techcombank", type "bank", icon "🏦", color "#2563eb"
- "tiền mặt" → name "Tiền Mặt", type "cash", icon "💵", color "#10b981"
- "thẻ tín dụng VCB" → name "Thẻ Tín Dụng VCB", type "credit", icon "💳", color "#ef4444"`,
      hint
    );

    return {
      name: String(result.name || hint),
      type: String(result.type || "cash"),
      icon: String(result.icon || "💵"),
      color: String(result.color || "#6b7280"),
    };
  }

  // ── AI Suggestion Endpoints ───────────────────────────────────────

  /**
   * Suggest a complete category set for a new user.
   * Returns an array of categories ready to insert.
   */
  async suggestCategories(
    userId: string
  ): Promise<Array<{ name: string; type: string; icon: string; color: string }>> {
    if (!this.apiKey) {
      return this.getDefaultCategories();
    }

    try {
      const result = await this.chatCompletion(
        `Bạn là trợ lý tài chính cá nhân. Hãy thiết kế một bộ danh mục thu/chi đầy đủ cho người dùng Việt Nam mới bắt đầu.

Trả về CHỈ JSON array (không markdown):
[
  {"name": "<tên>", "type": "<income|expense>", "icon": "<emoji>", "color": "<hex>"},
  ...
]

Yêu cầu:
- 6-8 danh mục chi tiêu phổ biến (ăn uống, di chuyển, mua sắm, hoá đơn, giải trí, sức khoẻ...)
- 3-4 danh mục thu nhập (lương, thưởng, freelance, đầu tư...)
- Mỗi danh mục có emoji khác nhau, màu sắc tươi sáng đa dạng
- Tên tiếng Việt, viết hoa đầu mỗi từ, ngắn gọn`,
        "generate default categories"
      );

      if (Array.isArray(result)) {
        return result.map((item: any) => ({
          name: String(item.name || "Khác"),
          type: item.type === "income" ? "income" : "expense",
          icon: String(item.icon || "📦"),
          color: String(item.color || "#6b7280"),
        }));
      }

      // If result has a "categories" key, unwrap it
      if (result.categories && Array.isArray(result.categories)) {
        return result.categories.map((item: any) => ({
          name: String(item.name || "Khác"),
          type: item.type === "income" ? "income" : "expense",
          icon: String(item.icon || "📦"),
          color: String(item.color || "#6b7280"),
        }));
      }
    } catch (e: any) {
      logger.warn({ event: "AI_SUGGEST_CATEGORIES_FAILED", error: e.message });
    }

    return this.getDefaultCategories();
  }

  /**
   * Suggest a complete wallet set for a new user.
   */
  async suggestWallets(
    userId: string
  ): Promise<Array<{ name: string; type: string; icon: string; color: string }>> {
    if (!this.apiKey) {
      return this.getDefaultWallets();
    }

    try {
      const result = await this.chatCompletion(
        `Bạn là trợ lý tài chính cá nhân. Hãy đề xuất bộ ví cho người dùng Việt Nam mới bắt đầu.

Trả về CHỈ JSON array:
[
  {"name": "<tên>", "type": "<cash|bank|credit|e_wallet|investment|other>", "icon": "<emoji>", "color": "<hex>"},
  ...
]

Gợi ý:
- 1 ví tiền mặt
- 1-2 tài khoản ngân hàng phổ biến (Vietcombank, Techcombank, BIDV...)
- 1 ví điện tử (Momo, ZaloPay...)
- Tổng cộng 3-4 ví`,
        "generate default wallets"
      );

      if (Array.isArray(result)) {
        return result.map((item: any) => ({
          name: String(item.name || "Ví"),
          type: String(item.type || "cash"),
          icon: String(item.icon || "💵"),
          color: String(item.color || "#6b7280"),
        }));
      }
    } catch (e: any) {
      logger.warn({ event: "AI_SUGGEST_WALLETS_FAILED", error: e.message });
    }

    return this.getDefaultWallets();
  }

  // ── Defaults (no-AI fallback) ─────────────────────────────────────

  private getDefaultCategories() {
    return [
      { name: "Ăn Uống", type: "expense", icon: "🍔", color: "#f87171" },
      { name: "Di Chuyển", type: "expense", icon: "🚗", color: "#3b82f6" },
      { name: "Mua Sắm", type: "expense", icon: "🛍️", color: "#f472b6" },
      { name: "Hoá Đơn", type: "expense", icon: "⚡", color: "#fbbf24" },
      { name: "Giải Trí", type: "expense", icon: "🎮", color: "#c084fc" },
      { name: "Sức Khoẻ", type: "expense", icon: "💊", color: "#f97316" },
      { name: "Nhà Cửa", type: "expense", icon: "🏠", color: "#84cc16" },
      { name: "Giáo Dục", type: "expense", icon: "📚", color: "#06b6d4" },
      { name: "Lương", type: "income", icon: "💰", color: "#10b981" },
      { name: "Thưởng", type: "income", icon: "🎁", color: "#ec4899" },
      { name: "Freelance", type: "income", icon: "💻", color: "#6366f1" },
      { name: "Khác", type: "expense", icon: "📦", color: "#6b7280" },
    ];
  }

  private getDefaultWallets() {
    return [
      { name: "Tiền Mặt", type: "cash", icon: "💵", color: "#10b981" },
      { name: "Vietcombank", type: "bank", icon: "🏦", color: "#2563eb" },
      { name: "Ví Momo", type: "e_wallet", icon: "📱", color: "#c026d3" },
    ];
  }

  // ── LLM Client ────────────────────────────────────────────────────

  /**
   * Call the LLM API with a system + user message pair.
   * Returns parsed JSON object.
   */
  private async chatCompletion(
    systemPrompt: string,
    userMessage: string
  ): Promise<Record<string, unknown>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`AI API error ${response.status}: ${body.slice(0, 200)}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI empty response");

      return this.safeParseJSON(content);
    } catch (e: any) {
      clearTimeout(timer);
      throw e;
    }
  }

  /**
   * Parse potentially malformed JSON from LLM output.
   */
  private safeParseJSON(raw: string): Record<string, unknown> {
    let cleaned = raw
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    // First try: direct parse
    try {
      const result = JSON.parse(cleaned);
      return result;
    } catch {
      /* continue */
    }

    // Fix truncated JSON
    if (cleaned.startsWith("{") || cleaned.startsWith("[")) {
      // Try appending closing bracket
      try {
        const close = cleaned.startsWith("[") ? "]" : "}";
        return JSON.parse(cleaned + close);
      } catch {
        /* continue */
      }
      // Try dropping last incomplete kv-pair
      const lastComma = cleaned.lastIndexOf(",");
      if (lastComma > 0) {
        try {
          const end = cleaned.startsWith("[") ? "]" : "}";
          return JSON.parse(cleaned.slice(0, lastComma) + end);
        } catch {
          /* continue */
        }
      }
    }

    throw new Error(`Failed to parse AI JSON: ${cleaned.slice(0, 100)}`);
  }
}
