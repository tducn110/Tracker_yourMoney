# Lộ Trình Phát Triển Frontend Thành Web App Hoàn Chỉnh (Roadmap)

Để đưa dự án từ trạng thái "Khung sườn Backend mạnh" thành một **Web App hoàn chỉnh, xịn xò (Premium Aesthetics)**, chúng ta sẽ áp dụng chiến lược **"Frontend-Driven Development"** (Xây dựng UI trước, gọi API sau). Dưới đây là lộ trình gồm 5 giai đoạn:

---

## 🛠️ Phase 1: Hoàn thiện Core CRUD UI (UI Cốt lõi)
**Mục tiêu**: Đảm bảo tất cả những gì Backend có, Frontend đều có màn hình tương tác.
- **Bước 1.1: Quản trị Category (Danh mục)**
  - Xây dựng màn hình `Settings > Categories`.
  - Hỗ trợ tạo danh mục mới (chọn Icon từ thư viện Lucide, chọn màu sắc gradient).
  - Tích hợp API `POST /api/categories`.
- **Bước 1.2: Quản lý Ví (Wallet Management)**
  - Mở rộng `CashWalletStrip` thành trang `/wallets` chi tiết.
  - Xây dựng Modal "Chuyển tiền giữa các ví" (Transfer) - Gọi API `POST /api/transactions` với type `transfer`.
- **Bước 1.3: Tương tác với Mục tiêu (Goals) & Hóa đơn (Bills)**
  - UI: Thêm nút **"Nạp tiền vào mục tiêu" (Fund Goal)** trên thẻ Goal. Dùng animation trượt (Framer/Motion) khi thanh tiến trình (progress bar) tăng lên.
  - UI: Thêm nút **"Đánh dấu đã thanh toán" (Mark as Paid)** trên thẻ Bill. Cập nhật cache React Query ngay lập tức.

## 🚀 Phase 2: Offline-First & Trải nghiệm Mượt mà (Optimistic UI)
**Mục tiêu**: Loại bỏ cảm giác "chờ đợi API", người dùng thao tác không độ trễ.
- **Bước 2.1: Triển khai Optimistic Updates toàn diện**
  - Mọi thao tác Thêm/Sửa/Xóa giao dịch đều phải cập nhật bộ nhớ đệm của React Query (`['budgets', 'summary']`) trước khi nhận phản hồi từ server. Nếu server báo lỗi (ví dụ: mất mạng), tự động rollback UI lại trạng thái cũ và báo lỗi qua `sonner` toast.
- **Bước 2.2: Đồng bộ Ví Offline (LocalStorage)**
  - `CashWallet` hiện tại có tính chất offline-first. Cần viết logic Reconciliation (Đối soát): Khi có mạng, tự động push các giao dịch tiền mặt từ `LocalStorage` lên TiDB thông qua background sync.

## 📊 Phase 3: Analytics Chuyên Sâu (Visual Excellence)
**Mục tiêu**: Làm cho Dashboard trông "Premium" với các biểu đồ sống động.
- **Bước 3.1: Tích hợp Line Chart & Bar Chart**
  - Sử dụng `Recharts` để vẽ biểu đồ Line Chart thể hiện Biến động số dư (Balance Trend) theo ngày trong tháng trên trang `/analytics`.
  - Thêm hiệu ứng *tooltip* mượt mà, màu sắc theo quy tắc Tâm lý học Budget (Xanh/Vàng/Đỏ).
- **Bước 3.2: Export/Import Data**
  - Chức năng xuất dữ liệu ra file Excel/CSV bằng thư viện frontend (như `xlsx`) cho phép người dùng backup lịch sử chi tiêu.

## 🤖 Phase 4: AI & Tự Động Hóa (Automation)
**Mục tiêu**: Mang lại tính năng "Killer" cho ứng dụng.
- **Bước 4.1: UI Quick Add NLP**
  - Hoàn thiện Modal "Nhập Nhanh" (Quick Add). Khi user gõ "Ăn sáng 35k", gửi request lên `Adapter NLP` của backend. 
  - Hiển thị Skeleton loading sang trọng trong lúc chờ AI bóc tách dữ liệu.
- **Bước 4.2: Lặp Hóa Đơn Tự Động (Recurring)**
  - Frontend sẽ thiết lập màn hình cấu hình tự động tạo Transaction vào ngày 1 hàng tháng đối với các Bills có cờ `autoPay`.

## 🧪 Phase 5: PWA & QA Testing (Sẵn sàng Production)
**Mục tiêu**: Đóng gói App và đảm bảo 0% lỗi tài chính.
- **Bước 5.1: Chuyển đổi thành Progressive Web App (PWA)**
  - Thêm `manifest.json` và Service Worker để người dùng có thể tải App về màn hình điện thoại (Add to Home Screen) như một App Native.
- **Bước 5.2: E2E Testing (Playwright)**
  - Áp dụng Workflow TDD (`@tdd-workflow`): Viết test Playwright tự động đăng nhập, nhập giao dịch "35k", kiểm tra thẻ Budget Overview có bị trừ đúng 35k không. Test bắt buộc phải passing 100% trước khi Merge vào `main`.
