// packages/db/src/client.ts
import { connect } from "@tidbcloud/serverless";
import { drizzle as drizzleServerless, TiDBServerlessDatabase } from "drizzle-orm/tidb-serverless";
import { drizzle as drizzleMysql2, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema/index";
import { DrizzleTelemetryLogger, traceStorage } from "./telemetry";

export type Database = MySql2Database<typeof schema>;

let _db: Database | null = null;

function getDb(): Database {
  if (!_db) {
    const databaseUrl = process.env.DATABASE_URL || "";
    const isTcp = databaseUrl.startsWith("mysql://");
    
    const censoredUrl = databaseUrl.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
    console.log(`[packages/db] Initializing DB. Protocol Check: ${isTcp ? 'TCP' : 'HTTP/Fetch'}. URL Prefix: ${censoredUrl.substring(0, 20)}...`);

    const logger = new DrizzleTelemetryLogger();

    if (isTcp) {
      const connection = mysql.createPool(databaseUrl);
      _db = drizzleMysql2(connection, { schema, mode: "default", logger });
    } else {
      const connection = connect({ url: databaseUrl });
      _db = drizzleServerless(connection, { schema, logger }) as unknown as Database;
    }
  }
  return _db as Database;
}

export const db = new Proxy({} as Database, {
  get(_, prop) {
    const database = getDb();
    const original = Reflect.get(database, prop);

    if (typeof original === "function") {
      return (...args: any[]) => {
        const start = performance.now();
        const result = original.apply(database, args);

        if (result instanceof Promise) {
          return result.finally(() => {
            const duration = performance.now() - start;
            if (duration > 800) {
              const context = traceStorage.getStore();
              console.warn(
                `[DB_SLOW_QUERY] [TraceID: ${context?.correlationId || "system"}] ` +
                `Method: ${String(prop)} | Duration: ${duration.toFixed(2)}ms`
              );
            }
          });
        }
        return result;
      };
    }

    return original;
  }
});
