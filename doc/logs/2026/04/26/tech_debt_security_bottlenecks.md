# Báo cáo: Tech Debt, Security Risks & Bottlenecks

Bản phân tích chuyên sâu về các khoản nợ kỹ thuật (Tech Debt), rủi ro bảo mật (Security Risks) và các điểm thắt cổ chai hiệu năng (Bottlenecks) trong hệ thống Finance Tracker V3.

---

## 1. 🛑 Nợ Kỹ Thuật (Technical Debt)
- **Thiếu Optimistic Concurrency Control (OCC) toàn diện**: Hiện tại các bảng thay đổi liên tục (như `wallet` balance hoặc `goals` currentAmount) chưa có cột `version`. Nếu 2 API cập nhật cùng lúc, thay đổi của API đến trước có thể bị ghi đè (Lost Update).
- **Phụ thuộc vào Client-side tính toán**: Một số tính toán tiến độ (Progress) có thể đang đẩy về Frontend để cộng trừ, trong khi nên xử lý bằng SQL `SUM()` để đảm bảo nhất quán.
- **Thiếu Data Seeding & Mock Data linh hoạt**: Các E2E Tests hiện tại (Playwright) có thể sẽ bị flacky (chạy lúc đậu lúc rớt) nếu không có cơ chế reset/seed database riêng biệt cho từng test run.
- **Chưa chuẩn hóa Pagination**: API lấy danh sách giao dịch (Transactions) cần phải đảm bảo Cursor-based Pagination thay vì Offset-based Pagination để tránh UI bị giật lag khi database lên tới hàng triệu dòng.

---

## 2. 🔐 Rủi Ro Bảo Mật (Security Risks)
- **IDOR (Insecure Direct Object Reference)**: Mặc dù các Repository đã thêm `eq(table.userId, userId)`, nhưng chỉ cần 1 API route hoặc 1 Service mới quên truyền/kiểm tra `userId`, người dùng này sẽ xem hoặc xóa được giao dịch của người dùng khác. (Cần có 1 custom ESLint rule để bắt buộc mọi query phải có `userId`).
- **CSRF (Cross-Site Request Forgery)**: Dự án dùng JWT lưu trong `HttpOnly Cookie`. Dù đã có `SameSite=Lax`, nhưng với các POST/DELETE request nhạy cảm, vẫn cần thêm Anti-CSRF token hoặc kiểm tra `Origin` Header một cách cực kỳ khắt khe ở Middleware.
- **Rò rỉ thông tin từ Error Handling**: Dù đã bọc bằng `try-catch` và dùng custom `err()` response, cần đảm bảo `pino` logger ở production tự động xóa (redact) toàn bộ SQL errors. Nếu SQL error văng ra ngoài Client, hacker sẽ biết cấu trúc Database.
- **Rate Limit Bypass**: Rate Limit dùng Upstash Redis. Nếu Redis gặp sự cố (timeout), Middleware Rate Limit cần phải `fail-open` (cho qua) hay `fail-closed` (chặn lại)? Nếu `fail-open`, hệ thống dễ bị DDoS khi Redis sập.

---

## 3. ⏳ Điểm Nghẽn Hiệu Năng (Bottlenecks)
- **Truy vấn Aggregate Tổng Quan Ngân Sách (Budget Summary)**:
  - Endpoint `GET /api/budgets/summary` phải lấy toàn bộ Budget và tính toán tổng số tiền đã chi tiêu (`spent`) từ bảng `transactions`. Khi user có hàng ngàn giao dịch, lệnh `SUM` mỗi lần mở App sẽ làm CPU của TiDB quá tải.
  - **Giải pháp**: Cần tạo bảng phụ (Materialized View) hoặc lưu cache trên Redis, hoặc thiết kế **Eventual Consistency** (khi có giao dịch mới, background worker sẽ cập nhật số `spent` vào bảng `budgets` luôn, thay vì tính toán on-the-fly).
- **Cold Start của Serverless DB (TiDB) & API**:
  - Hono API và TiDB đều chạy dạng serverless. Request đầu tiên sau 1 thời gian không dùng sẽ mất 2-4 giây.
  - **Giải pháp**: Dùng React Query trên Frontend với chế độ `staleTime` cao + Optimistic UI (hiển thị UI ngay lập tức khi bấm nút, âm thầm gọi API ở dưới).
- **Nghẽn cổ chai mạng (Network Waterfall)**:
  - Dashboard gọi song song 4-5 API (`/budgets/summary`, `/transactions`, `/wallets`, ...). 
  - **Giải pháp**: Nên gom lại thành một endpoint `/api/dashboard/init` duy nhất cho lần tải trang đầu tiên để giảm thiểu latency (HTTP overhead).
