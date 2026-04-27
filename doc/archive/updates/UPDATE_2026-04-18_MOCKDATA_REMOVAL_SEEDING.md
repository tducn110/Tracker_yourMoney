# UPDATE: MOCK DATA REMOVAL & DATABASE SEEDING — Finance Tracker
**Real Data Integration & Environment Configuration Report**

**Ngày:** 18/04/2026  
**Project Phase:** Backend Integration & Data Seeding  
**Feature Status:** 🟢 Production Ready

---

## 🎯 OBJECTIVE
Chuyển đổi ứng dụng từ trạng thái sử dụng dữ liệu giả (Mock Data) sang sử dụng dữ liệu thực tế từ Database thông qua API. Tự động hóa quá trình khởi tạo dữ liệu mẫu (Seeding) cho người dùng demo để phục vụ phát triển và kiểm thử.

---

## 🏗️ IMPLEMENTED FEATURES

### 1. Database Seeding Tool (`packages/db/src/scripts`)
- **seed-demouser.ts:** Script tự động khởi tạo dữ liệu cho người dùng `demouser@gmail.com`.
- **Data Coverage:**
    - Khởi tạo `users` và `user_settings`.
    - Seed danh sách `categories` chuẩn hệ thống.
    - Seed `transactions`, `bills`, và `goals` thực tế từ triết lý Budget.
    - Khởi tạo số dư `cash_wallet` (1,500,000 VND).
- **Type Safety:** Xử lý nhất quán kiểu dữ liệu `bigint` và `string` cho IDs giữa các bảng.

### 2. Frontend Real-Data Transition (`apps/web/_lib/hooks`)
- **Mock Disabling:** Thiết lập `USE_MOCK = false` mặc định trong các hooks tài chính.
- **Hook Cleanup:** Loại bỏ tất cả các logic trả về dữ liệu giả và các imports từ `mock-data.ts`.
- **API Connectivity:** Sửa lỗi thiếu prefix `/api/v1` trong tất cả các endpoints của `api-client` và `api-fetcher`.

### 3. UI Component Decoupling
- **BudgetOverviewCard:** Loại bỏ default props là `mockBudgetData`, buộc component phải render dựa trên dữ liệu thực tế từ props.
- **Header:** Tích hợp hook `useUser` để hiển thị tên thật (`fullName`) từ Database thay vì hardcoded "Nguyễn Văn A".
- **CashWalletStrip:** Chuyển đổi sang sử dụng dữ liệu số dư thực tế từ API.

---

## 🧪 VERIFICATION RESULTS

- [x] **Seeding Flow:** Script chạy thành công trên TiDB Cloud, tạo đầy đủ các bản ghi liên kết.
- [x] **API Endpoints:** Tất cả các request đến `/api/v1/...` đều trả về dữ liệu 200 OK.
- [x] **State Sync:** Thay đổi giao dịch trên Dashboard cập nhật ngay lập tức các chỉ số Budget từ Backend.
- [x] **Zero Mock:** Đã xóa hoàn toàn file `mock-data.ts`, đảm bảo không còn dữ liệu giả trong bundle.

---
**Last Updated:** 18/04/2026  
**Owner:** Antigravity AI Assistant  
**Follow-up:** Triển khai Authentication UI Flow hoàn chỉnh (Login/Register redirects).
