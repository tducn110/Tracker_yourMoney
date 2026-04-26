# S2S Finance Documentation

Chào mừng đến với hệ thống tài liệu của dự án S2S Finance Tracker V3. Để dễ dàng nắm bắt thông tin dự án và không bị lạc trong hệ thống doc, vui lòng đọc theo hướng dẫn dưới đây.

---

## 📖 Hướng Dẫn Đọc Tài Liệu (How to Read the Docs)

Nếu bạn là thành viên mới (Onboarding) hoặc AI Agent cần hiểu context của dự án, hãy đọc theo trình tự sau:

### Bước 1: Hiểu Tổng Quan (Overview & Architecture)

Hãy bắt đầu với thư mục `wiki/` - đây là "trái tim" của tài liệu.

- Đọc **`wiki/SYSTEM_ARCHITECTURE.md`** để nắm kiến trúc tổng quát (Next.js + Hono + Drizzle + TiDB).
- Đọc **`wiki/DATABASE_SCHEMA.md`** để nắm cấu trúc các bảng và quy tắc tài chính (Soft delete, Decimal).
- Đọc **`wiki/QUICKSTART.md`** để biết cách chạy dự án ở local.

### Bước 2: Nắm Bắt Định Hướng & Lộ Trình (Roadmaps & Plans)

Sau khi hiểu dự án làm gì, hãy xem dự án đang đi đến đâu.

- Mở thư mục **`05_Master_Tasks_Hierarchy/`** -> Đọc **`ROADMAP.md`** để biết tiến độ tổng thể.
- Mở các file Master Plan (như `S2S_Finance_50_Phase_Master_Plan.md`) để xem kế hoạch 50 Phase chi tiết.
- Thư mục **`plans/`** chứa các bản vẽ kỹ thuật chi tiết cho từng chức năng cụ thể sắp làm.

### Bước 3: Theo Dõi Tiến Độ Thực Tế (Daily/Feature Updates)

Khi cần biết hôm nay/tuần này dự án đã code thêm cái gì:

- Vào **`update-feature/`**: Đọc log chi tiết của các tính năng vừa được hoàn thành.
- Các thư mục log theo ngày (ví dụ: **`26/`**): Chứa các bản phân tích (Analysis) cục bộ do AI thực hiện vào ngày đó (vd: Tại sao load chậm, database operations,...).

### Bước 4: Kiểm Tra Lỗi & Quy Trình Deploy (Troubleshooting & Ops)

- Vào **`hot-fix/`**: Để xem lịch sử phân tích và cách fix các bug phức tạp (Cold Start, Type Error).
- Vào **`deploy-git/`**: Khi cần chuẩn bị release (Tài liệu về luồng CI/CD, Git flow).
- Vào **`check-list/`**: Dùng các checklist ở đây để đối chiếu trước khi merge code hoặc tung bản cập nhật.

---

## 📂 Cấu Trúc Thư Mục Chi Tiết (Directory Structure)

Dưới đây là công dụng của các thư mục đang có trong `/doc`:

| Thư mục                          | Mô tả công dụng                                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **`wiki/`**                      | Tài liệu cốt lõi, lâu dài. Bắt buộc phải được update nếu thay đổi DB hoặc Architecture.                     |
| **`05_Master_Tasks_Hierarchy/`** | Cấu trúc phân cấp Task lớn, Roadmap dài hạn của dự án.                                                      |
| **`plans/`**                     | Nơi lưu các file Implementation Plan (Bản thiết kế kỹ thuật) trước khi bắt tay vào code.                    |
| **`update-feature/`**            | Tài liệu ghi chú (log) quá trình làm một tính năng cụ thể.                                                  |
| **`update/`**                    | Các thông báo cập nhật chung, thay đổi về stack hoặc recap hàng tháng.                                      |
| **`hot-fix/`**                   | Phân tích Post-mortem cho các bug nghiêm trọng (Post-mortem).                                               |
| **`deploy-git/`**                | Chứa kịch bản triển khai hệ thống (Deployment patterns, CI/CD).                                             |
| **`check-list/`**                | Các danh sách kiểm tra an toàn (QA, Security, Pre-launch).                                                  |
| **`[Ngày/Tháng/Năm]`**           | (Ví dụ `26/`) Các thư mục được sinh ra để lưu trữ các bài phân tích (Analysis) theo dòng thời gian thực tế. |

> ⚠️ **Lưu ý cho Developer / AI Agents:** Khi tạo ra một tài liệu mới, hãy đảm bảo đặt nó vào đúng thư mục tương ứng theo bảng trên. Tuyệt đối không để rải rác ngoài thư mục gốc.
