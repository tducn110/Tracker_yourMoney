import { type Transaction } from '../types';

export type SafeTransaction = Transaction;

export function isSafeTransaction(obj: unknown): obj is SafeTransaction {
  if (typeof obj !== 'object' || obj === null) return false;
  const t = obj as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.amount === 'string' &&
    (typeof t.note === 'string' || t.note === null) &&
    typeof t.date === 'string'
  );
}

export function validateAmountString(amount: unknown): asserts amount is string {
  if (typeof amount !== 'string') {
    throw new TypeError(`Amount must be a string, received ${typeof amount}`);
  }
  if (!/^\d+$/.test(amount)) {
    throw new Error(`Amount must contain only digits, got "${amount}"`);
  }
}
