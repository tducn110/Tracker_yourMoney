# Task To-Do — Bug Fixes & Improvements

Ngày: 2026-05-03 | Branch: `feature/issue-87-backend-scale-ui`

---

## Đã Fix

- [x] Dashboard "Giao dịch gần đây" trống — API trả `{ transactions, total }` nhưng code expect array → (`RecentTransactionsCard.tsx:134`)
- [x] Tạo giao dịch không trừ tiền ví — `transaction-service.ts:createTransaction` thiếu wallet balance update + audit log
- [x] Đóng góp mục tiêu không trừ tiền ví — `goal-service.ts:contributeToGoal` đã có wallet update (OK)
- [x] Next.js 16.2.4 "module factory is not available" — downgrade về 16.1.4
- [x] Xóa Playwright khỏi project
- [x] MySQL → PostgreSQL migration hoàn tất (schema, driver, queries)
- [x] Boolean remnants fixed ở auth, seed, internal routes

---

## Đang Fix (theo plan hiện tại)

| # | Ưu tiên | File | Bug |
|---|---------|------|-----|
| 1 | P0 | `bill-service.ts:43-67` | `payBill` tạo transaction nhưng **không trừ tiền ví** — cần thêm wallet OCC + audit log |
| 2 | P0 | `goal-service.ts:25-38` | `createGoal` không trừ `monthlyContribution` từ ví |
| 3 | P0 | `analytics-service.ts:68` | `DATE_FORMAT('%%Y-%%m')` là MySQL function → PostgreSQL lỗi → đổi sang `TO_CHAR` |
| 4 | P1 | `WalletContext.tsx:94,105` | Gửi `isDefault: 1/0` (integer) vào PostgreSQL `boolean` → tạo/sửa ví lỗi |
| 5 | P1 | `SettingsContainer.tsx:44-45` | Gửi `notifyEmail/notifyPush: 1/0` vào `boolean` → cài đặt lỗi |
| 6 | P1 | `user.schema.ts:57-58` | Zod `z.number()` cho `notifyEmail`/`notifyPush` nhưng DB là `boolean` |
| 7 | P1 | `category.schema.ts:21` | `isDefault: z.number()` nhưng DB là `boolean` |
| 8 | P1 | `SettingsContainer.tsx:29-36` | `setState` trong render phase → move vào `useEffect` |
| 9 | P2 | `worker/src/index.ts` | Thiếu wallet_logs audit trail, `parseFloat` thay vì `Decimal.js`, race condition |
| 10 | P2 | `finance.tsx` (hooks) | `useCreateGoal`, `useDeleteGoal`, `useCreateBill` thiếu invalidate wallet/transaction cache |
| 11 | P3 | `wallet-service.ts:296` | Credit transaction trong `transfer` thiếu `.returning()` |
| 12 | P3 | `api/src/index.ts:162` | `ER_DUP_ENTRY` string check là MySQL dead code |

---

## Tồn Đọng (Backlog)

- [ ] `as any` casts khắp service layer — mất type safety với PostgreSQL
- [ ] `WalletType` enum frontend (`'cash' | 'bank' | 'ewallet' | 'savings'`) thiếu `'credit' | 'investment' | 'other'` so với DB
- [ ] `updateTransaction` không recalulate wallet balance nếu amount/type thay đổi
- [ ] `deleteGoal`/`deleteBill` không guard chống xóa khi có tiền/payment đã tồn tại
- [ ] `userResponseSchema` dùng `z.number()` cho `isActive`/`emailVerified` (boolean DB columns)
- [ ] Worker chỉ chạy mỗi 60 phút — có thể dùng cron job thay vì polling
- [ ] Thiếu validation schema ở `PUT /settings` route
- [ ] Dùng chung pattern OCC wallet update (hiện tại lặp code ở 5 nơi: createTransaction, contributeToGoal, addFunds, quickSync, transfer)

---

## Verify

1. `pnpm typecheck` — 6/6 packages pass
2. `cd apps/api && npx vitest run` — 30/30 tests pass
3. `pnpm dev` — web :3000, API :3001
4. Manual test:
   - [ ] Tạo giao dịch → ví bị trừ
   - [ ] Thanh toán hóa đơn → ví bị trừ
   - [ ] Tạo mục tiêu → ví bị trừ monthly contribution
   - [ ] Đóng góp mục tiêu → ví bị trừ
   - [ ] Phân tích → monthly trend hiển thị
   - [ ] Tạo/sửa ví → isDefault boolean đúng
   - [ ] Cài đặt → notifyEmail/notifyPush boolean đúng
