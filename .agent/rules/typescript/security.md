---
trigger: always_on
---

paths:
  - "**/*.ts"
  - "**/*.tsx"
---
# TypeScript/JavaScript Security (S2S Finance)

> This file extends [common/security.md](../common/security.md) with TypeScript/JavaScript specific content.

## Secret Management

Never hardcode secrets. Use environment variables validated at startup.

```typescript
// NEVER: Hardcoded secrets
const apiKey = "sk-proj-xxxxx"

// ALWAYS: Environment variables with validation
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

## JWT Token Handling

Tokens must be stored in **HttpOnly cookies** only. Never expose them in response bodies or localStorage.

```typescript
// Backend: Set HttpOnly cookie with Hono
import { setCookie } from 'hono/cookie'

setCookie(c, 'access_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax',
  maxAge: 15 * 60, // 15 minutes
  path: '/',
})

// Frontend: Never read token manually. Browser sends it automatically.
// All API calls use `withCredentials: true`.
```

## Input Validation with Zod

All user input must be validated with Zod schemas from `@finance/shared-schemas`. Use `safeParse` for graceful error handling.

```typescript
import { insertTransactionSchema } from '@finance/shared-schemas'

export async function POST(c: Context) {
  const body = await c.req.json()
  const parsed = insertTransactionSchema.safeParse(body)

  if (!parsed.success) {
    return err(c, 422, 'VALIDATION_ERROR', 'Invalid input', parsed.error.issues)
  }

  // parsed.data is fully typed and safe
  const tx = await service.create(parsed.data)
  return created(c, tx)
}
```

## SQL Injection Prevention

Always use Drizzle's parameterized queries. Never concatenate user input into SQL strings.

```typescript
// ✅ CORRECT: Parameterized query
const user = await db.query.users.findFirst({
  where: eq(users.email, email)
})

// ❌ WRONG: String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`
```

## Safe Logging

Use structured logging with `pino` and redact sensitive fields.

```typescript
// apps/api/src/lib/logger.ts
export const logger = pino({
  redact: {
    paths: ['*.password', '*.passwordHash', '*.token', '*.authorization'],
    censor: '[REDACTED]',
  },
})

// Usage
logger.info({ userId, action: 'login' }) // Safe
logger.info({ password: 'secret' }) // Automatically redacted
```

## Idempotency Keys

All financial mutations must accept an `Idempotency-Key` header and store it in the database.

```typescript
// Route handler
const idempotencyKey = c.req.header('Idempotency-Key')
if (!idempotencyKey) {
  return err(c, 400, 'MISSING_IDEMPOTENCY_KEY', 'Idempotency-Key header required')
}

// Check for existing transaction with this key
const existing = await repo.findByIdempotencyKey(idempotencyKey)
if (existing) {
  return ok(c, existing) // Return cached result
}

// Create new transaction with idempotencyKey
const tx = await repo.create({ ...data, idempotencyKey })
```

