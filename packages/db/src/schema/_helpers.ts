// packages/db/src/schema/_helpers.ts
import { customType } from "drizzle-orm/pg-core";

/**
 * BigInt Safe ID Helper — PostgreSQL edition
 *
 * PostgreSQL bigint maps to JS number natively via pg,
 * but we want strings for JSON serialization safety.
 */
export const bigintSafe = (name: string) => customType<{ data: string; driverData: string | number }>({
  dataType() {
    return "bigint";
  },
  // From DB to JS
  fromDriver(value: string | number): string {
    return String(value);
  },
  // From JS to DB
  toDriver(value: string): string {
    return value;
  },
})(name);
