# Finance Tracker Documentation

Chào mừng đến với hệ thống tài liệu của dự án Finance Tracker V3. Để dễ dàng nắm bắt thông tin dự án và không bị lạc trong hệ thống doc, vui lòng đọc theo hướng dẫn dưới đây.

---

## 📖 Hướng Dẫn Đọc Tài Liệu (How to Read the Docs)

Nếu bạn là thành viên mới (Onboarding) hoặc AI Agent cần hiểu context của dự án, hãy đọc theo trình tự sau:

### Bước 1: Hiểu Tổng Quan (Overview & Architecture)

Hãy bắt đầu với thư mục `wiki/` - đây là "trái tim" của tài liệu.

- Đọc **`wiki/SYSTEM_ARCHITECTURE.md`** để nắm kiến trúc tổng quát (Next.js + Hono + Drizzle + TiDB).
- Đọc **`wiki/DATABASE_SCHEMA.md`** để nắm cấu trúc các bảng và quy tắc tài chính (Soft delete, Decimal).
- Đọc **`wiki/QUICKSTART.md`** để biết cách chạy dự án ở local.

### Bước 2: Nắm Bắt Định Hướng & Lộ Trình (Roadmaps & Tasks)

- Mở thư mục **`tasks/`** -> Đọc **`ROADMAP.md`** để biết tiến độ tổng thể.
- Xem các bản vẽ kỹ thuật chi tiết trong **`tasks/plans/`** cho từng chức năng cụ thể sắp làm.

### Bước 3: Theo Dõi Tiến Độ Thực Tế & Phân Tích (Logs & Research)

- Vào **`logs/`**: Chứa các bản phân tích (Analysis) cục bộ theo ngày tháng (vd: `logs/2026/04/26/`).
- Vào **`research/`**: Các phân tích chuyên sâu về hệ thống (Business Logic, Scalability).

### Bước 4: Vận Hành & Bảo Trì (Operations)

- Vào **`ops/deploy/`**: Tài liệu về luồng CI/CD, Git flow.
- Vào **`ops/incidents/`**: Lịch sử phân tích và cách fix các bug phức tạp (Post-mortem).
- Vào **`ops/checklists/`**: Các danh sách kiểm tra an toàn (QA, Security, Pre-launch).

### Bước 5: Lưu Trữ (Archive)

- Vào **`archive/updates/`**: Lưu trữ lịch sử cập nhật tính năng và hệ thống.

---

## 📂 Cấu Trúc Thư Mục Chi Tiết (Directory Structure)

Dưới đây là công dụng của các thư mục đang có trong `/doc`:

| Thư mục          | Mô tả công dụng                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------- |
| **`wiki/`**      | Tài liệu cốt lõi, lâu dài. Bắt buộc phải update nếu thay đổi DB hoặc Architecture.       |
| **`tasks/`**     | Lộ trình (Roadmap), kế hoạch chi tiết (Plans) và danh sách công việc.                    |
| **`ops/`**       | Quy trình vận hành: Deployment, Incident Management (Hotfixes), và Checklists.           |
| **`logs/`**      | Nhật ký phân tích hệ thống theo thời gian (Ngày/Tháng/Năm).                             |
| **`research/`**  | Các bài phân tích chuyên sâu về Business Logic, Scalability, và UI Gaps.                 |
| **`archive/`**   | Lưu trữ các bản cập nhật cũ, log cũ không còn dùng thường xuyên.                         |

---

> ⚠️ **Lưu ý cho Developer / AI Agents:** Khi tạo ra một tài liệu mới, hãy đảm bảo đặt nó vào đúng thư mục tương ứng theo cấu trúc trên. Tuyệt đối không để rải rác ngoài thư mục gốc.
