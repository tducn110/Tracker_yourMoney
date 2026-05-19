import Decimal from "decimal.js";

export interface NLPParsedResult {
  intent?: "transaction" | "create_wallet" | "create_category" | "command" | "unknown";
  amount?: string;
  note?: string;
  type?: "income" | "expense";
  keyword?: string; // Hint for category matching
  walletName?: string; // Hint for wallet matching
  /** Human-readable suggestion returned when intent is "unknown" */
  suggestion?: string;
  metadata?: {
    icon?: string;
    color?: string;
    initialBalance?: string;
    type?: string;
    [key: string]: any;
  };
}

/**
 * Interface for Natural Language Processing adapters.
 * Allows switching between Regex, OpenAI, or other LLMs.
 */
export interface INLPAdapter {
  parse(text: string): NLPParsedResult;
}

/**
 * Custom error for when input cannot be parsed.
 * Should result in a 422 Unprocessable Entity response.
 */
export class UnparseableInputError extends Error {
  constructor(public readonly input: string) {
    super(`Could not parse transaction from input: "${input}"`);
    this.name = "UnparseableInputError";
  }
}

/**
 * Concrete implementation using Regex.
 * Optimized for Vietnamese currency units (k, triệu, ngàn).
 */
export class RegexNLPAdapter implements INLPAdapter {
  parse(text: string): NLPParsedResult {
    const normalized = text.toLowerCase().trim();

    // Regex to extract numbers like "30k", "500.000", "50k", "1.5tr", "1k5", "100đ"
    // Group 1: Main amount
    // Group 2: Unit suffix
    // Group 3: Optional fractional part (e.g., the '5' in '1k5')
    const amountMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(triệu|tr|k|ngàn|nghìn|đ|vnd)?\s*(\d+)?/i);
    
    if (!amountMatch) {
      throw new UnparseableInputError(text);
    }

    const mainPart = amountMatch[1].replace(/[.,](?=\d{3}(?:[.,]|$))/g, "").replace(/,/g, ".");
    const unitPart = amountMatch[2]?.toLowerCase();
    const fracPart = amountMatch[3];

    let multiplier = 1;
    if (unitPart === "k" || unitPart === "ngàn" || unitPart === "nghin") multiplier = 1000;
    if (unitPart === "tr" || unitPart === "triệu") multiplier = 1000000;
    if (unitPart === "đ" || unitPart === "vnd") multiplier = 1;

    let totalAmount = new Decimal(mainPart).times(multiplier);

    // Handle compound units like "1k5" or "2tr5"
    if (fracPart && multiplier > 1) {
      const fracValue = new Decimal(fracPart);
      // Determine fraction scale based on digits: 1k5 -> 5 is hundreds (10^2)
      // Multiplier 1000 (k) -> 5 should be 500 -> fracValue * (1000 / 10^len)
      const fracMultiplier = multiplier / Math.pow(10, fracPart.length);
      totalAmount = totalAmount.plus(fracValue.times(fracMultiplier));
    }

    const amount = totalAmount.toFixed(2);
    const notePart = text.replace(amountMatch[0], "").trim();
    const note = notePart || "Quick add";

    // Basic heuristic for type and category keyword
    let type: "expense" | "income" = "expense";
    let keyword = "Khác";

    // Priority matching with word boundaries to avoid partial matches (e.g., "xăng" matching "ăn")
    const isIncome = /(?:^|[^\p{L}])(lương|thưởng|thu nhập)(?:[^\p{L}]|$)/iu.test(normalized);
    const isFood = /(?:^|[^\p{L}])(ăn|uống|cafe|cà phê|phở|bún|cơm|quán)(?:[^\p{L}]|$)/iu.test(normalized);
    const isTransport = /(?:^|[^\p{L}])(xăng|xe|grab|be|taxi|bus|đi lại|di chuyển)(?:[^\p{L}]|$)/iu.test(normalized);

    if (isIncome) {
      type = "income";
      keyword = "Lương";
    } else if (isFood) {
      keyword = "Ăn uống";
    } else if (isTransport) {
      keyword = "Di chuyển";
    }

    return {
      amount,
      note,
      type,
      keyword
    };
  }
}
