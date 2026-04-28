# Phase 2 Completed: Schema Synchronization & Migration

**Date:** 2026-04-29
**PR:** [#29](https://github.com/tducn110/Tracker_yourMoney/pull/29)
**Issue:** [#28](https://github.com/tducn110/Tracker_yourMoney/issues/28)
**Branch:** `feature/phase-2-schema-sync` (merged via rebase)
**Migration:** `0012_sync_schema_to_erd`

## What Was Changed

Migration 0012 synced the TiDB production database with the Phase 1 schema source files, resolving the schema/database drift.

### Database Changes

| Change | Details |
|--------|---------|
| New table: `wallets` | Multi-wallet architecture (cash, bank, credit, e_wallet, investment, other) |
| New table: `wallet_logs` | Audit trail for wallet balance changes |
| transactions: `wallet_id` | NOT NULL FK to wallets.id |
| transactions: `goal_id` | Nullable FK to goals.id |
| transactions: `idempotency_key` | Re-added (revert migration 0011) |
| bills: `idempotency_key` | Re-added |
| goals: `idempotency_key` | Re-added |
| bill_payments: `idempotency_key` | Re-added |
| budget_categories: `allocated_amount` | DECIMAL(15,2) NOT NULL DEFAULT 0.00 |
| Dropped: `cash_wallet` | Legacy 1:1 wallet table |
| Dropped: `cash_wallet_logs` | Legacy wallet audit table |

### Data Migration

- Existing `cash_wallet` rows → migrated to `wallets` (name="Cash", type="cash", is_default=1)
- Existing `cash_wallet_logs` rows → migrated to `wallet_logs` (wallet_id mapped from user_id)
- Existing transactions → wallet_id backfilled from user's default wallet

### Files Modified

- `packages/db/drizzle/migrations/0012_sync_schema_to_erd.sql` (new)
- `packages/db/drizzle/migrations/meta/_journal.json` (updated)

## Verification

- **Typecheck:** Passed
- **Migration execution:** 31/31 SQL statements executed successfully
- **DB state confirmed:**
  - `wallets` table present
  - `wallet_logs` table present
  - `cash_wallet` dropped
  - `cash_wallet_logs` dropped
  - All new columns present on transactions, bills, goals, bill_payments, budget_categories
  - All foreign keys and indexes created

## Database State After Phase 2

The database now matches the source schema files exactly. All 13 migrations (0000-0012) are applied.

**Tables:** users, user_settings, refresh_tokens, categories, wallets, wallet_logs, transactions, bills, bill_payments, goals, budgets, budget_categories, notifications, audit_logs, __drizzle_migrations
