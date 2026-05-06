# 🚀 Kế Hoạch Tái Cấu Trúc & Tối Ưu S2S Finance: Budget, Goal, Bill

Tài liệu này là bản quy hoạch chi tiết từng bước (phase-to-phase) để sửa logic sai sót của ngân sách (Budgets), mục tiêu (Goals), hóa đơn (Bills), đồng thời tối ưu hiệu năng, bảo mật và cấu trúc code.

---

## 1. 📊 Phân tích hiện trạng & Đối chiếu Database

### 1.1 Dead Database Columns & Tables
- **Table `budgets`**: Cột `walletScope` (enum `budgetWalletScopeEnum`).
  - *Vấn đề*: Ngân sách hiện tại đang liên kết sai với Ví (Wallet). Ngân sách thực tế dùng để quản lý giới hạn chi tiêu cho các danh mục (Expense Categories). Tiền trừ vào ngân sách dựa trên category người dùng chi tiêu, không phụ thuộc ví.
  - *Hành động*: Xóa hoàn toàn cột này khỏi Database và Zod schemas.
- **Table `budget_categories`**: Đây là bảng lưu danh sách categories thuộc 1 budget.
  - *Hành động*: Cần đảm bảo API Create/Update budget hỗ trợ truyền vào mảng `categoryIds` để lưu vào bảng này, làm cốt lõi cho việc tracking.

### 1.2 Unoptimized & Heavy Files
- **File**: `apps/api/src/services/budget-service.ts`
  - *Lý do heavy*: Tính toán in-memory. Hàm `getBudgetSummary` và `getBudgets` đang fetch toàn bộ transactions ra một mảng, sau đó dùng array `.reduce` hoặc `.filter`. Việc này gây **lỗi OOM (Out of Memory)** khi dữ liệu người dùng lớn dần.
  - *Hành động*: Bắt buộc đổi sang dùng Drizzle `sql` aggregations (`SUM(amount) ... GROUP BY`) chạy thẳng trên Database.
- **File**: `apps/api/src/services/goal-service.ts`
  - *Lý do sai logic*: Hàm `contributeToGoal` tạo transaction type là `expense`. Điều này khiến "Tiền chuyển vào mục tiêu tiết kiệm" bị tính là mất đi, làm sai tổng tài sản (Net Worth) của người dùng.
  - *Hành động*: Đổi type thành `transfer`. Loại bỏ việc hardcode tên category "Tiết Kiệm".

### 1.3 Dead APIs & Thiếu sót API / Endpoints
- **Dead API**: File `apps/api/src/routes/debug.ts` chứa code cũ kiểm tra Firebase không còn dùng đến. Cần xóa ngay.
- **Thiếu API Budgets**: Cần thêm `GET /api/budgets/:id/transactions` để hiển thị lịch sử chi tiêu của 1 ngân sách.
- **Thiếu API Goals**: Cần thêm `POST /api/goals/:id/withdraw` để cho phép rút tiền từ mục tiêu (vì hiện tại mới chỉ có contribute).

---

## 2. 📝 Kế hoạch chi tiết (Phase to Phase)

### Phase 1: Dọn dẹp & Chuẩn hoá Database (Clean Architecture)
*Mục tiêu: Cắt bỏ mã thừa, chuẩn bị cấu trúc Database đúng với logic Budget mới.*

*   **Task 1.1: Database Schema Cleanup**
    *   *Subtask 1.1.1*: Xóa cột `walletScope` khỏi `packages/db/src/schema/budgets.ts`.
    *   *Subtask 1.1.2*: Cập nhật `packages/shared-schemas` (Xóa `walletScope`, bổ sung `categoryIds: z.array(z.number())` vào `insertBudgetSchema` và `updateBudgetSchema`).
    *   *Subtask 1.1.3*: Chạy Drizzle kit (`pnpm db:generate` & `pnpm db:migrate`) để đồng bộ DB.
*   **Task 1.2: Dead API Removal**
    *   *Subtask 1.2.1*: Xóa file `apps/api/src/routes/debug.ts`.
    *   *Subtask 1.2.2*: Xóa việc đăng ký route `/debug` khỏi `apps/api/src/server.ts`.

### Phase 2: Budget Engine Redesign (Tối ưu SQL Aggregation)
*Mục tiêu: Đổi logic Budget sang quản lý bằng Category, không dùng Wallet, tính toán chống lỗi OOM.*

*   **Task 2.1: Sửa logic tạo/cập nhật Budget**
    *   *Subtask 2.1.1*: Sửa `budget-service.ts -> createBudget` để lưu mảng `categoryIds` vào bảng trung gian `budget_categories`.
    *   *Subtask 2.1.2*: Sửa `updateBudget` cập nhật danh sách category (xóa danh sách cũ, insert danh sách mới trong 1 transaction).
*   **Task 2.2: Tối ưu hoá Aggregation Queries**
    *   *Subtask 2.2.1*: Viết lại hàm `getBudgetSummary` dùng SQL: `SELECT SUM(amount) FROM transactions WHERE category_id IN (...)`. Không load array lên memory. Trả về `Decimal.js` string.
    *   *Subtask 2.2.2*: Cập nhật `getBudgets` dùng một SQL query JOIN + GROUP BY duy nhất lấy tổng chi tiêu cho mọi budget đang active.
*   **Task 2.3: Bổ sung API Route**
    *   *Subtask 2.3.1*: Thêm endpoint `GET /api/budgets/:id/transactions` trong `routes/budgets.ts`.

### Phase 3: Goals & Bills Accuracy Fix (Logic tài chính & Security)
*Mục tiêu: Sửa lỗi tính Net Worth do Goal gây ra và bảo mật phần thanh toán Bill.*

*   **Task 3.1: Goal Transactions Fix**
    *   *Subtask 3.1.1*: Sửa `contributeToGoal` trong `goal-service.ts` để sinh transaction loại `transfer` thay vì `expense`.
    *   *Subtask 3.1.2*: Tạo bảng hoặc config system categories để map ID cho "Savings", xóa đoạn hardcode so sánh string "Tiết Kiệm".
    *   *Subtask 3.1.3*: Thêm hàm `withdrawFromGoal` và API endpoint `POST /api/goals/:id/withdraw`.
*   **Task 3.2: Bill Security & Aggregation**
    *   *Subtask 3.2.1*: Đảm bảo hàm tính status của Bill dùng SQL `SUM(amount_paid)` trong bảng `bill_payments`, tuyệt đối không `.reduce` bằng Javascript array.
    *   *Subtask 3.2.2*: Kiểm tra kỹ `Idempotency-Key` (chống double charge khi mạng lag) ở bước lưu bill payment.

### Phase 4: Standardization & Formatting (Code Clean & Dễ Đọc)
*Mục tiêu: Thiết lập tiêu chuẩn bắt lỗi chung cho mọi file.*

*   **Task 4.1: Chuẩn hoá Error Catcher & Console**
    *   *Subtask 4.1.1*: Xây dựng hệ thống class Custom Error: `AppError`, `NotFoundError`, `ConflictError`, `ValidationError`.
    *   *Subtask 4.1.2*: Thay thế các cú pháp rườm rà `throw Object.assign(new Error(...), { code: ... })` bằng custom class (VD: `throw new NotFoundError("Budget not found")`).
    *   *Subtask 4.1.3*: Tích hợp `pino` logger vào Hono Error Middleware. Redact toàn bộ dữ liệu nhạy cảm. **Cấm sử dụng `console.log` và `console.error` tự do**. Mọi lỗi được in ra phải theo định dạng JSON có timestamp và request context.
*   **Task 4.2: Áp dụng Repository Pattern Triệt Để**
    *   *Subtask 4.2.1*: Di chuyển mọi câu lệnh Drizzle SQL (`db.select()`, `db.insert()`) xuống tầng Repository (`packages/db/src/repositories/...`).
    *   *Subtask 4.2.2*: Tầng Service (ví dụ `budget-service.ts`) CHỈ chứa business logic (kiểm tra điều kiện, validation nghiệp vụ, gọi Repository, xử lý Decimal). Code sẽ ngắn và cực kỳ dễ đọc.

---
*Generated by Antigravity V1.2 - S2S Finance System*
