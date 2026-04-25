import { customType } from "drizzle-orm/mysql-core";
export const bigintString = customType({
    dataType() {
        return "bigint unsigned";
    },
    toDriver(value) {
        return value;
    },
    fromDriver(value) {
        return String(value);
    },
});
