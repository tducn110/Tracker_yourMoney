# CLAUDE.md

This file provides guidance to Claudex when working with code in this repository.

## Monorepo (Turborepo + pnpm)

- `apps/api` — Hono REST API (port 3001), stateless handlers, Firebase auth
- `apps/web` — Next.js 15 App Router dashboard (port 3000), TanStack Query, shadcn/ui + Tailwind
- `packages/db` — Drizzle ORM schema, migrations, repositories
- `packages/shared-schemas` — Zod validation schemas shared by API and Web
- `packages/api-client` — Typed Axios-based API client consumed by the frontend
- `packages/cache` — In-memory cache used by the API

## Commands

```bash
pnpm dev              # Start all apps (turbo dev)
pnpm build            # Build all
pnpm lint             # ESLint all
pnpm typecheck        # tsc --noEmit all
pnpm test             # Run all tests (vitest for API, playwright for web)

# Run a single API test
cd apps/api && npx vitest run path/to/test.test.ts

# Run a single Playwright test
cd apps/web && npx playwright test -g "test name"

# DB operations (run from packages/db)
cd packages/db && pnpm db:generate   # Generate Drizzle migrations from schema changes
cd packages/db && pnpm db:migrate    # Apply pending migrations
cd packages/db && pnpm db:seed       # Seed demo data
cd packages/db && pnpm db:studio     # Open Drizzle Studio
cd packages/db && pnpm db:status     # Check infrastructure health

# Local MySQL via Docker (alternative to TiDB)
docker-compose up -d
```

## Architecture

### Request lifecycle
Correlation ID middleware → Auth middleware (Firebase session cookie via `jose`) → Zod validation (`@hono/zod-validator`) → Route → Service → Repository (Drizzle) → TiDB

### Service layer & DI
All services are wired in `apps/api/src/services/container.ts`. Routes import proxy wrappers (e.g., `transactionService`, `billService`) that delegate to the container singleton. The container supports `initialize(dbInstance)` for test isolation.

### Money handling (critical)
- Database columns are `DECIMAL(15,2)`
- JSON transport uses **strings** for monetary values (never floats)
- All arithmetic uses `Decimal.js`, not native JS numbers
- Display formatting uses `Intl.NumberFormat`

### Idempotency
All mutations (`POST`, `PUT`, `DELETE`) require an `Idempotency-Key` header. Keys are stored with a UNIQUE constraint in the DB. Duplicate requests return 409 or the cached result — this defends against serverless cold-start retries.

### Soft delete
All financial records use `deleted_at` timestamps rather than physical deletion. Ledger entries (`transactions`) are immutable events.

### Bill & Goal financial integrity
`BillService.payBill()` and `GoalService.contribute()` are wrapped in `db.transaction()`. Each mutation atomically creates a corresponding ledger entry (`transactions` table) with the appropriate `source` field (`bill_payment` or `goal_contribution`).

### Environment
- `.env` and `.env.local` are loaded via `dotenv` only in non-production. In production, env vars must be injected by the platform.
- Required vars: `DATABASE_URL`, `FIREBASE_*`, `JWT_SECRET`, `E2E_ADMIN_SECRET`
- `E2E_ADMIN_SECRET` — used by test/internal routes to bypass auth (test-only). Internal routes are only mounted when `NODE_ENV=test`.
- Sentry is lazy-loaded only when `SENTRY_DSN` is set.
- BigInt serialization is polyfilled globally for TiDB IDs.
