// packages/db/src/constants/system-categories.ts
//
// Source of truth for system-defined category names.
// Use these constants instead of hardcoded strings anywhere in the codebase.
// When system categories need to be seeded/queried, always reference this file.

export const SYSTEM_CATEGORY_NAMES = {
  /** Savings / Goal contribution category — type "both" (neutral to net worth) */
  SAVINGS: "Tiết Kiệm",

  /** Default fallback income category */
  INCOME: "Thu Nhập",

  /** Default fallback expense category */
  FOOD: "Ăn Uống",

  /** Bill payment default category */
  BILLS: "Hóa Đơn",
} as const;

export type SystemCategoryName =
  (typeof SYSTEM_CATEGORY_NAMES)[keyof typeof SYSTEM_CATEGORY_NAMES];

/**
 * Default shape used to auto-create the Savings system category if not found.
 * The `userId` field is intentionally omitted — caller must supply it for
 * user-scoped categories, or pass null for global system categories.
 */
export const SAVINGS_CATEGORY_DEFAULTS = {
  name: SYSTEM_CATEGORY_NAMES.SAVINGS,
  /** "both" keeps the transaction type neutral — does not reduce net worth */
  type: "both" as const,
  icon: "🎯",
  color: "#10B981",
  isDefault: false,
  sortOrder: 99,
} satisfies {
  name: string;
  type: "income" | "expense" | "both";
  icon: string;
  color: string;
  isDefault: boolean;
  sortOrder: number;
};
