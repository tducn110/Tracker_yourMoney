import { db, categories } from "@finance/db";
import { eq, and, sql, like } from "@finance/db";
import type { INLPAdapter, NLPParsedResult } from "./adapters/nlp-adapter";

interface NLPResult extends NLPParsedResult {
  categoryId: number;
}

/**
 * AI Service for sophisticated language processing.
 * Delegates parsing to an INLPAdapter and handles category resolution.
 */
export class AIService {
  constructor(private readonly nlpAdapter: INLPAdapter) {}

  async parseQuickAdd(userId: string, text: string): Promise<NLPResult> {
    const parsed = this.nlpAdapter.parse(text);

    // Find best category match based on keyword hint from adapter
    const keyword = parsed.keyword || "Khác";
    const [category] = await (db as any)
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          like(categories.name, `%${keyword}%`),
        )
      )
      .limit(1);

    return {
      ...parsed,
      categoryId: category?.id ?? 11, // Fallback to Misc
    };
  }
}

