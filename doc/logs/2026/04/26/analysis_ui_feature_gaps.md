# Feature Gaps (Khoảng trống tính năng) & Tính Năng Còn Thiếu Trên UI

Sau khi tham chiếu chéo (Cross-Reference) giữa hệ thống Backend API (Hono Routes & Services) với các components trên Frontend UI (`apps/web/src/_components/` và `apps/web/src/app/(dashboard)/`), dưới đây là danh sách những tính năng UI cần phải bổ sung (`feature-need-to-do`):

## 1. Quản Trị Danh Mục (Category Management)
- **Backend**: Đã có full bộ API CRUD cho categories (`GET`, `POST`, `PUT`, `DELETE` tại `/api/categories`).
- **UI Gaps**: 
  - Chưa thấy màn hình/component chuyên trách để người dùng tự do **Tạo thêm danh mục mới**, **Sửa tên/Icon danh mục**, hoặc **Xóa danh mục**. 
  - *Đề xuất*: Thêm 1 thẻ (tab) hoặc màn hình con bên trong route `/settings` để quản lý Category.

## 2. Thao Tác Chuyển Tiền & Nạp Rút Ví Offline (Wallet Transfers)
- **Backend**: Hỗ trợ khái niệm `Wallets` và type `transfer` trong giao dịch (chuyển tiền giữa các ví).
- **UI Gaps**: 
  - Widget `CashWalletStrip` (Ví tiền mặt offline) đã hiển thị, nhưng thiếu UI/Modal để thực hiện hành động: **Rút tiền từ Ngân hàng (MB Bank) ra Tiền mặt** hoặc ngược lại. Cần một dạng `TransferModal`.

## 3. Mục Tiêu Tiết Kiệm (Goals) - Thao Tác Nạp Tiền
- **Backend**: Hỗ trợ bảng `goals` và cơ chế tính tiến độ, hỗ trợ gán giao dịch (transactions) cho mục tiêu nhất định.
- **UI Gaps**:
  - Có trang `/goals`, nhưng cần nút **"Đóng góp ngay" (Fund Goal)** trên từng thẻ mục tiêu. Khi bấm vào sẽ bật một Modal tạo 1 giao dịch type `expense` tự động map với `goalId`.

## 4. Hóa Đơn Định Kỳ (Recurring Bills)
- **Backend**: Đã có schema và API cho `bills` (lưu ngày nhắc nhở, tự động lặp lại).
- **UI Gaps**:
  - Trang `/bills` hiện tại cần bổ sung nút **"Đánh dấu đã thanh toán" (Mark as Paid)**. Nút này khi bấm sẽ gọi API tạo một Transaction tương ứng vào tháng này để ngân sách (Budget) tự động trừ tiền đi.

## 5. Phân Tích Chuyên Sâu (Analytics)
- **Backend**: Cung cấp API endpoint `/api/analytics/trends` để xem xu hướng (với params ngày/tháng).
- **UI Gaps**:
  - Trang `/analytics` chưa sử dụng hết tiềm năng của API này. Cần bổ sung biểu đồ Line (Recharts) hiển thị thu/chi biến động qua các ngày trong tháng.

## 6. Các Nút (Buttons) Bắt Buộc Cần Có Sắp Tới:
- [ ] Nút "Sửa" và "Xóa" trên từng dòng Lịch sử giao dịch (cần gọi `PUT` / `DELETE` /api/transactions/:id).
- [ ] Nút "Export Data" (Xuất dữ liệu Excel/CSV) trong trang Cài Đặt (có thể gọi endpoint trả về file nếu Backend hỗ trợ sau này).
- [ ] Checkbox "Không tính vào ngân sách" (Exclude from budget) trên `QuickAddModal` khi người dùng nhập giao dịch.
