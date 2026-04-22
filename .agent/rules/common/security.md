---
trigger: always_on
---

# Security Guidelines (S2S Finance)

## Mandatory Security Checks

Before ANY commit:
- [ ] No hardcoded secrets (API keys, passwords, tokens, JWT secrets)
- [ ] All user inputs validated with **Zod** schemas from `@finance/shared-schemas`
- [ ] SQL injection prevention: use Drizzle's parameterized queries (no string concatenation)
- [ ] XSS prevention: sanitize user-generated content; rely on React's automatic escaping
- [ ] CSRF protection: JWT stored in **HttpOnly, Secure, SameSite=Lax** cookies
- [ ] Authentication: verify JWT on every protected endpoint (Hono middleware)
- [ ] Authorization: check resource ownership (`userId`) in every query
- [ ] Rate limiting on all public and sensitive endpoints (using `rateLimitMiddleware`)
- [ ] Error messages do not leak internal details (stack traces, SQL errors)
- [ ] Financial mutations (POST/PATCH/PUT) require **Idempotency-Key** header

## Secret Management

- NEVER hardcode secrets in source code.
- Use `.env.local` for local development; never commit it.
- Production secrets via Vercel/Cloudflare environment variables.
- Validate required secrets at startup (e.g., `JWT_SECRET`, `DATABASE_URL`).
- Rotate exposed secrets immediately.

## Financial-Specific Security

### JWT Handling
- Store JWT **only** in `httpOnly`, `Secure`, `SameSite=Lax` cookies.
- Never send tokens in response body or store in `localStorage`.
- Access token expires in 15 minutes; refresh token in 30 days (stored in DB with SHA-256 hash).

### Idempotency
- All endpoints that create or modify financial records (transactions, goals, bills, wallet sync) MUST accept an `Idempotency-Key` header.
- The key is stored in the `transactions.idempotency_key` column (UNIQUE constraint) or a dedicated idempotency table within the same DB transaction.
- If a duplicate key is received, return `409 Conflict` with the existing resource ID.

### Optimistic Concurrency Control (OCC)
- For balance updates (e.g., `cash_wallet`), use a `version` column to detect concurrent modifications.
- TiDB Serverless does not support `SELECT ... FOR UPDATE` in HTTP mode; rely on OCC.
- Example: `UPDATE cash_wallet SET balance = ?, version = version + 1 WHERE user_id = ? AND version = ?`. Check affected rows.

### SQL Injection Prevention
- Always use Drizzle's query builder or parameterized SQL. Never concatenate user input into raw SQL.
- Example: `db.select().from(users).where(eq(users.email, input))` ✅

### Timing Attacks
- Use `timingSafeEqual` from `node:crypto` when comparing secrets (e.g., internal API keys, password hashes).
- The internal routes (`/api/internal/*`) already implement this.

### Audit Logging
- Log all sensitive actions (login, logout, transaction creation/deletion, settings changes) to `audit_logs` table.
- Include `userId`, `ipAddress`, `userAgent`, `action`, `resourceId`, and changes (old/new values).
- Never log passwords, tokens, or full credit card numbers.

### Impact-Driven Security Review
- **Mandatory:** Before modifying any shared utility (e.g., `finance-utils.ts`, `auth-guard.ts`), run `mcp_gitnexus_impact` to identify all callers.
- **Requirement:** If the change affects authorization logic or monetary calculations, a **security-reviewer** agent must be invoked on the affected call paths.

## Security Response Protocol

If a security issue is found:
1. **STOP** immediately and assess the impact.
2. Use **security-reviewer** agent to analyze the vulnerability.
3. Fix CRITICAL issues before continuing any development.
4. Rotate any exposed secrets (JWT secret, API keys, database passwords).
5. Review the entire codebase for similar patterns.
6. Document the incident and remediation steps.

## Pre-Deployment Checklist

- [ ] All environment variables are set in production.
- [ ] `NODE_ENV=production` is set.
- [ ] HTTPS is enforced (HSTS headers).
- [ ] Security headers are configured (`X-Content-Type-Options`, `X-Frame-Options`, `CSP` if applicable).
- [ ] Rate limiting is active and tested.
- [ ] Database migrations are applied and backward-compatible.
- [ ] Audit logging is enabled for critical actions.