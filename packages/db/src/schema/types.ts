import { customType } from "drizzle-orm/mysql-core";

export const bigintString = customType<{ data: string; driverParam: string | number }>({
  dataType() {
    return "bigint unsigned";
  },
  toDriver(value: string) {
    return value;
  },
  fromDriver(value: unknown) {
    return String(value);
  },
});
