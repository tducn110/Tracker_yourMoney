# Task To-Do Part 2 — GitNexus Scan Results

Ngày: 2026-05-03 | Scan: `detect_changes` vs `remotes/origin/feature/issue-87-backend-scale-ui`
Kết quả: **180 symbols changed, 56 files, 12 affected processes, risk HIGH**

---

## P0 — Critical: Missing Wallet Balance Updates

### 1. `payBill` không trừ tiền ví
- **File**: `apps/api/src/services/bill-service.ts:43-67`
- **Process**: Bill Payment flow
- **Fix**: Thêm wallet fetch + OCC balance update + wallet_logs audit trail trong `db.transaction()`

### 2. `createGoal` không trừ monthlyContribution
- **File**: `apps/api/src/services/goal-service.ts:25-38`
- **Process**: Goal Creation flow
- **Fix**: Nếu `monthlyContribution > 0`, trừ wallet balance + tạo transaction + audit log

### 3. Analytics `DATE_FORMAT` MySQL → PostgreSQL
- **File**: `apps/api/src/services/analytics-service.ts:68`
- **Process**: Analytics MonthlyTrend
- **Fix**: `DATE_FORMAT(displayDate, '%Y-%m')` → `TO_CHAR(displayDate, 'YYYY-MM')`

---

## P1 — Frontend Boolean Remnants (MySQL 0/1 → PostgreSQL true/false)

### 4. WalletContext gửi `isDefault` integer
- **File**: `apps/web/src/app/context/WalletContext.tsx:94,105,117-118`
- **Process**: Wallet CRUD
- **Fix**: `data.isDefault ? 1 : 0` → `data.isDefault`, `isDefault: 1` → `isDefault: true`
- **Note**: Lines 117-118 đã fix, lines 94/105 chưa

### 5. SettingsContainer gửi `notifyEmail`/`notifyPush` integer
- **File**: `apps/web/src/app/(dashboard)/settings/_components/SettingsContainer.tsx:44-45`
- **Process**: Settings Update
- **Fix**: `emailNotifications ? 1 : 0` → `emailNotifications`

### 6. Zod schemas `z.number()` cho boolean columns
- **Files**:
  - `packages/shared-schemas/src/user.schema.ts:57-58` — `notifyEmail`, `notifyPush`
  - `packages/shared-schemas/src/category.schema.ts:21` — `isDefault`
- **Fix**: `z.number().min(0).max(1)` → `z.boolean()`

### 7. SettingsContainer setState trong render
- **File**: `apps/web/src/app/(dashboard)/settings/_components/SettingsContainer.tsx:29-36`
- **Fix**: Move vào `useEffect(() => { if (settings && !initialized) { ... } }, [settings])`

---

## P2 — Worker & Cache

### 8. Worker thiếu wallet_logs audit trail
- **File**: `apps/worker/src/index.ts:121-151`
- **Process**: Auto-pay recurring bills
- **Fix**: Thêm `walletLogs.insert()` sau khi update wallet balance

### 9. Worker dùng `parseFloat` cho tiền
- **File**: `apps/worker/src/index.ts:82-83,115,148`
- **Fix**: Dùng `Decimal.js` (giống toàn bộ codebase)

### 10. Worker race condition
- **File**: `apps/worker/src/index.ts:103-115`
- **Fix**: Move wallet fetch vào trong `db.transaction()`

### 11. Frontend cache invalidation gaps
- **File**: `apps/web/src/_lib/hooks/finance.tsx`
- **Fix**: Thêm `queryClient.invalidateQueries({ queryKey: ['wallets'] })` + `['transactions']` cho `useCreateGoal`, `useDeleteGoal`, `useCreateBill`

---

## P3 — Cleanup

### 12. Transfer credit transaction thiếu `.returning()`
- **File**: `apps/api/src/services/wallet-service.ts:296-306`
- **Fix**: Thêm `.returning({ id: transactions.id })` cho credit transaction

### 13. `ER_DUP_ENTRY` MySQL dead code
- **File**: `apps/api/src/index.ts:162-164`
- **Fix**: Thêm check cho PostgreSQL error code `23505`

---

## Affected Processes (GitNexus)

| Process | Changed Steps | Risk |
|---------|--------------|------|
| SocialLogin → Clean | `socialLogin` (step 1) | LOW |
| SocialLogin → GetSecret | `socialLogin` (step 1) | LOW |
| Delete → Set (soft delete) | `update` (step 2) | LOW |
| Delete → FindById | `delete`, `update`, `findById` | MEDIUM |
| Constructor → CategoryRepository | `CategoryRepository` (step 3) | LOW |
| Constructor → TransactionRepository | `TransactionRepository` (step 3) | MEDIUM |
| Constructor → AnalyticsRepository | `AnalyticsRepository` (step 3) | LOW |
| Constructor → BillRepository | `BillRepository` (step 3) | MEDIUM |
| UpdateBudget → CalculateSpent | `calculateSpent` (step 3) | MEDIUM |
| CreateBudget → CalculateSpent | `calculateSpent` (step 3) | MEDIUM |
| Get → DrizzleTelemetryLogger | `getDb` (step 2) | LOW |

---

## Tồn Đọng (Backlog)

- [ ] `as any` casts khắp service layer (WalletService, BillService, GoalService) — mất type safety
- [ ] `WalletType` enum frontend thiếu `'credit' | 'investment' | 'other'`
- [ ] `updateTransaction` không recalc wallet balance nếu amount/type thay đổi
- [ ] `deleteGoal`/`deleteBill` không guard chống xóa khi có tiền/payment
- [ ] `userResponseSchema` dùng `z.number()` cho `isActive`/`emailVerified` (boolean DB)
- [ ] Lặp code OCC wallet update ở 5 nơi → nên extract thành helper

---

## Verify

1. `pnpm typecheck` — 6/6 packages pass
2. `cd apps/api && npx vitest run` — 30/30 tests pass
3. `pnpm dev` — web :3000, API :3001
4. Manual test checklist:
   - [ ] Tạo giao dịch → ví bị trừ
   - [ ] Thanh toán hóa đơn → ví bị trừ
   - [ ] Tạo mục tiêu → ví bị trừ monthlyContribution
   - [ ] Đóng góp mục tiêu → ví bị trừ
   - [ ] Phân tích → monthly trend hiển thị
   - [ ] Tạo/sửa ví → isDefault boolean đúng
   - [ ] Cài đặt → notifyEmail/notifyPush boolean đúng
