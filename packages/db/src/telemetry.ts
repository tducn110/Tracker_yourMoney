// packages/db/src/telemetry.ts
import { AsyncLocalStorage } from "node:async_hooks";
import { Logger } from "drizzle-orm/logger";
import pino from "pino";

export interface TraceContext {
  correlationId: string;
}

// ── ASYNC LOCAL STORAGE ────────────────────────────────────────────
// Stores the correlationId for the duration of a request,
// allowing the Drizzle logger to access it without passing it manually.
export const traceStorage = new AsyncLocalStorage<TraceContext>();

// Package-level telemetry logger — structured JSON, not raw console output
const telemetryLogger = pino({
  name: "packages/db/telemetry",
  level: process.env.LOG_LEVEL || "info",
});

// ── CUSTOM DRIZZLE LOGGER ──────────────────────────────────────────
// NOTE: Drizzle's Logger.logQuery is called BEFORE query execution,
// so we log query start. Slow-query detection is handled in client.ts.
export class DrizzleTelemetryLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    const context = traceStorage.getStore();
    const correlationId = context?.correlationId || "system";

    telemetryLogger.debug(
      {
        event: "DB_QUERY_START",
        correlationId,
        query: query.length > 100 ? `${query.substring(0, 100)}...` : query,
        paramCount: params.length,
      },
      "DB query"
    );
  }
}
