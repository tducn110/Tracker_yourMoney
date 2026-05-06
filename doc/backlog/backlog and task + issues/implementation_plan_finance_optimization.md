# Implementation Plan: Finance Service Optimization & S2S Refactoring

This plan details the refactoring of the Budget, Goal, and Bill services to improve performance, financial accuracy, and clean up technical debt.

---

## 📋 Overview of Changes

1.  **Budget Service**: Refactor the "S2S" (Safe to Spend) engine to use SQL-level aggregations instead of in-memory filtering. Finalize the transition to category-only budgeting by removing any remaining "wallet scope" logic.
2.  **Goal Service**: Fix the contribution logic. Goal savings should be recorded as `transfer` transaction types instead of `expense` to preserve net worth accuracy. Replace hardcoded Vietnamese strings with system constants.
3.  **Bill Service**: Optimize payment status checks and ensure strict idempotency for all financial mutations.
4.  **Technical Debt**: Cleanup dead debug routes and standardize error classes across all services.

---

## 🚀 Phase 1: Budget Service & S2S Engine Optimization
**Issue ID**: `feature/issue-90-budget-sql-optimization`

### 🎯 Goal
Optimize the Budget service to handle thousands of transactions efficiently using SQL aggregations and remove legacy wallet-coupling.

### 🛠 Tasks
- [ ] **Task 1: Schema & Schema Validation Cleanup**
  - [ ] Remove `walletScope` from `packages/db/src/schema/budgets.ts` (if not already fully removed).
  - [ ] Update Zod schemas in `packages/shared-schemas/src/budgets.ts` to match.
  - [ ] Run `pnpm db:generate` and `pnpm db:migrate`.
- [ ] **Task 2: Refactor `getBudgets` & `getBudgetSummary`**
  - [ ] Replace `findMany` + `.filter()` logic with a complex SQL query using `sum(transactions.amount)`.
  - [ ] Group by `budgetId` or `categoryId` to fetch all spending in a single trip to the database.
  - [ ] Implement `Decimal.js` for all arithmetic at the service layer to ensure precision.
- [ ] **Task 3: Refactor `calculateSpent` Private Method**
  - [ ] Optimize to use `db.select({ total: sum(...) })` with proper `JOIN` on `budget_categories`.
  - [ ] Ensure `userId` isolation is strictly enforced in the `WHERE` clause.

---

## 🎯 Phase 2: Goal Service Accuracy & Transaction Logic
**Issue ID**: `feature/issue-91-goal-transfer-logic`

### 🎯 Goal
Correct the financial representation of goal contributions by using `transfer` types and removing hardcoded strings.

### 🛠 Tasks
- [ ] **Task 1: Fix Transaction Type Logic**
  - [ ] Update `createGoal` and `contributeToGoal` in `goal-service.ts` to use `type: 'transfer'`.
  - [ ] Ensure that when a goal contribution is made, the money is "moved" but the net worth (Income - Expense) remains unaffected until the money is actually spent.
- [ ] **Task 2: Category Resolution Cleanup**
  - [ ] Replace `"Tiết Kiệm"` hardcoded string with a system constant or a lookup by a standardized slug (e.g., `'savings'`).
  - [ ] Implement a fallback mechanism if the category doesn't exist for a new user.
- [ ] **Task 3: Improve Goal Deletion Guard**
  - [ ] Refine the check for `currentSaved > 0` using `Decimal.js` to avoid floating point issues.

---

## 🧾 Phase 3: Bill Service & API Infrastructure Cleanup
**Issue ID**: `feature/issue-92-bill-optimization-cleanup`

### 🎯 Goal
Improve the Bill service performance and remove dead code from the API.

### 🛠 Tasks
- [ ] **Task 1: Bill Payment Optimization**
  - [ ] Refactor `sumPayments` in `bill.repo.ts` to use a single optimized SQL query.
  - [ ] Ensure `payBill` strictly validates `amountPaid` against the remaining balance using `Decimal.js`.
- [ ] **Task 2: Dead Code & Debug Cleanup**
  - [ ] Delete `apps/api/src/routes/debug.ts` and remove its registration in `server.ts`.
  - [ ] Audit `transactions.repo.ts` for any unused legacy methods.
- [ ] **Task 3: Standardize Error Responses**
  - [ ] Replace ad-hoc error objects with dedicated classes like `NotFoundError` or `ConflictError`.
  - [ ] Ensure all services use the same error pattern for consistency.

---

## 🛡 Security & Quality Checklist
- [ ] All database queries scope by `userId`.
- [ ] 100% of financial calculations use `Decimal.js`.
- [ ] `Idempotency-Key` headers are correctly handled for all mutations.
- [ ] Unit tests updated for `BudgetService` and `GoalService`.
- [ ] `pnpm typecheck` and `pnpm lint` pass across the monorepo.
