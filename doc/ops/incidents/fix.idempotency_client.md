# FIX: MISSING IDEMPOTENCY HEADERS IN API CLIENT

**Vấn đề:** 
Các request mutation (POST, PATCH, PUT) liên quan đến tài chính (`/transactions`, `/bills/pay`, `/goals/contribute`) chưa gửi kèm header `Idempotency-Key`, dẫn đến nguy cơ dữ liệu bị trùng lặp khi người dùng retry hoặc mạng chập chờn.

**Nguyên nhân:**
`@finance/api-client` chưa được cấu hình để chấp nhận và chuyển tiếp các header tùy chỉnh trong các hàm helper.

**Giải pháp:**
1. Cập nhật `packages/api-client/src/index.ts` để cho phép truyền `options.headers` vào các method gọi API.
2. Tích hợp tự động tạo UUID trong các React Query hooks ở `apps/web/src/_lib/hooks/finance.ts`.

**Kết quả:**
- Toàn bộ các yêu cầu mutation giờ đây đều mang theo một `Idempotency-Key` duy nhất.
- Backend có thể nhận diện và từ chối các yêu cầu trùng lặp một cách an toàn.

**Ngày:** 19/04/2026  
**Status:** ✅ Fixed
