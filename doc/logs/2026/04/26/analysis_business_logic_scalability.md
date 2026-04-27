# Phân tích Business Logic & Scalability (Khả năng mở rộng)

## 1. Hiện trạng hoạt động của Business Logic

Toàn bộ logic nghiệp vụ (Business Logic) của dự án Finance Tracker V3 được tách biệt hoàn toàn khỏi tầng API (Controllers) thông qua **Service Layer Pattern** và **Dependency Injection (DI)**.

- **Vị trí cốt lõi**: `apps/api/src/services/`
- **Cơ chế**: Các service (như `BudgetService`, `TransactionService`, `AuthService`) không tự khởi tạo database connection. Thay vào đó, Repository và Adapter được tiêm (inject) vào thông qua file `container.ts`.
- **Quy trình hoạt động**: `Hono Route (API)` -> `Middleware (Auth/Zod)` -> `Service (Business Logic)` -> `Repository (DB/Drizzle)`.

## 2. Đánh giá "Hard Code" và Tính linh hoạt (Availability to Scale)

Hệ thống **rất ít hard code** và đã tuân theo các best-practices cho ứng dụng quy mô lớn:

- **Không hard code ID hay cấu hình**: Mọi truy vấn database đều bị ràng buộc (scoped) bằng biến `userId` (truyền từ JWT Middleware), đảm bảo dữ liệu Multi-tenant an toàn.
- **Nguyên tắc "Budget-First" linh hoạt**: Việc tính toán ngân sách (Budget) dựa hoàn toàn trên giao dịch thực tế kết hợp với `Decimal.js` (không dùng float number) -> Giải quyết triệt để sai số tài chính.
- **Adapter Pattern cho AI/NLP**: Việc parse giao dịch bằng text (ví dụ: "Ăn sáng 35k") được tách ra một Interface `INLPAdapter` và được Implement bằng `RegexNLPAdapter`. Khi muốn scale lên sử dụng AI (ChatGPT/Claude), chỉ cần viết một `AILanguageAdapter` mới rồi inject vào mà không cần đổi code gốc.

## 3. Khi mở rộng (Scale) cần làm gì?

Mặc dù kiến trúc rất ổn, nhưng khi mở rộng lượng User lớn cần chú ý:

1. **Caching Layer**: Hiện tại phần lớn đang query trực tiếp vào DB. Khi mở rộng, cần Implement `Redis` cho endpoint GET `/api/budgets/summary` vì hàm này tính toán tổng hợp khá nặng.
2. **Event-Driven / Queue**: Khi tạo giao dịch (`POST /transactions`), hệ thống phải cập nhật Budget, Update Cash Wallet. Khi lượng request lớn, nên tách các tác vụ này vào Queue (ví dụ dùng BullMQ hoặc Kafka) để xử lý bất đồng bộ, giảm thời gian phản hồi API.
3. **Microservices Ready**: Vì hệ thống đã dùng DI Container và Hono (Edge-ready), có thể dễ dàng tách `AuthService` hoặc `NLPService` ra thành các API Worker riêng biệt trên Cloudflare Workers.
