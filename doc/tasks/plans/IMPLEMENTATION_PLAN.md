# Kế Hoạch Triển Khai Tái Cấu Trúc UI (Implementation Plan)

Kế hoạch này được xây dựng dựa trên **Giao thức Tái cấu trúc Nguyên tử (Atomic Reconstruction Protocol)** và các pattern frontend hiện đại nhằm đảm bảo việc hợp nhất (merge) UI từ React thuần sang Next.js App Router diễn ra an toàn, tối ưu hiệu năng và giữ nguyên vẹn logic tài chính.

## 1. Mục Tiêu Khảo Sát & Bóc Tách (Static Analysis & Deconstruction)
Mã nguồn UI mới hiện đang nằm trong vùng đệm `apps/web/_migration_buffer/extracted/`.
*   **Quét Dependency (`package.json`):** Kiểm tra và loại bỏ các package gây xung đột như `react-router` (thay bằng `next/navigation`), đảm bảo các package giao diện (Radix UI, Framer Motion, Tailwind) tương thích với React 19.
*   **Phân loại Component:** Bóc tách các component trong UI mới thành 2 loại:
    *   **Server Components (Default):** Layouts, Pages, các thành phần hiển thị tĩnh không có trạng thái (`useState`) hoặc hiệu ứng vòng đời (`useEffect`).
    *   **Client Components (Islands):** Thêm `"use client"` vào đầu các component tương tác (Forms, Modals, Buttons, Charts) để giới hạn kích thước JavaScript bundle tải xuống trình duyệt.

## 2. Diều Hướng & Layout (Routing & Shell Construction)
*   **Layout Chính:** Thiết lập lại `apps/web/src/app/layout.tsx` sử dụng cấu trúc Shell của UI mới (Sidebar, Header) nhưng giữ nguyên cơ chế Provider của Next.js (ThemeProvider, QueryClientProvider).
*   **Cấu Trúc Thư Mục:** Ánh xạ cấu trúc `src/app/pages/` từ UI cũ sang chuẩn File-system Routing của Next.js App Router (ví dụ: `src/app/(dashboard)/page.tsx`, `src/app/(dashboard)/transactions/page.tsx`).
*   **Thay thế Link:** Đổi toàn bộ `<Link to="...">` của React Router thành `<Link href="...">` của Next.js.

## 3. Tích Hợp Luồng Dữ Liệu (Data Binding & Logic Injection)
Đây là bước "ghép tạng" quan trọng nhất, chuyển giao diện tĩnh thành ứng dụng sống:
*   **Loại bỏ Mock Data:** Thay thế toàn bộ dữ liệu tĩnh (`mockData.ts`) bằng dữ liệu thật.
*   **Kết nối Hooks:** Import và sử dụng các hooks từ `apps/web/src/_lib/hooks/finance.tsx` (ví dụ: `useTransactions`, `useBudgetSummary`) vào các Client Component tương ứng.
*   **Optimistic UI & Resilience:** Cắm các hàm mutation (`mutate`) từ hooks vào các nút Submit của Form. Đảm bảo UI mới kết thừa được khả năng cập nhật tức thì (Optimistic Update) và tự động hoàn tác (Rollback) khi có lỗi.
*   **Xử lý Lỗi (Toasts):** Tích hợp thư viện thông báo (Sonner) của UI mới với cơ chế bắt lỗi kèm **TraceID (Correlation ID)** để phục vụ truy vết hệ thống.

## 4. An Toàn Tiền Tệ (Financial Precision Guard)
*   **Ép kiểu dữ liệu:** Rà soát toàn bộ các props truyền vào UI liên quan đến tiền tệ và ID, đảm bảo chúng luôn là kiểu `string`, không bị chuyển thành `number`.
*   **Tính toán Frontend:** Thay thế mọi phép toán `+`, `-`, `*`, `/` thông thường bằng `Decimal.js` để tránh sai số thập phân.

## 5. Xử Lý CSS & Tài Nguyên Tĩnh (Styling & Assets)
*   **Tailwind v4:** Di chuyển cấu hình và các file CSS nền tảng (variables, base styles) vào `apps/web/src/app/globals.css`. Kiểm tra xung đột class name.
*   **Thư mục Public:** Đưa toàn bộ hình ảnh, icon, font chữ tĩnh vào thư mục `apps/web/public/` của Next.js để tối ưu hóa việc phân phối tài nguyên.

## 6. Thẩm Định Bàn Giao (Final Audit)
*   Chạy kiểm tra kiểu tĩnh: `pnpm typecheck`.
*   Phát hiện và xử lý lỗi Hydration (Hydration Mismatch) bằng cách kiểm tra các cảnh báo trên console ở môi trường dev.
*   Đảm bảo không có lỗi rò rỉ dữ liệu (không lộ thông tin nhạy cảm ở client-side).
