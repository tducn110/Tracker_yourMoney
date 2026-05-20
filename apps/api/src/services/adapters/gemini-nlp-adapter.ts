import Decimal from "decimal.js";
import type { INLPAdapter, NLPParsedResult } from "./nlp-adapter";
import { UnparseableInputError } from "./nlp-adapter";
import { logger } from "../../lib/logger";

/**
 * AI NLP Adapter — uses any OpenAI-compatible LLM via REST API.
 *
 * Default: OpenRouter (meta-llama/llama-3.3-70b-instruct:free)
 * Config via env vars: AI_API_KEY, AI_MODEL, AI_BASE_URL
 *
 * On any failure (timeout, auth, parse), throws UnparseableInputError
 * so TransactionService falls back to RegexNLPAdapter.
 */
export class GeminiNLPAdapter implements INLPAdapter {
  private readonly baseUrl: string;
  private readonly apiKeys: string[];
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(opts?: { apiKey?: string; baseUrl?: string; model?: string; timeoutMs?: number }) {
    const key1 = opts?.apiKey || process.env.AI_API_KEY || "";
    const key2 = process.env.AI_API_KEY_2 || "";
    this.apiKeys = [key1, key2].filter(Boolean);
    this.baseUrl = opts?.baseUrl || process.env.AI_BASE_URL || "https://openrouter.ai/api/v1";
    this.model = opts?.model || process.env.AI_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
    this.timeoutMs = opts?.timeoutMs || 15000;
  }

  parse(_text: string): NLPParsedResult {
    // Sync passthrough — real work is in parseAsync().
    // TransactionService checks instanceof and calls parseAsync() directly.
    throw new UnparseableInputError(_text);
  }

  async parseAsync(text: string): Promise<NLPParsedResult> {
    if (this.apiKeys.length === 0) {
      logger.warn({ event: "AI_NO_API_KEY" });
      throw new UnparseableInputError(text);
    }

    let lastError: any;
    for (let i = 0; i < this.apiKeys.length; i++) {
      const apiKey = this.apiKeys[i];
      const keyLabel = i === 0 ? "primary" : "fallback";
      try {
        const result = await this.tryParseWithKey(text, apiKey);
        logger.info({ event: "AI_PARSE_SUCCESS", keyLabel, input: text });
        return result;
      } catch (e: any) {
        lastError = e;
        if (e instanceof UnparseableInputError && e.message.includes("401")) {
          logger.warn({ event: "AI_KEY_EXPIRED", keyLabel });
          continue; // Try next key
        }
        if (i < this.apiKeys.length - 1) {
          logger.warn({ event: "AI_KEY_FAILED_TRYING_NEXT", keyLabel, error: e.message });
          continue;
        }
      }
    }

    throw lastError || new UnparseableInputError(text);
  }

  private async tryParseWithKey(text: string, apiKey: string): Promise<NLPParsedResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: `Bạn là trợ lý tài chính thông minh. Phân tích tin nhắn tiếng Việt và trả về CHỈ JSON:

{
  "intent": "transaction" | "create_wallet" | "create_category" | "unknown",
  "amount": "<số, ví dụ: 50000>",
  "type": "expense" | "income",
  "note": "<mô tả>",
  "keyword": "<danh mục, ví dụ: Ăn uống>",
  "walletName": "<tên ví, ví dụ: MoMo>",
  "suggestion": "<phản hồi thân thiện khi intent là unknown>",
  "metadata": {
    "icon": "<emoji phù hợp>",
    "color": "<mã màu hex phù hợp>",
    "initialBalance": "<số dư ban đầu nếu là tạo ví>"
  }
}

Quy tắc:
1. Nếu người dùng muốn ghi chép chi tiêu/thu nhập bình thường -> intent: "transaction".
2. Nếu người dùng nói "tạo ví", "thêm tài khoản", "lập quỹ" -> intent: "create_wallet".
3. Nếu người dùng nói "tạo danh mục", "thêm nhóm chi tiêu" -> intent: "create_category".
4. Nếu là giao dịch: "50k" = 50000, "1.5tr" = 1500000.
5. LUÔN LUÔN cung cấp metadata (icon là 1 emoji, color là mã hex tươi sáng) phù hợp cho mọi intent.
6. Note bỏ qua số tiền và tên ví.
7. Nếu tin nhắn KHÔNG liên quan đến tài chính (ví dụ: "đi ngủ", "hello", "hôm nay trời đẹp") -> intent: "unknown", suggestion là phản hồi thân thiện bằng tiếng Việt gợi ý người dùng ghi giao dịch (ví dụ: "Mình chưa hiểu ý bạn 😊 Bạn có muốn ghi một khoản chi tiêu không? Ví dụ: 'ăn tối 80k' hoặc 'nhận lương 5tr'").`
            },
            { role: "user", content: text }
          ],
          temperature: 0.1,
          max_tokens: 500,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        logger.warn({ event: "AI_API_ERROR", status: response.status, body: body.slice(0, 200) });
        throw new UnparseableInputError(`${response.status}: ${text}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        logger.warn({ event: "AI_EMPTY_RESPONSE" });
        throw new UnparseableInputError(text);
      }

      const parsed = this.safeParseJSON(content, text);
      return this.normalizeResult(parsed, text);

    } catch (e: any) {
      clearTimeout(timer);
      if (e instanceof UnparseableInputError) throw e;
      logger.warn({ event: "AI_REQUEST_FAILED", name: e.name, message: e.message });
      throw new UnparseableInputError(text);
    }
  }

  /**
   * Parse potentially truncated JSON from small/free models.
   * Strategies: (1) strip markdown fences, (2) try append "}, (3) drop last kv-pair.
   */
  private safeParseJSON(raw: string, input: string): Record<string, unknown> {
    let cleaned = raw
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    // First try: direct parse
    try { return JSON.parse(cleaned); } catch { /* continue */ }

    // Fix truncated JSON (missing trailing })
    if (cleaned.startsWith("{")) {
      // Strategy 1: append "}
      try { return JSON.parse(cleaned + '"}'); } catch { /* continue */ }
      // Strategy 2: append }
      try { return JSON.parse(cleaned + "}"); } catch { /* continue */ }
      // Strategy 3: drop last incomplete kv-pair + close
      const lastComma = cleaned.lastIndexOf(",");
      if (lastComma > 0) {
        try { return JSON.parse(cleaned.slice(0, lastComma) + "}"); } catch { /* continue */ }
      }
    }

    logger.warn({ event: "AI_JSON_PARSE_FAILED", content: cleaned.slice(0, 100) });
    throw new UnparseableInputError(input);
  }

  /** Validate and normalize parsed fields into NLPParsedResult. */
  private normalizeResult(parsed: any, text: string): NLPParsedResult {
    const intent = parsed.intent || "transaction";

    // Handle unknown intent — return suggestion instead of throwing
    if (intent === "unknown") {
      const suggestion = String(
        parsed.suggestion ||
          "Mình chưa hiểu ý bạn 😊 Bạn có muốn ghi một khoản chi tiêu không? Ví dụ: 'ăn tối 80k' hoặc 'nhận lương 5tr'"
      );
      logger.info({ event: "AI_INTENT_UNKNOWN", input: text, suggestion });
      return { intent: "unknown", suggestion };
    }

    // For transaction, we need amount. For creation, we need names.
    if (intent === "transaction" && !parsed.amount && !parsed.type) {
       logger.warn({ event: "AI_MISSING_TRANSACTION_FIELDS", parsed });
       throw new UnparseableInputError(text);
    }

    const amountRaw = String(parsed.amount || "0").replace(/[^0-9.]/g, "");
    const amount = new Decimal(amountRaw || "0");
    
    const type: "income" | "expense" = parsed.type === "income" ? "income" : "expense";
    const note = String(parsed.note || text).trim() || "AI processed";
    const keyword = parsed.keyword || undefined;
    const walletName = parsed.walletName || undefined;
    
    const metadata = parsed.metadata ? {
      icon: parsed.metadata.icon,
      color: parsed.metadata.color,
      initialBalance: parsed.metadata.initialBalance ? 
        new Decimal(String(parsed.metadata.initialBalance).replace(/[^0-9.]/g, "") || "0").toFixed(2) : 
        undefined,
      type: parsed.metadata.type
    } : undefined;

    logger.info({ event: "AI_PARSE_SUCCESS", intent, input: text, amount: amount.toFixed(2), type, keyword, walletName });

    return {
      intent: intent as any,
      amount: amount.toFixed(2),
      note,
      type,
      keyword,
      walletName,
      metadata
    };
  }
}
