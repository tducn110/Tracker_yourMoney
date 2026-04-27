# Cập nhật: 2026-04-27 - Tái cấu trúc Frontend (Container-Presentational)

Tiến hành tách biệt Data Fetching và UI cho tất cả các trang chính trong hệ thống theo chuẩn Container-Presentational Pattern.

## Nội dung thực hiện:

### 1. Phân tích & Chuẩn bị (Phase 0 & 1)
- [x] Đã hoàn thành tách riêng Page Analytics.
  - Tạo `AnalyticsContainer.tsx` gọi hook `useCategorySpending` và `useMonthlyTrend`.
  - Tạo `AnalyticsView.tsx` nhận data và render Recharts.
  - Sửa `analytics/page.tsx` thành Server Component bọc Suspense.

### 2. Quản lý Giao dịch (Phase 2)
- [x] Tách riêng Page Transactions.
  - Tạo `TransactionsContainer.tsx`.
  - Tạo `TransactionsView.tsx`.
  - Sửa `transactions/page.tsx` thành Server Component bọc Suspense.

### 3. Hóa đơn định kỳ (Phase 3)
- [x] Tách riêng Page Bills.
  - Tạo `BillsContainer.tsx`.
  - Tạo `BillsView.tsx`.
  - Sửa `bills/page.tsx` thành Server Component bọc Suspense.

### 4. Mục tiêu tài chính (Phase 4)
- [x] Tách riêng Page Goals.
  - Tạo `GoalsContainer.tsx`.
  - Tạo `GoalsView.tsx`.
  - Sửa `goals/page.tsx` thành Server Component bọc Suspense.

### 5. Cài đặt hệ thống (Phase 5)
- [x] Tách riêng Page Settings.
  - Tạo `SettingsContainer.tsx`.
  - Tạo `SettingsView.tsx`.
  - Sửa `settings/page.tsx` thành Server Component bọc Suspense.

### 6. Rà soát Dashboard (Phase 6)
- [x] Đánh giá lại Dashboard:
  - Loại bỏ `'use client';` khỏi `apps/web/src/app/(dashboard)/page.tsx` để biến nó thành Server Component.
  - Các component con (`SimpleQuickInput`, `OverviewSummaryCard`...) vẫn là Client Component để handle state và fetch data (tương tự chức năng Container).
