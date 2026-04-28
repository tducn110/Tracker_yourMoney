# Phase 1: Schema Database (Drizzle ORM) — Hoàn thành

**Ngày:** 2026-04-29
**Reference:** `doc/wiki/deploy test.md` — Giai Đoạn 1
**Reference ERD:** `doc/wiki/erd.md`

---

## Mục tiêu

Định nghĩa/cập nhật tất cả schema Drizzle ORM trong `packages/db/src/schema/` khớp với ERD.

---

## Files đã sửa

### 1. `packages/db/src/schema/transactions.ts`
**Lý do:** ERD yêu cầu transaction có FK tới `wallets` (`walletId`) và `goals` (`goalId`). Code cũ không có 2 FK này.

**Thay đổi:**
- Thêm cột `walletId` (FK → wallets.id, ON DELETE RESTRICT)
- Thêm cột `goalId` (FK → goals.id, ON DELETE SET NULL)
- Thêm relations: `wallet`, `goal`

### 2. `packages/db/src/schema/wallet.ts`
**Lý do:** Code cũ là `cash_wallet` (1:1 với user) — chỉ hỗ trợ 1 ví tiền mặt. ERD yêu cầu multi-wallet: user có thể có nhiều ví (cash, bank, credit, e_wallet, investment, other) với `name`, `type`, `icon`, `color`, `isDefault`, `deletedAt`.

**Thay đổi:**
- Viết lại toàn bộ: thay `cashWallet` → `wallets` (multi-wallet)
- Thêm type enum: `cash`, `bank`, `credit`, `e_wallet`, `investment`, `other`
- Thêm `name`, `icon`, `color`, `isDefault`, `deletedAt` (soft delete)
- Thay `cashWalletLogs` → `walletLogs`
- Thêm `walletId` FK, `transactionId` FK trong wallet_logs

### 3. `packages/db/src/schema/budgets.ts`
**Lý do:** ERD yêu cầu `budget_categories` có cột `allocatedAmount` để biết mỗi category được phân bổ bao nhiêu.

**Thay đổi:**
- Thêm cột `allocatedAmount DECIMAL(15,2)` vào bảng `budget_categories`

### 4. `packages/db/src/schema/index.ts`
**Lý do:** Sau khi đổi tên `cashWallet` → `wallets`.

**Thay đổi:**
- Cập nhật export path và comment

---

## Files phụ thuộc đã cập nhật

| File | Thay đổi |
|------|----------|
| `packages/db/src/index.ts` | `CashWallet` → `Wallet, NewWallet, WalletLog, NewWalletLog` |
| `packages/db/src/scripts/seed-demouser.ts` | `cashWallet` → `wallets` + thêm name/type/isDefault |
| `apps/api/src/routes/internal.ts` | `cashWallet` → `wallets` |
| `apps/api/src/services/auth-service.ts` | `cashWallet` → `wallets` |
| `apps/api/src/services/wallet-service.ts` | Viết lại toàn bộ cho multi-wallet |

---

## Verification

```bash
cd packages/db && pnpm typecheck   # Kiểm tra TypeScript không lỗi
```
