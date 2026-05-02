# Bug Fix: Giao dịch "Đã lưu" nhưng không hiện

**Phát hiện:** 2026-05-03
**Fix:** 2026-05-03
**Severity:** CRITICAL

## Root Cause

Cả 2 form nhập giao dịch đều **không gọi API** — chỉ hiển thị toast ảo.

### Bug 1: QuickAddModal `onSubmit` là no-op
- `apps/web/src/app/(dashboard)/layout.tsx` line 40
- `onSubmit={async () => setIsQuickAddOpen(false)}` — bỏ qua toàn bộ dữ liệu
- Modal tự gọi `toast.success()` dù chưa có API nào chạy

### Bug 2: SimpleQuickInput handleSubmit chỉ toast
- `apps/web/src/components/quick-add/SimpleQuickInput.tsx` lines 266-286
- `handleSubmit` chỉ format message + toast + clear form, không gọi API

### Bug 3: useCreateTransaction + useQuickAdd — dead code
- `apps/web/src/_lib/hooks/finance.tsx` lines 54 (useQuickAdd) + 143 (useCreateTransaction)
- Full optimistic UI + invalidation logic nhưng **không được import ở component nào**

### Bug 4: Category mapping mismatch
- Frontend dùng slug (`"food"`, `"salary"`) nhưng API cần `categoryId` (numeric)

## Changes Made

### File mới: `apps/web/src/_lib/category-map.ts`
- Hàm `resolveCategoryId(slug, type, categories)` — map frontend slug → backend category ID
- Mapping: `"food"` → `"Ăn Uống"`, `"salary"` → `"Thu Nhập"`, v.v.
- Fallback theo type nếu không tìm thấy exact match

### File sửa: `apps/web/src/components/quick-add/QuickAddModal.tsx`
- Thêm `walletId` vào `CreateTransactionDTO`
- `onFormSubmit` giờ gửi kèm `selectedWallet` qua `onSubmit`

### File sửa: `apps/web/src/app/(dashboard)/layout.tsx`
- Import `useCreateTransaction`, `useCategories`, `resolveCategoryId`
- `handleQuickAdd` gọi `createTransaction()` với `categoryId` đã resolve
- `onSubmit` giờ gọi API thật, không phải no-op

### File sửa: `apps/web/src/components/quick-add/SimpleQuickInput.tsx`
- Import `useCreateTransaction`, `useCategories`, `resolveCategoryId`
- `handleSubmit` giờ gọi `createTransaction()` với `categoryId` đã resolve
- Toast vẫn giữ để hiển thị preview giao dịch sau khi API thành công

## Data Flow (sau fix)

```
Form → useCreateTransaction → transactionsAPI.create() → POST /api/v1/transactions
  → onMutate: optimistic update (temp ID + pending state)
  → API success → onSettled: invalidateQueries(['transactions']) → refetch
    → RecentTransactionsCard + TransactionsList cập nhật tự động
  → onError: rollback + toast error
```

## Verification

- `pnpm typecheck` — 0 errors
- `pnpm test` — 30/30 pass
- Manual: QuickAddModal → expense 50000 → Lưu → xuất hiện trong Recent Transactions
- Manual: SimpleQuickInput → income 10000000 → Lưu → xuất hiện trong Dashboard
- Manual: Transactions page → giao dịch mới xuất hiện trong list
