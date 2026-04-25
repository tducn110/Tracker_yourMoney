/**
 * Finance Utilities — Budget Management
 * Centralized logic for transaction processing, icons, and formatting.
 */

export interface IconMappingSource {
  icon?: string;
  type: 'income' | 'expense' | 'transfer';
  category?: string | { name: string };
  note?: string;
}

/**
 * Maps categories or keywords to appropriate emojis/icons.
 * Centralized to avoid hydration issues and redundant logic.
 */
const CATEGORY_ICON_MAP: Record<string, string> = {
  "Thu Nhập": "💰",
  "Ăn Uống": "🍔",
  "Đồ Uống": "🥤",
  "Di Chuyển": "🚗",
  "Xăng xe": "⛽",
  "Nhà Ở": "🏠",
  "Tiết Kiệm": "🏦",
  "Sức Khỏe": "🏥",
  "Mua Sắm": "🛍️",
  "Giải Trí": "🎮",
  "Giáo Dục": "📚",
  "Khác": "📦",
};

export const getTransactionIcon = (tx: IconMappingSource): string => {
  // 1. Priority: Explicit icon from database/mock
  if (tx.icon) return tx.icon;

  // 2. Map by Category name
  const categoryName = typeof tx.category === 'object' ? tx.category.name : tx.category;
  if (categoryName && CATEGORY_ICON_MAP[categoryName]) {
    return CATEGORY_ICON_MAP[categoryName];
  }

  // 3. Fallback by Type
  if (tx.type === 'income') return '💰';
  
  // 4. Default for entry
  return '💸';
};
