// packages/db/src/client.ts
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index";
import { DrizzleTelemetryLogger, traceStorage } from "./telemetry";

export type Database = NodePgDatabase<typeof schema>;

let _db: Database | null = null;

function getDb(): Database {
  if (!_db) {
    const databaseUrl = process.env.DATABASE_URL || "";
    const censoredUrl = databaseUrl.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
    console.log(`[packages/db] Initializing DB. URL Prefix: ${censoredUrl.substring(0, 30)}...`);

    const logger = new DrizzleTelemetryLogger();
    const pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
    });
    _db = drizzle(pool, { schema, logger });
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
