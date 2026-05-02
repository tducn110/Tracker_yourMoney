// packages/api-client/src/presenters/currencyPresenter.ts
import Decimal from 'decimal.js';

export type Locale = 'vi-VN' | 'en-US';

/**
 * Chuyển đổi an toàn từ các kiểu dữ liệu khác nhau sang Decimal
 */
export function toDecimal(amount: string | number | bigint | Decimal): Decimal {
  try {
    if (amount instanceof Decimal) return amount;
    if (typeof amount === 'bigint') return new Decimal(amount.toString());
    if (typeof amount === 'string') {
      const cleaned = amount.replace(/[^0-9.-]/g, '');
      if (cleaned === '' || cleaned === '-') return new Decimal(0);
      return new Decimal(cleaned);
    }
    return new Decimal(amount || 0);
  } catch (e) {
    console.error('Error converting to Decimal:', amount, e);
    return new Decimal(0);
  }
}

/**
 * Chuyển đổi an toàn từ string hoặc bigint → bigint (số nguyên VND)
 * @deprecated Ưu tiên sử dụng toDecimal để tính toán
 */
export function toVNDBigInt(amount: string | bigint): bigint {
  if (typeof amount === 'bigint') return amount;
  const cleaned = amount.replace(/[^0-9]/g, '');
  if (cleaned === '') return BigInt(0);
  return BigInt(cleaned);
}

/**
 * Format số tiền theo locale, sử dụng Intl.NumberFormat.
 * amount có thể là string (từ API), number, bigint hoặc Decimal
 */
export function formatCurrency(
  amount: string | number | bigint | Decimal,
  locale: Locale = 'vi-VN'
): string {
  const value = toDecimal(amount).toNumber();
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format số tiền VND (mặc định cho dự án Finance Tracker)
 */
export function formatVND(amount: string | number | bigint | Decimal): string {
  return formatCurrency(amount, 'vi-VN');
}

/**
 * Nhân số tiền với tỷ lệ (dạng số thập phân), trả về Decimal.
 */
export function multiplyVND(amount: string | number | bigint | Decimal, rate: number | string | Decimal): Decimal {
  const val = toDecimal(amount);
  const r = toDecimal(rate);
  return val.times(r);
}

