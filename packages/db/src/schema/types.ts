import { customType } from "drizzle-orm/pg-core";

export const bigintString = customType<{ data: string; driverParam: string | number }>({
  dataType() {
    return "bigint";
  },
  toDriver(value: string) {
    return value;
  },
  fromDriver(value: unknown) {
    return String(value);
  },
});
