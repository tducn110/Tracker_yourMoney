# Database Change Backlog — Phase 1 + Phase 2

**Purpose:** Team review of all `packages/db/` changes across Phase 1 (Schema Database) and Phase 2 (Schema Sync & Migration).  
**Generated:** 2026-04-29  
**Branch:** `dev` → `main` (PR #33)  
**Scope:** `packages/db/` — schemas, migrations, repositories, queries, scripts, config

---

## Commit Log

### 1. `2dd223e` — chore: initial framework structure
- **Author:** tducn <duc.nguyen240205@vnuk.edu.vn>
- **Date:** 2026-04-22 10:57 +0700
- **Branch:** `main`
- **Files changed:** 3 new
- **What changed:**
  - **Config:** Created `package.json` (name `@finance/db`, scripts: `db:generate`, `db:migrate`, `db:studio`, `db:push`, `typecheck`, etc.)
  - **Config:** Created `tsconfig.json` (target es2022, bundler resolution, strict mode)
  - **Config:** Created `drizzle.config.ts` (MySQL dialect, reads `DATABASE_URL` from root `.env.local`)
  - **Dependencies:** `drizzle-orm@^0.45.2`, `@tidbcloud/serverless@^0.3.0`, `mysql2@^3.22.1`
- **Risks/Notes:** None — skeleton only, no schema yet.

---

### 2. `10dd3c3` — feat(budget): implement core budget-first infrastructure (#2)
- **Author:** tducn <duc.nguyen240205@vnuk.edu.vn>
- **Date:** 2026-04-25 11:26 +0700
- **Branch:** `feature/issue-2-budget-core`
- **Files changed:** 1 new (`packages/db/src/schema/budgets.ts`)
- **What changed:**
  - **Schema — `budgets` table:**
    - `id` bigint (mode: `number`), `userId` FK → users, `name`, `icon`, `targetAmount` decimal(15,2), `periodType` enum (weekly/monthly/quarterly/yearly/custom), `startDate`, `endDate`, `isAllCategories` tinyint, `walletScope` enum (all/specific), `status` enum (active/finished), `deletedAt` (soft delete), timestamps
    - Indexes: `idx_budgets_user_status` (userId, status, deletedAt), `idx_budgets_user_period` (userId, startDate, endDate)
  - **Schema — `budget_categories` table:**
    - `id` bigint, `budgetId` FK → budgets (CASCADE), `categoryId` FK → categories (CASCADE)
    - Index: `idx_budget_categories`, unique constraint: `uq_budget_category` (budgetId, categoryId)
  - **Note:** Used `mode: "number"` for bigint IDs (inconsistent with other schemas — see Gaps section)
  - **Note:** Budgets had `deletedAt` column at this point (soft delete)
- **Risks/Notes:** `mode: "number"` for bigint — differs from other schemas using `mode: "bigint"`. Budgets supported soft delete via `deletedAt`.

---

### 3. `180fd8a` — feat(wallet): implement multi-wallet management and sync UI (#3)
- **Author:** tducn <duc.nguyen240205@vnuk.edu.vn>
- **Date:** 2026-04-25 11:32 +0700
- **Branch:** `feature/issue-3-multi-wallet`
- **Files changed:** 1 new (`packages/db/src/schema/wallet.ts`)
- **What changed:**
  - **Schema — `cash_wallet` table (v1, 1:1):**
    - `userId` PK FK → users, `initialBalance` decimal(15,2), `balance` decimal(15,2), `lastSyncedAt`, timestamps
    - CHECK constraints: `chk_cash_balance_non_negative`, `chk_cash_initial_non_negative`
  - **Schema — `cash_wallet_logs` table:**
    - `id` PK, `userId` FK → users, `balanceBefore`, `balanceAfter`, `difference`, `note`, `autoTxId` FK → transactions (SET NULL), `idempotencyKey` UNIQUE, `createdAt`
    - Index: `idx_wallet_logs_user` (userId, createdAt)
- **Risks/Notes:** This was the **1:1 cash wallet** (single wallet per user). Later replaced by multi-wallet `wallets` table in migration 0012.

---

### 4. `4d4aa58` — chore: cleanup legacy UI components and JS schemas (#15)
- **Author:** tducn <duc.nguyen240205@vnuk.edu.vn>
- **Date:** 2026-04-27 21:49 +0700
- **Branch:** `main`
- **Files changed:** 28 files in `packages/db/`
- **What changed:**
  - **Schemas — removed `.js` duplicates:**
    - Deleted: `_helpers.js`, `auth.js`, `bills.js`, `categories.js`, `extensions.js`, `goals.js`, `index.js`, `transactions.js`, `types.js`, `users.js`, `wallet.js`
    - These were JS-compiled copies of schema files — no functional change
  - **Schema — `budgets.ts`:**
    - Fixed `budgetCategoryUq` from `index()` to `unique()` (proper UNIQUE constraint)
    - Added `budget_wallets` table: `id`, `budgetId` FK → budgets, `walletId` varchar(50), with unique constraint `uq_budget_wallet`
    - Exported `BudgetWallet`, `NewBudgetWallet` types
  - **Schema — `extensions.ts`:**
    - Renamed notification type: `s2s_negative` → `budget_negative`
  - **Schema — `transactions.ts`:**
    - Updated comments: "S2S Engine" → "Budget Engine"
    - Added `source` enum values: `bill_payment`, `goal_contribution`
    - Added `deletedAt` column for soft delete
    - Added `deletedIdx` index on `deletedAt`
    - Updated `userMonthIdx` to include `deletedAt`
  - **Repositories:**
    - Added `BudgetRepository` (new file): findAll, findActive, findById, getBudgetCategories, getMultipleBudgetCategories, create, update, delete — all with `deletedAt IS NULL` filter
    - Updated `BillRepository`: `createPayment` and `findPaymentByIdempotencyKey` now accept optional `tx` parameter for transaction support
    - Updated `CategoryRepository`: added `findByName` method
    - Updated `GoalRepository`: `update` method now accepts `tx` parameter and re-queries within the same transaction for isolation
    - Updated `TransactionRepository`: comment changes only (S2S → Budget)
    - Updated `repositories/index.ts`: added `BudgetRepository` export
  - **Queries:** Comment changes only (S2S → Budget Engine)
  - **Migrations:** Added migrations 0007 and 0008 with their snapshot metadata
  - **Config:** Updated `tsconfig.json`
- **Risks/Notes:** The `budget_wallets` table added here was removed in the very next commit (9637add). The `deletedAt` column on transactions was later removed in Phase 1 schema rewrite.

---

### 5. `9637add` — chore(db): remove unused budget_wallets table (#17)
- **Author:** tducn <duc.nguyen240205@vnuk.edu.vn>
- **Date:** 2026-04-27 23:16 +0700
- **Branch:** `main`
- **Files changed:** 4 files in `packages/db/`
- **What changed:**
  - **Schema — `budgets.ts`:**
    - Removed `budget_wallets` table definition and its type exports
    - Removed `BudgetWallet`, `NewBudgetWallet` types
    - Kept `walletScope` column in `budgets` table (simple enum, still used)
  - **Migration 0009:** `DROP TABLE budget_wallets` — table was a placeholder for multi-wallet budget scoping, never had real data
- **Risks/Notes:** `cash_wallet_logs` kept (actively used by wallet-service.ts quickSync audit). Migration 0012 would later replace both `cash_wallet` and `cash_wallet_logs` with `wallets` and `wallet_logs`.

---

### 6. `4e101b2` — feat(db): update schemas for Phase 1 (Issue #26)
- **Author:** Claude <tducn@example.com>
- **Date:** 2026-04-29 01:27 +0700
- **Branch:** `26-feat-phase-1-schema-database-drizzle-orm`
- **Files changed:** 57 files in `packages/db/` (all new on this branch — aggregates all prior work + Phase 1 changes)
- **What changed:**
  - **Schemas created/updated (final Phase 1 state):**
    - `users.ts` — users table with `bigint` IDs (mode: "bigint"), `deletedAt`, full index set
    - `auth.ts` — `user_settings` (1:1 with users) + `refresh_tokens` (JWT management)
    - `categories.ts` — system + user categories, unique constraint on (userId, name)
    - `wallet.ts` — **REWRITTEN**: `wallets` table (multi-wallet) replaces `cash_wallet`; `wallet_logs` replaces `cash_wallet_logs`; added `walletId`, `transactionId`, `idempotencyKey` to logs; `deletedAt` soft delete; CHECK constraints
    - `transactions.ts` — **UPDATED**: added `walletId` FK (NOT NULL, RESTRICT), `goalId` FK (nullable, SET NULL); `idempotencyKey` UNIQUE; `source` enum includes `bill_payment`, `goal_contribution`; **removed** `deletedAt` column and `deletedIdx` index (immutable ledger); added relations (category, user, wallet, goal)
    - `bills.ts` — bills + bill_payments, `idempotencyKey` on bills and bill_payments
    - `goals.ts` — goals with 4-value status (active/completed/paused/cancelled), `idempotencyKey`, CHECK constraints with 1% tolerance
    - `budgets.ts` — budgets + budget_categories with `allocatedAmount` decimal(15,2), unique constraint on (budgetId, categoryId); **`deletedAt` column removed** from budgets
    - `extensions.ts` — notifications (10 types) + audit_logs (CRUD audit trail)
    - `_helpers.ts` — `bigintSafe` custom type helper
    - `types.ts` — `bigintString` custom type helper (redundant with `_helpers.ts` — see Gaps)
  - **Repositories created (7 files):**
    - `BaseRepository` — abstract class with DI support (`dbInstance` can be a transaction)
    - `TransactionRepository` — create, findById, findByIdempotencyKey, findAll (with category relation), findByDateRange, update, delete (hard delete)
    - `CategoryRepository` — findAll (system + user), findById, create, update, findByName, delete
    - `BillRepository` — findAll, findActive, findById, findByIdempotencyKey, create, update, delete, findPayments, sumPayments, createPayment, findPaymentByIdempotencyKey
    - `GoalRepository` — findAll, findActive, findById, findByIdempotencyKey, create, update (with tx), delete
    - `BudgetRepository` — findAll, findActive, findById, getBudgetCategories, getMultipleBudgetCategories, create (with transaction), update (with transaction), delete (hard delete)
    - `AnalyticsRepository` — getMonthlySummary, getUserConfig, getActiveBillsTotal, getActiveGoalsAllocation
  - **Queries created (2 files):**
    - `queries/transactions.ts` — `getMonthlyTransactions`, `getTransactionsPaginated` (with relational query API for nested category data)
    - `queries/summary.ts` — `getMonthlySummary`, `getUserFinancialConfig`, `getActiveBillsTotal`, `getActiveGoalsAllocation`
  - **Core:**
    - `client.ts` — dual-mode driver (MySQL TCP via mysql2 pool, TiDB HTTP via `@tidbcloud/serverless`), Proxy-based lazy initialization, slow query warning (>800ms)
    - `index.ts` — barrel export + type re-exports
    - `telemetry.ts` — DrizzleTelemetryLogger + traceStorage (AsyncLocalStorage)
  - **Scripts:** `check-status.ts`, `list-users.ts`, `seed-demouser.ts`, `sync-migration-metadata.ts`, `test-db-write.ts`
  - **Migrations:** All 12 migrations (0000-0011) + meta snapshots + journal
- **Risks/Notes:** This is the aggregate commit for Phase 1. Individual earlier commits (2dd223e, 10dd3c3, 180fd8a, 4d4aa58, 9637add) represent incremental work on `main`; this branch was the dedicated Phase 1 feature branch carrying all changes forward. Key Phase 1 changes relative to earlier commits: wallet rewrite (cash_wallet → wallets), transaction FK additions (walletId, goalId), removal of soft delete from transactions/budgets.

---

### 7. `af1542e` — feat(db): sync database schema to ERD (migration 0012)
- **Author:** Claude <tducn@example.com>
- **Date:** 2026-04-29 02:25 +0700
- **Branch:** `main`
- **Files changed:** 2 new in `packages/db/`
- **What changed:**
  - **Migration 0012** (`0012_sync_schema_to_erd.sql`, 125 lines, 31 SQL statements):
    1. Created `wallets` table (multi-wallet: id, userId, name, type enum, balance, initialBalance, icon, color, isDefault, deletedAt, lastSyncedAt, timestamps)
    2. Created `wallet_logs` table (audit trail: walletId, userId, transactionId, balanceBefore/After/Difference, note, idempotencyKey)
    3. Migrated data: `cash_wallet` rows → `wallets` (name="Cash", type="cash", isDefault=1)
    4. Migrated data: `cash_wallet_logs` rows → `wallet_logs` (walletId mapped via userId)
    5. Dropped `cash_wallet` and `cash_wallet_logs` tables (FKs dropped first)
    6. Added `wallet_id` (NOT NULL) and `goal_id` (nullable) columns to `transactions`
    7. Backfilled `wallet_id` from user's default wallet
    8. Re-added `idempotency_key` columns (UNIQUE) to `transactions`, `bills`, `bill_payments`, `goals` (reverting migration 0011 that had removed them)
    9. Added `allocated_amount` decimal(15,2) to `budget_categories` (NOT NULL DEFAULT 0.00)
    10. Created all FKs and indexes for new tables
  - **Meta:** Updated `_journal.json` with migration entries 0010, 0011, 0012
- **Risks/Notes:** This is the **production migration** — bridges the gap between the old 1:1 cash wallet DB state and the new multi-wallet Phase 1 schema. Data migration was verified: 31/31 statements executed successfully.

---

### 8. `034fab6` — Release: dev to main (Phase 1 + Phase 2) (#33)
- **Author:** ViccVuongVicc <tvbavuong@gmail.com>
- **Date:** 2026-04-29 02:55 +0700
- **Branch:** Merge `dev` → `main`
- **Files changed:** 111 files total (all packages, not just db)
- **What changed (packages/db only):**
  - Cherry-pick of `ba08c52` (migration 0012) into `dev`
  - Minor updates to `index.ts`, queries, repositories, and seed script to align with schema changes
- **Risks/Notes:** This is the final merge. Production DB now has all 14 tables matching the ERD.

---

## Current Database State (Post Phase 2)

### Tables (14 total)

| # | Table | Rows | Key Feature |
|---|-------|------|-------------|
| 1 | `users` | — | Firebase auth, soft delete via `deletedAt` |
| 2 | `user_settings` | — | 1:1 with users, financial config |
| 3 | `refresh_tokens` | — | JWT refresh token rotation |
| 4 | `wallets` | — | Multi-wallet (cash/bank/credit/e_wallet/investment/other) |
| 5 | `wallet_logs` | — | Immutable balance audit trail |
| 6 | `categories` | — | System (userId=NULL) + user categories |
| 7 | `transactions` | — | Core ledger, `walletId` NOT NULL FK, `goalId` nullable FK |
| 8 | `bills` | — | Recurring bills |
| 9 | `bill_payments` | — | Payment events (N per bill per month) |
| 10 | `goals` | — | Savings targets with 4-value status |
| 11 | `budgets` | — | Budget periods with `walletScope` |
| 12 | `budget_categories` | — | Category allocations with `allocatedAmount` |
| 13 | `notifications` | — | Phase 20 — Active (NotificationBell + 4 hooks + API routes) |
| 14 | `audit_logs` | — | Phase 8 — Active (auditMiddleware fire-and-forget) |

### Migrations Applied (13)

| # | Tag | Description |
|---|-----|-------------|
| 0000 | legal_quicksilver | Initial schema |
| 0001 | brave_ravenous | — |
| 0002 | easy_sleepwalker | — |
| 0003 | careful_squadron_supreme | — |
| 0004 | harsh_legion | — |
| 0005 | loose_umar | — |
| 0006 | crazy_night_thrasher | — |
| 0007 | sparkling_trish_tilby | Legacy cleanup |
| 0008 | groovy_deathbird | Legacy cleanup |
| 0009 | remove_budget_wallets | DROP TABLE budget_wallets |
| 0010 | hard_delete_cleanup | Hard delete migration cleanup |
| 0011 | silly_karnak | Removed idempotency_key columns (reverted by 0012) |
| 0012 | sync_schema_to_erd | Multi-wallet + FK sync + idempotency restore |

---

## Known Gaps & Issues for Review

### Critical
1. **`budgets.ts` uses `mode: "number"` for bigint** — All other schemas use `mode: "bigint"` with `unsigned: true`. This means `Budget.id` is typed as `number` while all other IDs (Transaction, Wallet, Goal, Bill) are `string`. This is a type-safety hazard — a `budgetId` passed to a function expecting `string` may silently coerce.

### Medium
2. **Dead file: `schema/types.ts`** — Defines `bigintString` but never imported. `_helpers.ts` has the live `bigintSafe` doing the same thing. Should be deleted.
3. **Duplicate logic: `queries/summary.ts` vs `repositories/analytics.repo.ts`** — `getMonthlySummary`, `getActiveBillsTotal`, `getActiveGoalsAllocation` are implemented twice. The queries version bypasses DI (calls `db` directly), the repo version uses proper dependency injection. Callers should be audited and consolidated.
4. **Hard deletes in repos contradict CLAUDE.md policy** — CLAUDE.md says "All financial records use `deleted_at` timestamps" but:
   - `transactions` — no `deletedAt` column (intentional: immutable ledger, but hard delete in repo is dangerous)
   - `bills` — no `deletedAt` column, `BillRepository.delete()` does hard DELETE
   - `goals` — no `deletedAt` column, `GoalRepository.delete()` does hard DELETE
   - `categories` — no `deletedAt` column, `CategoryRepository.delete()` does hard DELETE
   - `budgets` — had `deletedAt` in early version but removed; `BudgetRepository.delete()` does hard DELETE
   - Only `wallets` and `users` have `deletedAt` with soft delete

### Low
5. **`typedDb` getter duplicated in 6 repositories** — `return this.db as unknown as MySql2Database<typeof schema>` copy-pasted. Should be in `BaseRepository`.
6. **Date range calculation duplicated 5 times** — `"YYYY-MM"` → `startDate`/`endDate` parsing repeated in `queries/summary.ts`, `queries/transactions.ts` (2x), and `repositories/analytics.repo.ts`. Should be a shared utility.
7. **`index.ts` imports drizzle for dual-mode but `client.ts` already does** — Redundant initialization path. `index.ts` should be a pure barrel export.
8. **Migration 0011 removes idempotency_key, then 0012 re-adds it** — The round-trip happened because Phase 1 schema source files had idempotency_key, but an earlier migration removed them. 0012 restored consistency. No data loss, but migration history is confusing.

---

## Phase 1-2 Completion (2026-05-02 → 2026-05-03)

After PR #33, the remaining Phase 1 and Phase 2 items were completed:

### Migration 0014 — Indexes + audit_logs + notifications tables
- `idx_tx_user_type_date` on `transactions` (userId, type, displayDate)
- `idx_bills_user_freq` on `bills` (userId, frequency)
- `CREATE TABLE audit_logs` (if not already present)
- `CREATE TABLE notifications` (if not already present)

### Phase 8 — Audit Trail
- `apps/api/src/middleware/audit.ts` — fire-and-forget audit logging
- Mounted in `index.ts` after authMiddleware
- Logs all POST/PUT/PATCH/DELETE to `audit_logs` table

### Phase 9 — Rate Limiting
- `rateLimitMiddleware` applied to all v1 routes
- Global: 100 req/min, Auth: 10 req/min, Mutations: 30 req/min

### Phase 15 — Recurring Bills Worker
- `apps/worker/src/index.ts` — hourly cron, auto-pay with wallet deduction
- Uses DB transaction for atomic bill_payment + transaction creation

### Phase 16 — Budget-First Refactoring
- Backend: batch-computed `spent` in `getBudgets()` (3 queries for all budgets, no N+1)
- Frontend: `budgets/[id]/page.tsx` wired to real API (no mock data)
- Backend: `getBudgetDetail` returns categories with names/icons via JOIN

### Phase 17 — User Settings
- `apps/api/src/routes/user.ts` — GET/PUT /api/v1/user/settings
- `SettingsContainer.tsx` wired to `useUserSettings`/`useUpdateUserSettings`

### Phase 20 — Notification System
- `apps/api/src/routes/notifications.ts` — list, unread-count, mark-read, mark-all-read
- `NotificationBell` component in Header with real-time badge + dropdown
- `useUnreadCount` refetches every 60s

## Verification

- `cd packages/db && pnpm typecheck` — must pass
- `pnpm typecheck` — 0 errors (all 7 packages)
- `pnpm test` — 30/30 API tests passed
- Schema files match ERD (`doc/wiki/erd.md`) — verified in Phase 1
- Migration 0012 executed: 31/31 statements successful
- Migration 0014 created (pending apply)
- All 14 tables present in production TiDB
