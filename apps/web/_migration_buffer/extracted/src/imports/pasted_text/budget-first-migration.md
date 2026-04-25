Dưới đây là kế hoạch chi tiết để **loại bỏ S2S Engine** và **thay thế bằng Budget-First**, nơi người dùng chủ động tạo và quản lý hạn mức chi tiêu cho từng danh mục.

---

# 📋 Implementation Plan: Chuyển đổi từ S2S sang Budget-First

## 1. Tổng Quan Thay Đổi

| Thành phần | Trước (S2S Engine) | Sau (Budget-First) |
| :--- | :--- | :--- |
| **Logic chính** | Tự động tính `S2S = Income - Expense - Bills - Goals` | Người dùng tự tạo `Budget` cho từng `Category` với `limit`. |
| **Dashboard Hero** | `S2SHeroSection` hiển thị "Khoảng chi an toàn" | `BudgetOverview` hiển thị "Tổng ngân sách còn lại" = Tổng limit - Tổng spent. |
| **Tab chính** | Dashboard, Transactions, Goals, Bills, Analytics, Settings | Dashboard, Transactions, **Budgets**, Analytics, Settings. |
| **Nhập liệu** | Quick Add → tự động trừ vào S2S | Quick Add → tự động trừ vào `spent` của Budget tương ứng. |
| **Database** | `user_settings` (emergency_buffer, monthly_budget) | Bảng `budgets`, `budget_categories`. |

---

## 2. Các Bước Triển Khai

### Giai đoạn 1: Database Migration

#### 2.1. Tạo bảng `budgets`

```sql
CREATE TABLE budgets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    budget_limit DECIMAL(15,2) NOT NULL,
    wallet_scope ENUM('all', 'specific') DEFAULT 'all',
    wallet_id BIGINT UNSIGNED NULL,
    period_type ENUM('weekly', 'monthly', 'quarterly', 'yearly', 'custom') NOT NULL DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_all_categories BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'finished') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE SET NULL,
    INDEX idx_user_period (user_id, start_date, end_date)
);
```

#### 2.2. Tạo bảng `budget_categories`

```sql
CREATE TABLE budget_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    budget_id BIGINT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,

    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_budget_category (budget_id, category_id)
);
```

#### 2.3. Cập nhật bảng `transactions`

```sql
ALTER TABLE transactions ADD COLUMN exclude_from_report BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN wallet_id BIGINT UNSIGNED NULL;
ALTER TABLE transactions ADD FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE SET NULL;
```

#### 2.4. Xóa các trường không dùng trong `user_settings`

```sql
-- Không cần emergency_buffer và monthly_budget nữa, có thể xóa hoặc giữ lại cho mục đích khác
-- ALTER TABLE user_settings DROP COLUMN emergency_buffer;
-- ALTER TABLE user_settings DROP COLUMN monthly_budget;
```

---

### Giai đoạn 2: Backend - Service & API

#### 3.1. `BudgetService` (apps/api/src/services/budget-service.ts)

```typescript
export class BudgetService {
  constructor(private budgetRepo: BudgetRepository, private transactionRepo: TransactionRepository) {}

  async getRunningBudgets(userId: string, date: string): Promise<BudgetWithStatus[]> {
    const budgets = await this.budgetRepo.findActiveByDate(userId, date);
    return Promise.all(budgets.map(async (budget) => {
      const spent = await this.calculateSpent(budget);
      const percent = new Decimal(spent).dividedBy(budget.budgetLimit).times(100).toNumber();
      const left = new Decimal(budget.budgetLimit).minus(spent);
      return { ...budget, spent, left: left.toFixed(2), percent };
    }));
  }

  private async calculateSpent(budget: Budget): Promise<string> {
    // Lọc giao dịch theo budget_categories, wallet_scope, start_date, end_date
    // exclude_from_report = FALSE
    const result = await this.transactionRepo.sumByBudget(budget);
    return result ?? "0.00";
  }

  async createBudget(userId: string, input: CreateBudgetInput): Promise<Budget> {
    // Validate: nếu is_all_categories = true, kiểm tra tổng limit của các budget con không vượt quá
    // Lưu budget và budget_categories
  }

  async getBudgetDetails(budgetId: string, userId: string): Promise<BudgetDetails> {
    // Trả về đầy đủ thông tin: spent, left, percent, recommendedDaily, projectedSpending, transactions list
  }
}
```

#### 3.2. API Endpoints

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/v1/budgets/running?date=2026-04-22` | Lấy danh sách budgets đang active. |
| `POST` | `/api/v1/budgets` | Tạo budget mới. |
| `GET` | `/api/v1/budgets/:id` | Chi tiết budget. |
| `PUT` | `/api/v1/budgets/:id` | Cập nhật budget. |
| `DELETE` | `/api/v1/budgets/:id` | Xóa budget. |
| `GET` | `/api/v1/budgets/summary?date=2026-04-22` | Tổng limit và tổng spent cho Dashboard. |

#### 3.3. Cập nhật `TransactionService`

Khi tạo giao dịch `expense`, tự động cập nhật `spent` cho các budget liên quan (hoặc tính toán động khi query).

---

### Giai đoạn 3: Frontend - Thay Đổi UI

#### 4.1. Dashboard: Thay `S2SHeroSection` bằng `BudgetOverview`

**File cần sửa:** `apps/web/src/app/(dashboard)/page.tsx` và `apps/web/src/_components/s2s/S2SHeroSection.tsx`.

**Component mới:** `BudgetOverviewCard`

```tsx
// apps/web/src/_components/budgets/BudgetOverviewCard.tsx
import { useBudgetSummary } from '@/_lib/hooks/finance';
import { formatVND } from '@finance/api-client';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function BudgetOverviewCard() {
  const { data, isLoading } = useBudgetSummary();

  if (isLoading) return <Skeleton className="h-32" />;

  const { totalLimit, totalSpent, left, percent } = data;
  const isOverBudget = percent >= 100;

  return (
    <div className="glass p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-2">
        {isOverBudget ? <TrendingDown className="text-red-500" /> : <TrendingUp className="text-green-500" />}
        <h2 className="text-lg font-semibold">Ngân sách tháng này</h2>
      </div>
      <p className="text-4xl font-bold">{formatVND(left)}</p>
      <p className="text-sm text-gray-500 mt-1">còn lại để chi tiêu</p>
      <div className="mt-4">
        <div className="flex justify-between text-sm">
          <span>Đã chi: {formatVND(totalSpent)}</span>
          <span>Hạn mức: {formatVND(totalLimit)}</span>
        </div>
        <Progress value={percent} className="mt-2" indicatorColor={isOverBudget ? 'bg-red-500' : 'bg-green-500'} />
      </div>
    </div>
  );
}
```

#### 4.2. Tab "Budgets" (Mới)

Tạo trang `apps/web/src/app/(dashboard)/budgets/page.tsx`:

- Hiển thị danh sách budgets đang chạy.
- Mỗi budget là một `BudgetCard` với progress bar 4 màu (Xám/Xanh/Cam/Đỏ).
- Nút "+" để tạo budget mới (mở `BudgetFormModal`).
- Menu "Finished budgets" để xem budgets đã kết thúc.

#### 4.3. `BudgetFormModal`

- Form chọn: Tên budget, hạn mức, kỳ hạn (Tuần/Tháng/Quý/Tùy chỉnh), ví áp dụng (Tất cả hoặc ví cụ thể).
- **Multi-select danh mục**: Cho phép chọn nhiều danh mục (kể cả danh mục cha và con). Hiển thị cây danh mục.
- Checkbox "All Categories" để tạo budget tổng.

#### 4.4. `BudgetDetailPage`

Trang chi tiết budget (`/budgets/[id]`):

- Header: Tên budget, hạn mức, spent, left, progress bar.
- Thông tin bổ sung: Ví áp dụng, thời gian.
- **Recommended daily spending**: `(limit - spent) / daysRemaining`.
- **Projected spending**: `(spent / daysElapsed) * totalDays`.
- Danh sách giao dịch thuộc budget (lọc theo `budget_categories` và `exclude_from_report = FALSE`).
- Biểu đồ đường (line chart) so sánh chi tiêu thực tế với kế hoạch.

#### 4.5. Cập nhật `QuickAddModal`

- Thêm trường **Chọn Ví** (Wallet selector) vào form nhập nhanh.
- Khi chọn category, nếu category đó có budget đang active, hiển thị nhỏ dòng "Ngân sách còn: XXX ₫".

#### 4.6. Cập nhật Navigation

Thay tab "Goals" bằng tab "Budgets" trong `Sidebar` và `BottomNav`.

```tsx
// apps/web/src/_components/layout/Sidebar.tsx
const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Tổng Quan' },
  { path: '/transactions', icon: ListOrdered, label: 'Giao Dịch' },
  { path: '/budgets', icon: Target, label: 'Ngân Sách' }, // <-- thay đổi
  { path: '/bills', icon: Receipt, label: 'Hóa Đơn' },
  { path: '/analytics', icon: BarChart3, label: 'Phân Tích' },
  { path: '/settings', icon: Settings, label: 'Cài Đặt' },
];
```

---

### Giai đoạn 4: Dọn Dẹp

#### 5.1. Xóa code liên quan đến S2S Engine

- Xóa hoặc comment `S2SService`, `S2SRoutes` (có thể giữ lại để tham khảo).
- Xóa `S2SHeroSection` cũ.
- Xóa các trường `emergency_buffer`, `monthly_budget` khỏi `user_settings` (nếu không dùng cho mục đích khác).

#### 5.2. Cập nhật Rules & Docs

- Cập nhật `.agent/rules/coding-standards.md`: Thay S2S bằng Budget-First.
- Cập nhật `README.md` và `project-context.md`.

---

## 3. Tóm Tắt Các File Cần Tạo/Sửa

| File | Hành động | Mô tả |
| :--- | :--- | :--- |
| `packages/db/src/schema/budgets.ts` | Tạo mới | Schema cho `budgets`, `budget_categories` |
| `apps/api/src/services/budget-service.ts` | Tạo mới | Business logic cho Budget |
| `apps/api/src/routes/budgets.ts` | Tạo mới | API endpoints |
| `apps/web/src/_components/budgets/BudgetOverviewCard.tsx` | Tạo mới | Widget Dashboard thay S2S |
| `apps/web/src/_components/budgets/BudgetCard.tsx` | Tạo mới | Card hiển thị budget |
| `apps/web/src/_components/budgets/BudgetFormModal.tsx` | Tạo mới | Form tạo/chỉnh sửa budget |
| `apps/web/src/app/(dashboard)/budgets/page.tsx` | Tạo mới | Trang danh sách budgets |
| `apps/web/src/app/(dashboard)/budgets/[id]/page.tsx` | Tạo mới | Trang chi tiết budget |
| `apps/web/src/_lib/hooks/finance.ts` | Sửa | Thêm `useBudgets`, `useBudgetSummary`, `useCreateBudget` |
| `packages/api-client/src/endpoints.ts` | Sửa | Thêm `budgetsAPI` |
| `apps/web/src/_components/layout/Sidebar.tsx` | Sửa | Đổi "Mục Tiêu" thành "Ngân Sách" |
| `apps/web/src/app/(dashboard)/page.tsx` | Sửa | Thay `S2SHeroSection` bằng `BudgetOverviewCard` |

---

## 4. Kế Hoạch Thực Hiện (Timeline)

| Giai đoạn | Công việc | Dự kiến |
| :--- | :--- | :--- |
| **1** | Database migration (tạo bảng `budgets`, `budget_categories`, thêm cột) | 1 giờ |
| **2** | Backend: `BudgetService`, `BudgetRepository`, API endpoints | 3 giờ |
| **3** | Frontend: Trang Budgets, BudgetCard, BudgetFormModal | 3 giờ |
| **4** | Frontend: Dashboard (BudgetOverviewCard), QuickAdd tích hợp | 2 giờ |
| **5** | Frontend: Trang chi tiết Budget | 2 giờ |
| **6** | Dọn dẹp S2S cũ, cập nhật navigation | 1 giờ |
| **7** | Testing & Fix bugs | 2 giờ |

**Tổng thời gian dự kiến:** ~14 giờ làm việc.

---

Bạn có thể dùng kế hoạch này để triển khai từng bước. Nếu cần tôi viết sẵn code cho bất kỳ phần nào, hãy cho tôi biết.