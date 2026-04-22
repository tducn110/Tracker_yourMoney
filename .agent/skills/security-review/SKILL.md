name: security-review
description: Use this skill when adding authentication, handling user input, working with secrets, creating API endpoints, or implementing financial features. Provides a comprehensive security checklist tailored for S2S Finance.
origin: ECC (modified for S2S Finance)
display_name: "Security Review"
short_description: "Security checklist: secrets, input validation, injection prevention, financial safeguards"
brand_color: "#EF4444"
default_prompt: "Run security checklist: secrets, input validation, injection prevention, idempotency"
allow_implicit_invocation: true
---

# Security Review Skill (S2S Finance)

This skill ensures all code follows security best practices and identifies potential vulnerabilities specific to our stack: Next.js, Hono, TiDB Serverless, Drizzle, and financial data handling.

## When to Activate

- Implementing authentication or authorization
- Handling user input or file uploads
- Creating new API endpoints
- Working with secrets or credentials
- Implementing financial transactions or S2S calculations
- Storing or transmitting sensitive data

## Security Checklist

### 1. Secrets Management

#### ❌ NEVER Do This
```typescript
const apiKey = "sk-proj-xxxxx"  // Hardcoded secret
const dbPassword = "password123" // In source code
```

#### ✅ ALWAYS Do This
```typescript
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

// Verify secrets exist at startup
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

**Verification Steps:**
- [ ] No hardcoded API keys, tokens, or passwords
- [ ] All secrets in environment variables (`.env.local` excluded from git)
- [ ] Production secrets stored in Vercel Environment Variables

### 2. Input Validation

All inputs MUST be validated with Zod schemas from `@finance/shared-schemas`.

```typescript
import { insertTransactionSchema } from '@finance/shared-schemas'

export async function POST(c: Context) {
  const body = await c.req.json()
  const parsed = insertTransactionSchema.safeParse(body)
  if (!parsed.success) {
    return err(c, 422, 'VALIDATION_ERROR', 'Invalid input', parsed.error.issues)
  }
  // parsed.data is safe and typed
}
```

**Verification Steps:**
- [ ] All API endpoints use Zod validation (preferably via `@hono/zod-validator`)
- [ ] No direct use of user input in database queries
- [ ] Error messages do not leak internal details

### 3. SQL Injection Prevention

Use Drizzle's parameterized queries. **Never concatenate strings into SQL.**

```typescript
// ✅ CORRECT
const user = await db.query.users.findFirst({
  where: eq(users.email, email)
})

// ❌ WRONG
const query = `SELECT * FROM users WHERE email = '${email}'`
```

### 4. Authentication & Authorization

- **JWT Storage**: Tokens MUST be stored in **HttpOnly, Secure, SameSite=Lax** cookies (see `apps/api/src/lib/jwt.ts` and `auth-guard.ts`).
- **Authorization**: Every protected endpoint must use `authMiddleware` and scope queries by `userId`.

```typescript
// In repository
.where(eq(transactions.userId, userId))
```

### 5. Financial Transaction Security

- **Idempotency Keys**: All POST/PATCH endpoints that modify financial data (transactions, bills, goals, wallet) MUST require an `Idempotency-Key` header and store it in the database to prevent duplicate processing.
- **Optimistic Concurrency Control (OCC)**: For balance updates (e.g., cash wallet), use a `version` column instead of `SELECT ... FOR UPDATE` (not supported on TiDB HTTP driver).

### 6. Rate Limiting

Apply rate limiting on all public endpoints and sensitive operations.

```typescript
// apps/api/src/middleware/rate-limit.ts
app.use('/api/v1/transactions/quick', rateLimitMiddleware({ limit: 10, windowMs: 60_000 }))
```

### 7. Sensitive Data Exposure

- **Logging**: Use `pino` with redaction (see `apps/api/src/lib/logger.ts`). Never log passwords, tokens, or full financial details.
- **Error Messages**: Return generic messages to clients; log detailed errors internally.

## Pre-Deployment Security Checklist

Before ANY production deployment:

- [ ] **Secrets**: No hardcoded secrets; all in Vercel env vars
- [ ] **Input Validation**: All endpoints have Zod validation
- [ ] **SQL Injection**: All DB queries use Drizzle's safe methods
- [ ] **XSS**: React's auto-escaping relied upon; user HTML sanitized if used
- [ ] **Auth**: JWT in HttpOnly cookies; refresh token hashed in DB
- [ ] **Authorization**: All queries scoped by `userId`
- [ ] **Rate Limiting**: Enabled on auth and transaction endpoints
- [ ] **HTTPS**: Enforced (Vercel default)
- [ ] **Security Headers**: Configured in `apps/api/src/middleware/security-headers.ts`
- [ ] **Error Handling**: No stack traces in responses
- [ ] **Dependencies**: `pnpm audit` clean
- [ ] **Idempotency**: Enforced for financial mutations

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Hono Security Best Practices](https://hono.dev/docs/guides/middleware#built-in-middleware)
- [TiDB Security](https://docs.pingcap.com/tidb/stable/security-compatibility)

---
**Remember**: In a financial application, security is not optional. One vulnerability can compromise user funds and trust.
```

