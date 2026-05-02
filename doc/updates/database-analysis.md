# Database Analysis Report — Finance Tracker V3

**Date:** 2026-04-29  
**Scope:** `packages/db/` directory (schema, migrations, repositories, queries)  
**Method:** Cross-referenced schema source files ↔ 11 SQL migrations ↔ repository/query code ↔ service layer DB references

---

## 1. ERD Correctness

### 1.1 Schema-vs-Database Drift (FATAL)

The **source schema files** in `packages/db/src/schema/` have diverged from the **actual database** (represented by the last migration snapshot `0011_silly_karnak`).

| Entity | Schema Source | Actual DB (post-migration 0011) | Status |
|--------|--------------|------|--------|
| Wallet table | `wallets` (multi-wallet, 13 columns) | `cash_wallet` (1:1, 6 columns) | **FATAL MISMATCH** |
| Wallet logs | `wallet_logs` (11 columns, FK to wallets) | `cash_wallet_logs` (8 columns, FK to cash_wallet) | **FATAL MISMATCH** |
| Transactions | Has `wallet_id` NOT NULL FK, `goal_id` nullable FK | NO `wallet_id`, NO `goal_id` | **SCHEMA/DB DRIFT** |
| Budget categories | Has `allocated_amount` DECIMAL(15,2) | NO `allocated_amount` | **SCHEMA/DB DRIFT** |

**Root cause:** Phase 1 changes were made to schema source files but **no migration was generated** to evolve the DB from `cash_wallet` → `wallets`, add `wallet_id`/`goal_id` to transactions, or add `allocated_amount` to budget_categories. Running `pnpm db:generate` will produce a migration, but applying it on a DB with existing data would be **destructive** without careful data migration.

### 1.2 ERD-vs-Schema Comparison

Reference ERD: `doc/wiki/erd.md`

| ERD Entity | Schema Table | Match? | Gaps |
|------------|-------------|--------|------|
| USERS | `users` | OK | — |
| USER_SETTINGS | `user_settings` | OK | — |
| WALLETS | `wallets` | OK (schema only) | Not in DB yet |
| WALLET_LOGS | `wallet_logs` | OK (schema only) | Not in DB yet |
| CATEGORIES | `categories` | OK | `both` type exists |
| TRANSACTIONS | `transactions` | **Partial** | walletId, goalId in schema but not DB |
| BILLS | `bills` | OK | — |
| BILL_PAYMENTS | `bill_payments` | OK | — |
| GOALS | `goals` | OK | — |
| BUDGETS | `budgets` | OK | — |
| BUDGET_CATEGORIES | `budget_categories` | **Partial** | `allocatedAmount` in schema but not DB |
| NOTIFICATIONS | `notifications` | OK | — |
| REFRESH_TOKENS | `refresh_tokens` | OK | — |

### 1.3 Foreign Key Rules

All FKs use correct `ON DELETE` rules:
- `RESTRICT` on `category_id` in transactions and bills (prevents category deletion if used)
- `SET NULL` on `goal_id` in transactions (goal can be deleted without losing transaction)
- `CASCADE` on `user_id` everywhere (user deletion cascades)
- `RESTRICT` on `wallet_id` in transactions (prevents wallet deletion if transactions exist)

**No missing FKs found.** All required relationships have FK constraints.

### 1.4 Unique Constraints

| Constraint | Table | Present? |
|------------|-------|----------|
| Unique category name per user | `categories` | YES — `uq_category_name_user (user_id, name)` |
| Unique budget+category pair | `budget_categories` | YES — `uq_budget_category (budget_id, category_id)` |
| No duplicate bill payments per period | `bill_payments` | **NO** — only index, no unique constraint |

**Gap:** `bill_payments` has `idx_bill_payments_bill_period` (regular index) but no UNIQUE on `(bill_id, period_month)`. The design note says "each row = 1 payment event" with status computed by SUM, so this is intentional — partial payments are allowed. **Not a bug.**

---

## 2. Missing Constraints & Indexes

### 2.1 Critical Missing Indexes

| Query | Index Needed | Impact |
|-------|-------------|--------|
| `GET /api/analytics/category-spending?month=YYYY-MM` | `(user_id, type, display_date)` on transactions | Uses two separate indexes; MySQL picks one, other condition requires filter |
| `GET /api/transactions?category_id=X&month=YY` | `(user_id, category_id, display_date)` | `idx_tx_user_cat` doesn't cover `display_date` sort |
| `GET /api/transactions?type=X&month=YY` | `(user_id, type, display_date)` | `idx_tx_user_type` doesn't cover `display_date` sort |
| `findAll` on categories with `ORDER BY sort_order` | `(user_id, sort_order)` | `idx_categories_user` on `(user_id)` requires filesort |

### 2.2 Redundant Indexes

| Table | Redundant Index | Why |
|-------|----------------|-----|
| `transactions` | `idx_tx_user_month (user_id, display_date)` | Duplicate of `idx_tx_user_date (user_id, display_date)` |

### 2.3 Missing Check Constraints

| Table | Missing Constraint | Why Needed |
|-------|-------------------|------------|
| `budgets` | `end_date >= start_date` | Prevents invalid date ranges |
| `budgets` | `target_amount > 0` | Prevents zero/negative budgets |
| `wallet_logs` | `balance_after = balance_before + difference` | **Cannot enforce with CHECK** (cross-column arithmetic with DECIMAL), but should validate in repository |
| `transactions` | Foreign key `wallet_id` must match the user's wallet | **Cannot enforce with CHECK** — must validate in service layer |

### 2.4 `user_settings` has no indexes beyond PK

The `user_settings` table has only its PK (`user_id`). Queries filtering by `notify_email` or `notify_push` (for notification dispatch) would require full table scan. Not critical at current scale but worth noting.

---

## 3. Idempotency & Soft-Delete Strategy

### 3.1 IdempotencyKey — The Critical Contradiction

Migration history tells a confused story:

| Migration | Action |
|-----------|--------|
| 0001 | ADD `idempotency_key` to `transactions` with UNIQUE |
| 0002 | ADD `idempotency_key` to `bills`, `bill_payments`, `goals`, `cash_wallet_logs` with UNIQUE |
| **0011** | **DROP all `idempotency_key` columns from ALL tables** |

**After migration 0011:** ZERO idempotency keys exist in the database.

**But source schema files still define them** with UNIQUE constraints on: `transactions`, `bills`, `bill_payments`, `goals`, `wallet_logs`.

**And services still reference them:**
- `transaction-service.ts` — `getTransactionByIdempotencyKey()`, passes key on create
- `bill-service.ts` — `getBillByIdempotencyKey()`, `getPaymentByIdempotencyKey()`, passes key on create
- `goal-service.ts` — `getGoalByIdempotencyKey()`, passes key on create
- `idempotency.ts` — **every method** queries idempotencyKey columns
- `wallet-service.ts` — `getSyncByIdempotencyKey()`, passes key on quickSync

**If the current DB (post-0011) is running:** Every idempotency check will fail at runtime. If a client sends an `Idempotency-Key` header, the API will crash trying to query a non-existent column.

**Decision needed:**
- **Option A:** Re-add idempotency keys (revert migration 0011) — recommended for financial integrity
- **Option B:** Remove all idempotency references from schema + services — risky, loses serverless cold-start protection

### 3.2 Soft-Delete Strategy

Migration 0010 removed `deleted_at` from: `categories`, `transactions`, `bills`, `goals`, `budgets`.

**Remaining soft-delete columns:**
- `users.deleted_at` — PRESENT (only survivor)
- `wallets.deleted_at` — defined in schema (new table, not yet migrated)

**Assessment:** The project moved to hard-delete for financial records. This is a valid architectural choice (immutable ledger via `transactions` table), but it contradicts the CLAUDE.md and README which state "all financial records use soft-delete." The CLAUDE.md and README need updating.

**Risk:** Once a transaction/bill/goal/budget is deleted, it's gone forever. No audit trail for deletions of those entities. The `audit_logs` table exists but is not populated by any service code for entity deletions.

---

## 4. Performance Bottlenecks

### 4.1 Budget Summary Query (`GET /api/budgets/summary`)

**Current implementation** (`budget-service.ts` and `AnalyticsRepository`):

1. Fetch all active budgets (1 query)
2. Fetch all budget categories (1 query)
3. Fetch all expense transactions in date range (1 query)
4. Fetch total income for current month (1 query)
5. **Loop:** For each budget, filter transactions in-memory

**Verdict:** Not truly N+1 (only 4 queries total), but the in-memory filtering does O(N×M) work where N = budgets and M = transactions. For a user with 5 budgets and 500 transactions/month, this is fine. For 50 budgets and 50,000 transactions, it becomes problematic.

**Optimization:** Can be pushed to SQL with a single aggregate query using conditional sums grouped by budget period. Not urgent at current scale.

### 4.2 Budget Detail Query — Redundant Sub-Queries

`getBudgetDetail()` calls `calculateSpent()` which re-queries `budget_categories` and `transactions`. Then `getBudgetDetail()` itself also queries both again. **Result:** up to 3 queries to `budget_categories` and 2 to `transactions` for a single detail view.

### 4.3 Monthly Summary — Two Separate Queries

`getMonthlySummary()` runs two separate SUM queries (one for income, one for expense). Can be merged into:
```sql
SELECT
  SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS total_income,
  SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS total_expense
FROM transactions WHERE user_id=? AND display_date BETWEEN ? AND ?
```

### 4.4 Paginated Transactions — No COUNT

`getTransactionsPaginated()` returns results with LIMIT/OFFSET but no total count. The frontend cannot show "Page 3 of 10" without a separate COUNT query. Using OFFSET for pagination also performs poorly at large offsets (MySQL scans offset+limit rows).

### 4.5 Duplicate Query Files

`packages/db/src/queries/summary.ts` and `packages/db/src/repositories/analytics.repo.ts` are near-duplicates — same queries (getMonthlySummary, getActiveBillsTotal, getActiveGoalsAllocation). The queries version uses global `db` (no `tx` support); the repo version accepts `tx`. This creates confusion about which to use.

---

## 5. Concurrency & Safety

### 5.1 Wallet Balance — No OCC (CRITICAL)

`wallet-service.ts` claims "OCC: updates balance with optimistic concurrency control" in a comment, but the actual WHERE clause is:
```typescript
.where(and(eq(wallets.id, walletId), eq(wallets.userId, userId)))
```
**No version column check. No `WHERE balance = oldValue`.** This is last-write-wins.

**Risk scenario:** User has 1,000,000 VND. Two concurrent quick-syncs happen:
- Sync A: user enters 900,000 (diff = -100,000) → creates expense tx
- Sync B: user enters 950,000 (diff = -50,000) → creates expense tx
- Both read balance=1,000,000 before either writes
- Final balance could be 900,000 or 950,000 (non-deterministic)
- Both expense transactions written, but only one balance update "wins"

### 5.2 Goal Contributions — Lost Update (CRITICAL)

`goal-service.ts` `contributeToGoal()`:
```typescript
const newSaved = new Decimal(goal.currentSaved).plus(new Decimal(input.amount));
// ... update goal with newSaved ...
```
Two concurrent contributions to the same goal will lose one contribution. Same last-write-wins pattern.

### 5.3 Budget Create/Update — Non-Atomic (MEDIUM)

`budget-service.ts` `createBudget()` does two separate `db.insert()` calls (budgets table + budget_categories table) without `db.transaction()`. If the second insert fails, the budget is created without categories.

`updateBudget()` does `db.update()` + `db.delete()` + `db.insert()` — three separate calls without a transaction wrapper.

### 5.4 Transaction/Goal Insert — Missing walletId (CRITICAL)

Transactions schema requires `wallet_id` NOT NULL. But `goal-service.ts` `contributeToGoal()` inserts a transaction **without** `walletId`. When the migration adding `wallet_id` runs, this will crash.

---

## 6. Recommended Database Refactorings

All changes below stay within `packages/db/`.

### Refactor #1: Generate and run migration for multi-wallet + FK changes

**Rationale:** Schema source files define `wallets`, `wallet_logs`, `transactions.wallet_id`, `transactions.goal_id`, `budget_categories.allocated_amount` but DB doesn't have them. Required for wallet-service.ts and transactions to function.

**Action:** Run `pnpm db:generate` to produce migration `0012`. The migration must include data migration from `cash_wallet` → `wallets` and `cash_wallet_logs` → `wallet_logs`.

**Migration SQL skeleton:**
```sql
-- Rename cash_wallet → wallets (preserve data)
ALTER TABLE cash_wallet RENAME TO wallets;

-- Add missing columns to wallets
ALTER TABLE wallets ADD COLUMN name VARCHAR(100) NOT NULL DEFAULT 'Ví Tiền Mặt';
ALTER TABLE wallets ADD COLUMN type ENUM('cash','bank','credit','e_wallet','investment','other') NOT NULL DEFAULT 'cash';
ALTER TABLE wallets ADD COLUMN icon VARCHAR(50) NOT NULL DEFAULT '💵';
ALTER TABLE wallets ADD COLUMN color VARCHAR(7) NOT NULL DEFAULT '#6B7280';
ALTER TABLE wallets ADD COLUMN is_default TINYINT NOT NULL DEFAULT 1;
ALTER TABLE wallets ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE wallets ADD COLUMN last_synced_at TIMESTAMP NULL;
ALTER TABLE wallets MODIFY COLUMN id BIGINT UNSIGNED AUTO_INCREMENT;

-- Add wallet_id to transactions (nullable initially to backfill)
ALTER TABLE transactions ADD COLUMN wallet_id BIGINT UNSIGNED;
-- Backfill: set wallet_id from wallets where user_id matches
UPDATE transactions t JOIN wallets w ON t.user_id = w.user_id SET t.wallet_id = w.id;
ALTER TABLE transactions MODIFY COLUMN wallet_id BIGINT UNSIGNED NOT NULL;
ALTER TABLE transactions ADD CONSTRAINT fk_tx_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add goal_id to transactions
ALTER TABLE transactions ADD COLUMN goal_id BIGINT UNSIGNED;
ALTER TABLE transactions ADD CONSTRAINT fk_tx_goal FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Rename cash_wallet_logs → wallet_logs
ALTER TABLE cash_wallet_logs RENAME TO wallet_logs;
ALTER TABLE wallet_logs ADD COLUMN wallet_id BIGINT UNSIGNED;
ALTER TABLE wallet_logs ADD COLUMN transaction_id BIGINT UNSIGNED;
-- Backfill wallet_id
UPDATE wallet_logs wl JOIN wallets w ON wl.user_id = w.user_id SET wl.wallet_id = w.id;
ALTER TABLE wallet_logs ADD CONSTRAINT fk_walogs_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE wallet_logs ADD CONSTRAINT fk_walogs_tx FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Add allocated_amount to budget_categories
ALTER TABLE budget_categories ADD COLUMN allocated_amount DECIMAL(15,2) NOT NULL DEFAULT '0.00';
```

### Refactor #2: Re-add idempotencyKey columns (revert migration 0011)

**Rationale:** The README and CLAUDE.md both state "Idempotency keys required for all mutations to prevent duplicate processing." Migration 0011 removed them, creating a contradiction. Financial applications need idempotency to protect against serverless cold-start retries.

**Action:** Add `idempotency_key VARCHAR(255) UNIQUE` back to: `transactions`, `bills`, `bill_payments`, `goals`, `wallet_logs`.

```sql
ALTER TABLE transactions ADD COLUMN idempotency_key VARCHAR(255) UNIQUE;
ALTER TABLE bills ADD COLUMN idempotency_key VARCHAR(255) UNIQUE;
ALTER TABLE bill_payments ADD COLUMN idempotency_key VARCHAR(255) UNIQUE;
ALTER TABLE goals ADD COLUMN idempotency_key VARCHAR(255) UNIQUE;
ALTER TABLE wallet_logs ADD COLUMN idempotency_key VARCHAR(255) UNIQUE;
```

### Refactor #3: Add `version` column to wallets for OCC

**Rationale:** Prevents lost updates on concurrent wallet balance mutations.

**Action:**
```typescript
// In wallet.ts schema
version: int("version").notNull().default(0),
```

**Repository change** (`wallet.repo.ts` — to be created):
```typescript
async updateBalanceWithOCC(walletId: string, userId: string, newBalance: string, expectedVersion: number, tx?: DB) {
  const result = await client
    .update(wallets)
    .set({ balance: newBalance, version: expectedVersion + 1, updatedAt: new Date() })
    .where(and(
      eq(wallets.id, walletId),
      eq(wallets.userId, userId),
      eq(wallets.version, expectedVersion)  // OCC check
    ));
  if (result.affectedRows === 0) {
    throw new Error("Concurrent modification detected. Please retry.");
  }
}
```

### Refactor #4: Add `version` column to goals for OCC

**Rationale:** Prevents lost updates on concurrent goal contributions.

**Action:** Same pattern as wallets — add `version` column, update with WHERE version=expected.

### Refactor #5: Fix budget-service.ts — wrap create/update in transactions

**Rationale:** `createBudget` and `updateBudget` perform multi-table writes without atomicity.

**Action in `budget.repo.ts`:**
```typescript
async create(data: NewBudget, categoryIds?: number[]): Promise<string> {
  return await this.typedDb.transaction(async (tx) => {
    const [result] = await tx.insert(budgets).values(data);
    const budgetId = String(result.insertId);
    if (categoryIds && categoryIds.length > 0) {
      await tx.insert(budgetCategories).values(
        categoryIds.map(catId => ({ budgetId: budgetId as any, categoryId: catId }))
      );
    }
    return budgetId;
  });
}
```
(This is already implemented in `budget.repo.ts` but `budget-service.ts` doesn't use the repository's `create` with categories — it does raw `db.insert()` calls instead. Fix: make budget-service.ts delegate to BudgetRepository.)

### Refactor #6: Add composite index for analytics queries

**Rationale:** `getMonthlySummary` and filtered transaction queries need `(user_id, type, display_date)`.

**Action:**
```typescript
// In transactions.ts schema
userTypeDateIdx: index("idx_tx_user_type_date").on(table.userId, table.type, table.displayDate),
```

### Refactor #7: Deduplicate queries between `queries/summary.ts` and `analytics.repo.ts`

**Rationale:** Two files export the same functions with different signatures (one with `tx`, one without). Maintenance burden and confusion.

**Action:** Delete `queries/summary.ts` and move all consumers to use `AnalyticsRepository`.

### Refactor #8: Add wallet repository

**Rationale:** `WalletService` uses raw `db` queries directly. No `WalletRepository` exists, making wallet operations untestable and inconsistent with the repository pattern used by all other entities.

**Action:** Create `packages/db/src/repositories/wallet.repo.ts`:
```typescript
export class WalletRepository extends BaseRepository {
  async findAll(userId: string, tx?: DB) { /* ... */ }
  async findById(walletId: string, userId: string, tx?: DB) { /* ... */ }
  async create(data: NewWallet, tx?: DB) { /* ... */ }
  async updateBalance(walletId: string, userId: string, balance: string, version: number, tx?: DB) { /* ... */ }
  async softDelete(walletId: string, userId: string, tx?: DB) { /* ... */ }
  async createLog(data: NewWalletLog, tx?: DB) { /* ... */ }
  async findLogByIdempotencyKey(walletId: string, userId: string, key: string, tx?: DB) { /* ... */ }
}
```

### Refactor #9: Standardize `tx` parameter across all repositories

**Rationale:** Inconsistent `tx` support prevents composable transactions across repository boundaries.

| Repository | Methods with `tx` | Methods without `tx` |
|-----------|-------------------|---------------------|
| TransactionRepo | ALL | — |
| CategoryRepo | ALL | — |
| BillRepo | `createPayment`, `findPaymentByIdempotencyKey` | `findAll`, `findActive`, `findById`, `create`, `update`, `delete`, `findPayments`, `sumPayments` |
| GoalRepo | `update` | `findAll`, `findActive`, `findById`, `create`, `delete` |
| BudgetRepo | `create` (self-managed), `update` (self-managed) | `findAll`, `findActive`, `findById`, `delete` |

**Action:** Add optional `tx?: DB` parameter to ALL methods in ALL repositories.

---

## 7. Overall Assessment

### Is the schema design on the right track?

**Yes, fundamentally.** The ERD is well-designed for a personal finance tracker:
- Immutable ledger (`transactions` table) is correct for financial audit
- Multi-wallet support is the right abstraction (replacing 1:1 cash_wallet)
- FK constraints enforce referential integrity at DB level
- CHECK constraints prevent invalid data (positive amounts, valid ranges)
- Composite indexes on `(user_id, display_date)` serve the budget engine well

### What must be resolved before production?

1. **Run `db:generate` + `db:migrate`** to sync schema source files with the actual database. Without this, wallet-service.ts and transaction inserts with walletId will crash.

2. **Resolve the idempotency question definitively.** Either re-add the columns (recommended) or strip all references from schemas and services. The current half-state is the worst of both worlds.

3. **Add OCC to wallet balance and goal contributions.** These are financial mutations — lost updates are unacceptable.

4. **Wrap budget create/update in transactions.** Currently non-atomic.

5. **Fix goal-service.ts** to include `walletId` when creating transactions.

### Architecture flaws

1. **The schema-drift problem is systemic.** Schema source files were updated without migrations. This will keep happening without a policy: "every schema change requires a migration."

2. **BudgetService and AnalyticsService bypass the repository pattern.** They use raw `db` queries directly, making them untestable with isolated databases.

3. **No `WalletRepository` exists** despite `WalletService` being one of the most critical services.

4. **The CLAUDE.md and README make claims that don't match reality:**
   - "All financial records use soft-delete" → False (migration 0010 removed soft-delete)
   - "Idempotency keys required for all mutations" → False (migration 0011 removed them from DB)
   - "Atomic transactions for all multi-table updates" → Partially false (budget create/update not atomic)

### Verdict

The project is going in the right direction architecturally (multi-wallet, immutable ledger, FK integrity, check constraints). But there is significant **schema/database drift** that must be resolved with a proper migration before any further work. The Phase 1 schema changes were correct according to the ERD — they just need a migration to materialize them in the database. **Generate and run the migration, then continue Phase 2.**
