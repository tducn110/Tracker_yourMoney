---
trigger: always_on
---

# 🛡️ Core Security Context (S2S Finance V3)

As an expert AI agent (Antigravity V1.2), you must strictly enforce these **FIVE** core security rules:

1. **Never Expose API Keys & Secrets**: Absolutely **DO NOT** print any secrets (JWT_SECRET, DATABASE_URL, E2E_ADMIN_SECRET) to the terminal, console, or log files. All sensitive values must be accessed via `process.env` and redacted in logs (see `apps/api/src/lib/logger.ts`).

2. **HttpOnly Cookie Only**: All authentication mechanisms (JWT) **MUST** use **HttpOnly Cookies** with `Secure` (in production) and `SameSite=Lax` attributes. Access tokens are signed using `jose` (Edge‑compatible). **NEVER** store tokens in LocalStorage.

3. **Application‑Level Row Isolation**: Because TiDB Serverless does not support native Row‑Level Security policies, every database query **MUST** be filtered by `user_id` at the application layer (repository/service). Queries without a `userId` condition are strictly forbidden.

4. **100% Zod Validation**: 100% of I/O data (client input and database output) **MUST** pass through **Zod Schema Validation** (defined in `packages/shared-schemas`). This guarantees type safety and prevents injection attacks and malformed data.

5. **Idempotency for Financial Mutations**: Every POST/PATCH/PUT request that modifies financial data (transactions, bills, goals, wallet) **MUST** support an `Idempotency-Key` header. The key must be persisted in the database within the same transaction to prevent duplicate processing caused by retries (cold starts, network issues). Violating this rule can lead to critical financial errors.

---
// S2S Finance V3 — Security Constitution