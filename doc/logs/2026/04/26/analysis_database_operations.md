# Phân tích Database Operations (SQL Drizzle & TiDB)

## 1. Cách Database Hoạt Động Hiện Tại
Hệ thống sử dụng cơ sở dữ liệu **TiDB Serverless** (tương thích MySQL) kết hợp với **Drizzle ORM** để quản lý Schema & Migration.
- **Tính trọn vẹn (Integrity)**: Tuân thủ tuyệt đối quy định tài chính. Mọi bảng dữ liệu liên quan (`transactions`, `budgets`, `goals`...) đều có trường `deletedAt`. Database **không sử dụng lệnh DELETE cứng**, chỉ sử dụng **Soft Delete** để đảm bảo khả năng đối soát (Audit) lịch sử.
- **Độ chính xác tiền tệ**: Database lưu trữ giá trị tiền tệ bằng kiểu `DECIMAL(15,2)` thay vì `FLOAT` hay `DOUBLE`. Điều này ngăn chặn tình trạng sai số khi tính toán số lẻ.
- **RLS (Row-Level Security) cấp ứng dụng**: Do TiDB HTTP mode không hỗ trợ RLS trực tiếp trên Database, Drizzle đã ép buộc mọi truy vấn đều phải kèm theo `userId` ở tầng Repository (ví dụ: `.where(eq(transactions.userId, userId))`).

## 2. Các Lỗi & Rủi Ro Thường Gặp Cần Lưu Ý
Dù hệ thống đã được thiết kế kỹ lưỡng, database vẫn có các rủi ro (đã được bọc/xử lý hoặc cần theo dõi thêm):
1. **Lỗi BigInt Serialization**:
   - ID sinh ra từ TiDB (AUTO_INCREMENT) là `BigInt` 64-bit. JavaScript mặc định chỉ hỗ trợ an toàn số tối đa `2^53 - 1`. 
   - **Xử lý hiện tại**: Trong Drizzle schema đã đặt cấu hình `mode: 'string'` (ví dụ: `bigint('id', { mode: 'string' })`). Bắt buộc **LUÔN LUÔN** truyền và nhận ID dạng `string` ở các API, tuyệt đối không dùng `parseInt()` hay `Number()`.
2. **Cold Start TiDB Serverless**:
   - Nếu app ít truy cập, TiDB có thể đưa vào trạng thái "sleep" và khi có request đầu tiên sẽ mất 2-3s để thức dậy. 
   - Điều này làm API Timeout. **Giải pháp**: Frontend bắt buộc phải dùng Optimistic UI (đã làm ở BudgetOverviewCard).
3. **Optimistic Concurrency Control (OCC) và Double Spending**:
   - Ở chế độ Serverless HTTP của Drizzle, tính năng transaction khóa hàng (`SELECT ... FOR UPDATE`) có thể bị giới hạn.
   - **Rủi ro**: Nếu 2 request nạp tiền cùng đến 1 lúc, số dư ví hoặc budget có thể bị ghi đè sai.
   - **Cách fix (tương lai)**: Nên thêm cột `version` (INT) vào các bảng có tính cộng dồn (như `budgets` hoặc `wallet`), khi UPDATE cần check `WHERE version = current_version` (OCC). Hiện tại, API đã có thiết kế Idempotency Key nhưng OCC vẫn là mức bảo vệ Database tầng sâu cần thiết.
