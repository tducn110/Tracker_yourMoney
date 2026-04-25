// packages/db/src/telemetry.ts
import { AsyncLocalStorage } from "node:async_hooks";
import { Logger } from "drizzle-orm/logger";

export interface TraceContext {
  correlationId: string;
}

// ── ASYNC LOCAL STORAGE ────────────────────────────────────────────
// Stores the correlationId for the duration of a request, 
// allowing the Drizzle logger to access it without passing it manually.
export const traceStorage = new AsyncLocalStorage<TraceContext>();

// ── CUSTOM DRIZZLE LOGGER ──────────────────────────────────────────
export class DrizzleTelemetryLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    const context = traceStorage.getStore();
    const correlationId = context?.correlationId || "system";
    
    // In production, we might want to redact params or use a structured logger (pino)
    const startTime = performance.now();
    
    // We wrap the actual logging in a way that captures execution time 
    // by monkey-patching or using a more sophisticated approach.
    // For now, we just log the query and intent.
    
    // To measure execution time, we need to know when the query finished.
    // Drizzle's Logger.logQuery is called BEFORE execution.
    // So we log the start, and we'll rely on the DB driver's logs or 
    // a wrapper if we need precise latency tracking in Drizzle logs.
    console.log(JSON.stringify({
      event: "DB_QUERY_START",
      correlationId,
      query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
      timestamp: new Date().toISOString()
    }));
  }
}
