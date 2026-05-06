// packages/db/src/client.ts
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import pino from "pino";
import * as schema from "./schema/index";
import { DrizzleTelemetryLogger, traceStorage } from "./telemetry";

export type Database = NodePgDatabase<typeof schema>;

// Lightweight package-level logger — does not import from apps/api to avoid circular deps
const dbLogger = pino({
  name: "packages/db",
  level: process.env.LOG_LEVEL || "info",
});

let _db: Database | null = null;

function getDb(): Database {
  if (!_db) {
    const databaseUrl = process.env.DATABASE_URL || "";
    const censoredUrl = databaseUrl.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
    dbLogger.info({ event: "DB_INIT", urlPrefix: censoredUrl.substring(0, 30) }, "Initializing DB connection pool");

    const telemetryLogger = new DrizzleTelemetryLogger();
    const pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
    });
    _db = drizzle(pool, { schema, logger: telemetryLogger });
  }
  return _db as Database;
}

export const db = new Proxy({} as Database, {
  get(_, prop) {
    const database = getDb();
    const original = Reflect.get(database, prop);

    if (typeof original === "function") {
      return (...args: unknown[]) => {
        const start = performance.now();
        const result = (original as (...a: unknown[]) => unknown).apply(database, args);

        if (result instanceof Promise) {
          return result.finally(() => {
            const duration = performance.now() - start;
            if (duration > 800) {
              const context = traceStorage.getStore();
              dbLogger.warn(
                {
                  event: "DB_SLOW_QUERY",
                  traceId: context?.correlationId || "system",
                  method: String(prop),
                  durationMs: Math.round(duration),
                },
                "Slow database query detected"
              );
            }
          });
        }
        return result;
      };
    }

    return original;
  },
});
