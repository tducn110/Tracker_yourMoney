// apps/api/src/lib/logger.ts
// Structured Pino logger — JSON output survives Vercel Function Logs
// Usage: logger.info({ event, ... }) | logger.error({ event, err })
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // In production, output pure JSON for Vercel to capture
  // In development, use pretty-print for readability
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } }
      : undefined,
  base: {
    service: "finance-api",
    env: process.env.NODE_ENV || "development",
  },
  // Redact sensitive fields — never log PII
  redact: {
    paths: ["*.password", "*.passwordHash", "*.token", "*.refreshToken", "*.authorization"],
    censor: "[REDACTED]",
  },
});

// ── Error classification helpers ─────────────────────────────────────────────
// Operational errors = expected at runtime (validation, not found, conflict)
// Programmer errors = unexpected bugs (DB crash, schema mismatch, null deref)

export function isOperationalError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("er_dup_entry") ||
    msg.includes("not_found") ||
    msg.includes("validation") ||
    msg.includes("unauthorized") ||
    msg.includes("forbidden")
  );
}

export function logRequest(
  event: string,
  path: string,
  method: string,
  correlationId: string,
  extra?: Record<string, unknown>
) {
  logger.info({ event, path, method, correlationId, ...extra });
}

export function logError(
  err: unknown,
  path: string,
  method: string,
  correlationId: string
) {
  const isOperational = isOperationalError(err);
  const logLevel = isOperational ? "warn" : "error";
  const errObj = err instanceof Error ? err : new Error(String(err));
  const cause = errObj.cause instanceof Error
    ? {
        message: errObj.cause.message,
        name: errObj.cause.name,
      }
    : undefined;

  logger[logLevel]({
    event: isOperational ? "OPERATIONAL_ERROR" : "PROGRAMMER_ERROR",
    path,
    method,
    correlationId,
    err: {
      message: errObj.message,
      // Only include stack trace for programmer errors
      stack: isOperational ? undefined : errObj.stack,
      name: errObj.name,
      cause,
    },
  });
}
