# Kế Hoạch Triển Khai Finance Tracker V3 (Từ ERD)

Tài liệu này là bản kế hoạch chi tiết để chuyển đổi các thực thể (Entities) từ `doc/wiki/erd.md` thành mã nguồn thực tế trong dự án S2S Finance Tracker V3.

Dự án sử dụng cấu trúc Monorepo (Next.js, Hono, Drizzle ORM, TiDB Serverless).

---

## 🚀 Giai Đoạn 1: Định Nghĩa Schema Database (Drizzle ORM)
**Đường dẫn thư mục:** `packages/db/src/schema/`

Dựa trên ERD, chúng ta sẽ tạo/cập nhật các file schema tương ứng:

1. **`users.ts`**
   - Bảng: `users`, `user_settings`, `refresh_tokens`
   - *Lưu ý:* `id` (BigInt) phải được cấu hình `mode: 'string'`.

2. **`wallets.ts`**
   - Bảng: `wallets`, `wallet_logs`
   - *Lưu ý:* Cột `balance` dùng kiểu `decimal(15,2)`. Có trường `deletedAt` cho Soft Delete.

3. **`categories.ts`**
   - Bảng: `categories`

4. **`transactions.ts`**
   - Bảng: `transactions`
   - *Quan trọng:* Chứa cột `idempotencyKey` và các Foreign Key liên kết tới Wallet, Category, Goal.

5. **`bills.ts`**
   - Bảng: `bills`, `bill_payments`
   - *Quan trọng:* `idempotencyKey` trên bảng bills.

6. **`goals.ts`**
   - Bảng: `goals`
   - *Quan trọng:* `idempotencyKey` trên bảng goals.

7. **`budgets.ts`**
   - Bảng: `budgets`, `budget_categories`

8. **`notifications.ts`**
   - Bảng: `notifications`

---

## 🛡️ Giai Đoạn 2: Xây Dựng Zod Schemas (Shared Schemas)
**Đường dẫn thư mục:** `packages/shared-schemas/src/`

Mọi dữ liệu In/Out phải đi qua Zod để đảm bảo Type Safety giữa Backend và Frontend.

- **`user.schema.ts`**: Schema đăng ký, đăng nhập, cập nhật setting.
- **`wallet.schema.ts`**: Insert/Update ví. Kiểm tra số dư đầu vào phải là chuỗi (string).
- **`category.schema.ts`**: Tạo/sửa danh mục.
- **`transaction.schema.ts`**: Quan trọng nhất. Chứa `decimalString` validation. Bắt buộc có `idempotencyKey` cho Create/Update.
- **`bill.schema.ts`**: Lịch thanh toán, tần suất.
- **`goal.schema.ts`**: Mục tiêu tiết kiệm.
- **`budget.schema.ts`**: Ngân sách và phân bổ (allocations).

---

## 🗄️ Giai Đoạn 3: Database Repositories (Data Access Layer)
**Đường dẫn thư mục:** `packages/db/src/repositories/`

Tất cả các file này phải kế thừa từ `BaseRepository` để hỗ trợ Transaction nội bộ.

- **`user.repo.ts`**: Xử lý user, settings.
- **`wallet.repo.ts`**: Tính toán tổng số dư, log lại biến động ví (`wallet_logs`). Cần áp dụng OCC (Optimistic Concurrency Control) khi update balance.
- **`category.repo.ts`**: Lấy danh sách category theo `userId`.
- **`transaction.repo.ts`**: Thêm/Sửa/Xóa (Soft Delete) giao dịch.
- **`bill.repo.ts`**: Cập nhật trạng thái thanh toán hóa đơn.
- **`goal.repo.ts`**: Cập nhật `currentSaved`.
- **`budget.repo.ts`**: Quản lý `budgets` và liên kết `budget_categories`.

---

## ⚙️ Giai Đoạn 4: API Services (Business Logic)
**Đường dẫn thư mục:** `apps/api/src/services/`

Nơi chứa logic nghiệp vụ, tính toán tiền tệ (Sử dụng `Decimal.js`).

- **`auth-service.ts`**: Xử lý login, JWT (HttpOnly Cookies), Refresh Token.
- **`wallet-service.ts`**: Tính toán lại số dư an toàn, đồng bộ offline.
- **`transaction-service.ts`**: 
  - Đảm bảo tính toán Idempotency (Không xử lý trùng lặp request).
  - Khi tạo Transaction, phải gọi `wallet-service` để trừ/cộng tiền, đồng thời ghi log vào `wallet_logs`.
- **`s2s-engine.ts`**: Tính toán Safe-To-Spend (Tổng thu nhập - Chi phí cố định - Bills - Goals).
- **`bill-service.ts`**: Logic Auto-pay hoặc nhắc nhở.
- **`goal-service.ts`**: Tính toán tiến độ Goal.
- **`container.ts`**: Dependency Injection container khai báo tất cả các services.

---

## 🌐 Giai Đoạn 5: Hono API Routes
**Đường dẫn thư mục:** `apps/api/src/routes/`

Cung cấp API cho Frontend, bảo vệ bởi Auth Middleware (`userId`).

- **`/auth/*`** (`auth.ts`): Login, logout, refresh.
- **`/wallets/*`** (`wallets.ts`): CRUD ví.
- **`/transactions/*`** (`transactions.ts`): CRUD giao dịch.
- **`/bills/*`** (`bills.ts`): CRUD hóa đơn.
- **`/goals/*`** (`goals.ts`): CRUD mục tiêu.
- **`/budgets/*`** (`budgets.ts`): CRUD ngân sách.
- **`/s2s/*`** (`s2s.ts`): Lấy thông tin Safe-to-Spend summary.

---

## 💻 Giai Đoạn 6: Frontend Integration (Next.js)
**Đường dẫn thư mục:** `apps/web/src/`

- **API Client:** Cập nhật `@finance/api-client` để gọi các route mới.
- **Hooks (`apps/web/src/_lib/hooks/`)**:
  - `useWallets.ts`
  - `useTransactions.ts`
  - `useS2SSummary.ts` (Sử dụng Optimistic UI mạnh mẽ).
- **Components (`apps/web/src/_components/`)**:
  - Tạo các form thao tác tiền tệ.
  - Xây dựng UI danh sách giao dịch, ví, hóa đơn, mục tiêu.

---

## ⚠️ Nguyên Tắc Bắt Buộc (Theo Coding Standards)
1. **Decimal Precision**: KHÔNG BAO GIỜ dùng `number` cho tiền tệ. Giao tiếp qua API bằng `string` và tính toán bằng `Decimal.js`.
2. **Idempotency**: Mọi API dạng `POST/PUT/PATCH` ảnh hưởng đến tiền tệ đều cần `Idempotency-Key` header.
3. **Soft Delete**: Các repository chỉ sử dụng `UPDATE deleted_at = NOW()` thay vì `DELETE` thực sự.
4. **Application-Level Isolation**: Mọi truy vấn DB phải luôn có `.where(eq(table.userId, currentUserId))`.
5. **GitNexus Impact Analysis**: Trước khi sửa các logic dùng chung (như `s2s-engine.ts`), phải chạy GitNexus để đánh giá phạm vi ảnh hưởng.
