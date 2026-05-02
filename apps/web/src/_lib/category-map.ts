/**
 * Category Map — Frontend slug → Backend category ID resolver
 *
 * Translates the hardcoded category slugs from QuickAddModal/SimpleQuickInput
 * to real backend category IDs fetched from the API.
 *
 * Seed categories (DB):
 *   "Thu Nhập" (income), "Ăn Uống", "Đồ Uống", "Di Chuyển",
 *   "Nhà Ở", "Tiết Kiệm", "Khác"
 */

import type { Category } from '@finance/api-client';

// ── Slug → Backend category name lookup ───────────────────────────────
// Frontend slugs from QuickAddModal & SimpleQuickInput → expected DB name
const SLUG_TO_NAME: Record<string, string> = {
  // Expense (QuickAddModal slugs)
  food:          'Ăn Uống',
  shopping:      'Mua Sắm',
  transport:     'Di Chuyển',
  home:          'Nhà Ở',
  bills:         'Hóa Đơn',
  health:        'Sức Khỏe',
  entertainment: 'Giải Trí',
  education:     'Giáo Dục',
  utilities:     'Tiện ích',
  drinks:        'Đồ Uống',

  // Income (QuickAddModal slugs)
  salary:     'Thu Nhập',
  bonus:      'Thưởng',
  freelance:  'Freelance',
  investment: 'Đầu Tư',
  business:   'Kinh Doanh',
  selling:    'Bán Hàng',
  loan_back:  'Cho Vay Trả',

  // Fallback
  other:    'Khác',
  other_in: 'Khác',
};

/**
 * Resolve a frontend category slug to a backend category ID.
 *
 * @param slug - Frontend slug from the form (e.g. "food", "salary")
 * @param type - Transaction type for fallback
 * @param categories - Categories fetched from the API
 * @returns Backend numeric category ID
 */
export function resolveCategoryId(
  slug: string,
  type: 'income' | 'expense',
  categories: Category[],
): number {
  // 1. Try exact name match via slug mapping
  const targetName = SLUG_TO_NAME[slug];
  if (targetName) {
    // Case-insensitive match (DB has "Ăn Uống" but might differ)
    const match = categories.find(
      (c) => c.name.toLowerCase() === targetName.toLowerCase() && (c.type === type || c.type === 'both'),
    );
    if (match) return match.id;
  }

  // 2. Try partial name match (e.g. "Mua Sắm" contains "Mua")
  if (targetName) {
    const parts = targetName.toLowerCase().split(' ');
    for (const part of parts) {
      if (part.length < 2) continue;
      const match = categories.find(
        (c) => c.name.toLowerCase().includes(part) && (c.type === type || c.type === 'both'),
      );
      if (match) return match.id;
    }
  }

  // 3. Fallback: first category matching the transaction type
  const typeMatch = categories.find((c) => c.type === type || c.type === 'both');
  if (typeMatch) return typeMatch.id;

  // 4. Last resort: first category overall
  if (categories.length > 0) return categories[0].id;

  // 5. Edge case: no categories at all → default to 1
  return 1;
}
