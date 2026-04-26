# Báo Cáo Toàn Diện: Rủi Ro Hệ Thống, Thiết Kế Dữ Liệu & Lộ Trình 20+ Giai Đoạn Deploy

Tài liệu này là bản ghi chép cực kỳ quan trọng (Critical Record) lưu trữ toàn bộ các rủi ro hệ thống hiện tại, phương pháp luận thiết kế, và một lộ trình siêu chi tiết (20 giai đoạn) từ lúc này cho đến khi vươn ra production (Deploy) để phục vụ hàng chục ngàn user.

---

## PHẦN 1: PHƯƠNG PHÁP LUẬN THIẾT KẾ (DATA FLOW DESIGN)

Tùy thuộc vào bản chất của tính năng, chúng ta có 2 cách suy luận (Design Flow) đúng đắn cho dự án này:

### Phương pháp 1: Frontend-Driven (Từ UI suy ra ERD)
*Áp dụng cho các tính năng chú trọng trải nghiệm (VD: Dashboard, Analytics, Quick Add).*
1. **Frontend (UI)**: Vẽ màn hình Dashboard, xác định cần biểu đồ "Chi tiêu 7 ngày qua".
2. **Business Logic (BFF - Backend For Frontend)**: Nhận thấy để render biểu đồ này mượt, UI cần 1 mảng JSON `[{ date: '...', amount: '...' }]`.
3. **Backend API**: Tạo endpoint `/api/analytics/weekly-spend` trả về đúng cục JSON đó.
4. **ERD (Database)**: Để truy vấn nhanh cục JSON đó mà không làm sập server, ta cần thêm 1 cột `displayDate_Index` vào bảng `transactions` trong ERD.

### Phương pháp 2: Data-Driven (Từ ERD suy ra UI)
*Áp dụng cho các tính năng cốt lõi (Core Financials) như Giao dịch, Ví, Ngân sách.*
1. **ERD (Database)**: Tiền bạc không thể sai. Thiết kế chặt bảng `transactions` (bắt buộc có `walletId`, `categoryId`, `amount` kiểu DECIMAL, `type`).
2. **Backend Services**: Viết các service cực kỳ nghiêm ngặt bảo vệ dữ liệu (chặn âm tiền, chống double-spending bằng Idempotency Key).
3. **Business Logic (UI Controller)**: Bắt buộc form nhập liệu phải có các trường tương ứng (Zod Validator).
4. **Frontend (UI)**: Vẽ Form UI dựa trên Zod Schema đó.

*=> Khuyến nghị: Dự án Finance Tracker nên sử dụng **Phương pháp 2 cho phần Lõi (S2S Engine, Wallet, Transaction)** và **Phương pháp 1 cho phần Hiển thị (Dashboard, Charts, Goals)**.*

---

## PHẦN 2: CRITICAL RISKS (CÁC LỖ HỔNG & RỦI RO HIỆN TẠI CẦN NHỚ)

### 1. Kiểu dữ liệu (Data Types Vulnerability)
- 🚨 **Lỗi tràn số BigInt**: TiDB sinh ra ID kiểu `BigInt` (64-bit). JavaScript/JSON chỉ xử lý tốt số 53-bit. Nếu quên ép kiểu `id.toString()` ở Backend, frontend nhận được ID sẽ bị sai số (VD: `100000000000000001` thành `100000000000000000`). Điều này làm hỏng toàn bộ tính năng Xóa/Sửa.
- 🚨 **Decimal vs Float**: CSDL đã dùng `DECIMAL(15,2)`, nhưng trong code TS nếu lỡ dùng `Math.max()` hay `a + b` thay vì `new Decimal(a).plus(b)`, user sẽ bị mất tiền oan vì sai số dấu phẩy động (0.1 + 0.2 = 0.30000000000000004).

### 2. Cách truy vấn dữ liệu (Query Methods Bottlenecks)
- 🚨 **N+1 Query & Aggregate Cực Nặng**: Ở endpoint `/api/budgets/summary`, hệ thống đang `SELECT` toàn bộ giao dịch của tháng đó để `SUM()` lại số tiền đã tiêu. 
- 🚨 **Hệ thống chịu được bao nhiêu User?**: 
  - Với cách query hiện tại, TiDB Serverless chịu được khoảng **1,000 - 3,000 Active Users**. Nếu user có quá nhiều giao dịch, các lệnh `SUM()` sẽ làm CPU TiDB vọt lên 100% -> API Timeout 504.
  - **Cách giải quyết bắt buộc**: Phải tạo "Snapshot" (chốt sổ) hàng ngày hoặc Dùng Redis Cache (Upstash) lưu trữ số `spent` của budget, mỗi lần có giao dịch mới chỉ cần `Redis.incrby` thay vì vào SQL SUM lại từ đầu.

### 3. Vấn đề Cold Start
- 🚨 Vì dùng Edge/Serverless, nếu 5 phút không ai truy cập App, Database TiDB sẽ "ngủ". User đầu tiên vào lại sẽ phải đợi 3-5 giây. 

---

## PHẦN 3: LỘ TRÌNH 25 GIAI ĐOẠN ĐẾN PRODUCTION (DEPLOYMENT ROADMAP)

Để xử lý khối lượng công việc khổng lồ, chia dự án thành 25 Phase nhỏ (Sprints):

### Giai đoạn 1: Tái cấu trúc (Refactoring) & Clean UI (Phases 1-5)
- **Phase 1**: Tách toàn bộ Text/HTML thành file `locales/vi.json` để dễ quản lý.
- **Phase 2**: Sửa lại Màn hình Login (Bổ sung Animation, Loading Skeleton, Xử lý lỗi Firebase mượt mà).
- **Phase 3**: Áp dụng Container/Presentational Pattern cho Dashboard (Chia rẽ UI Component tĩnh và UI Controller gọi API).
- **Phase 4**: Viết custom hooks `useTransactions`, `useBudgets` bọc React Query để Gom nhóm API Calls.
- **Phase 5**: Thiết kế các "Empty States" (Trạng thái rỗng khi user mới chưa có giao dịch).

### Giai đoạn 2: Trám Lỗ Hổng Backend & Security (Phases 6-10)
- **Phase 6**: Kiểm tra toàn bộ code base: Đảm bảo 100% các phép tính tiền tệ đang dùng thư viện `Decimal.js`.
- **Phase 7**: Implement cơ chế Optimistic Concurrency Control (Thêm cột `version` cho ví `wallets` trong SQL, cập nhật `db:migrate`).
- **Phase 8**: Tối ưu `/api/budgets/summary`: Tích hợp Redis để Cache tổng số tiền chi tiêu.
- **Phase 9**: Gắn Rate Limit (chống DDoS) khắt khe hơn cho các API tạo/xoá dữ liệu.
- **Phase 10**: Cấu hình Pino Logger: Xóa (redact) các dữ liệu nhạy cảm khỏi console log.

### Giai đoạn 3: Hoàn thiện Tính Năng UI (Phases 11-15)
- **Phase 11**: Làm màn hình Cài đặt (`/settings`): Hỗ trợ CRUD (Thêm/Sửa/Xóa) cho Categories.
- **Phase 12**: Xây dựng Modal "Chuyển tiền giữa các ví" (Transfer Funds) kèm Logic API cập nhật 2 ví cùng lúc.
- **Phase 13**: Làm màn hình Chi tiết Mục tiêu (Goals): Nút "Nạp tiền" trích từ Ví Cash vào Goal.
- **Phase 14**: Làm biểu đồ phân tích (Analytics): Dùng Recharts vẽ Line Chart thu/chi theo tháng.
- **Phase 15**: Tích hợp Modal Quick Add bằng AI (Gõ "Ăn sáng 35k" tự nhận diện).

### Giai đoạn 4: Trải Nghiệm Mượt Mà (Phases 16-20)
- **Phase 16**: Cài đặt Optimistic UI (Thêm giao dịch -> Tiền giảm ngay lập tức trên màn hình chưa cần chờ API).
- **Phase 17**: Đồng bộ Offline-First cho Ví Tiền Mặt (`CashWallet`).
- **Phase 18**: Bổ sung Animation tổng thể với `framer-motion` (hoặc `motion/react`).
- **Phase 19**: Chuyển đổi thành Progressive Web App (PWA) để cài đặt lên điện thoại.
- **Phase 20**: Cải thiện Accessibility (a11y) và Responsive trên thiết bị gập (Z-Fold).

### Giai đoạn 5: Testing, QA & Deployment (Phases 21-25)
- **Phase 21 (Unit Testing)**: Đạt 100% Test Coverage cho toàn bộ hàm tính toán tiền tệ (`Decimal.js`).
- **Phase 22 (E2E Testing)**: Dùng Playwright viết script tự động Đăng nhập -> Thêm Giao dịch -> Check Số tiền.
- **Phase 23 (Pre-Deploy Checks)**: Chạy `pnpm typecheck`, `pnpm lint`, kiểm tra biến môi trường (`.dev.vars` / `.env`).
- **Phase 24 (Database Migration)**: Chạy `pnpm db:generate` và `pnpm db:migrate` lên TiDB Production.
- **Phase 25 (Vercel Deploy)**: Khởi chạy lệnh `vercel --prod`. Cấu hình env variables (`DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_API_URL`). Kiểm tra sức khỏe (Health Check) API thực tế.

---

## 🚀 KẾ HOẠCH DEPLOY (THEO CHUẨN `@/deploy`)
Khi hệ thống vượt qua **Phase 24**, việc đưa lên môi trường thật sẽ diễn ra như sau:
1. **Kiểm tra chất lượng**: `pnpm build` toàn bộ Monorepo.
2. **Bảo vệ Database**: Database Schema phải được đẩy lên TiDB bằng `pnpm db:migrate` (Tuyệt đối không dùng `db:push` trên production để tránh mất dữ liệu).
3. **Đẩy lên Vercel**: Apps Next.js (Web) và Hono (API) sẽ được host trên hệ thống Edge/Serverless của Vercel. 
4. **Hậu kiểm**: Test chức năng Login Cookie HttpOnly trên domain thật, Test hiệu năng chịu tải Cold Start.
