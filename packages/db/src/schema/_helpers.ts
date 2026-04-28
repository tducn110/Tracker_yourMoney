// packages/db/src/schema/_helpers.ts
import { customType } from "drizzle-orm/mysql-core";

/**
 * [FIX #4] BigInt Safe ID Helper
 * 
 * MySQL BigInt columns in Drizzle for MySQL/TiDB only support 'number' or 'bigint' modes natively.
 * To prevent precision loss (> 2^53) while maintaining JSON serializability, we use a custom type
 * that maps the driver's BigInt value to a JS string.
 */
export const bigintSafe = (name: string) => customType<{ data: string; driverData: bigint | number | string }>({
  dataType() {
    return "bigint unsigned";
  },
  // From DB to JS
  fromDriver(value: bigint | number | string): string {
    return String(value);
  },
  // From JS to DB
  toDriver(value: string): string {
    return value;
  },
})(name);
