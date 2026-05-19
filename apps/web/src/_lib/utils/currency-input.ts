export type CurrencyInputLocale = 'vi-VN' | 'en-US';

const GROUP_SEPARATORS: Record<CurrencyInputLocale, string> = {
  'vi-VN': '.',
  'en-US': ',',
};

export function parseCurrencyInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  return String(Number.parseInt(digits, 10));
}

export function formatCurrencyInput(
  value: string | number | null | undefined,
  locale: CurrencyInputLocale = 'vi-VN',
): string {
  const raw = parseCurrencyInput(value);
  if (!raw) return '';

  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATORS[locale]);
}

