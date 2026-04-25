# 🎨 UI Design Reframe & Technical Gap Analysis (Finance Tracker V3)

## 1. 🚀 The Vision: Budget-First Management
Finance Tracker V3 chuyển mình từ một công cụ "ghi chép chi tiêu" thuần túy sang hệ thống **"Quản lý Ngân sách Chiến lược"**. Thay vì chỉ nhìn vào con số Safe-to-Spend (S2S) duy nhất, người dùng giờ đây được trao quyền kiểm soát thông qua các Ngân sách (Budgets) linh hoạt.

### Triết lý thiết kế (Antigravity Standard):
- **Aesthetics**: Sử dụng Glassmorphism, màu sắc rực rỡ (vibrant colors), và bo góc lớn (2xl/3xl) theo phong cách Apple/Linear.
- **Interactivity**: Mọi tương tác đều có micro-animations, hover effects mượt mà.
- **Budget-First**: Ưu tiên hiển thị trạng thái ngân sách so với hạn mức thay vì chỉ liệt kê giao dịch.

---

## 2. 🔄 So sánh Cũ (Legacy S2S) vs Mới (V3 Budget-First)

| Đặc điểm | Hệ thống cũ (S2S Legacy) | Hệ thống mới (V3 Budget-First) |
|----------|--------------------------|---------------------------------|
| **Trọng tâm** | Chỉ số S2S (Một con số duy nhất) | Đa ngân sách (Ngân sách tổng + Ngân sách hạng mục) |
| **Giao diện Dashboard** | Nhấn mạnh vào danh sách giao dịch | Nhấn mạnh vào **Featured Budget Card** & Banner Summary |
| **Quản lý ví** | Ví đơn lẻ, không tích hợp sâu | **Cash Wallet Sync** (Đồng bộ ví tiền mặt nhanh) |
| **Mục tiêu (Goals)** | Hiển thị dạng danh sách đơn giản | Tích hợp vào dòng chảy tài chính, có tính toán tiến độ thông minh |
| **Trải nghiệm nhập liệu** | Form truyền thống | **Simple Quick Input** (Nhập nhanh 1 dòng) + NLP (Sắp ra mắt) |

---

## 3. 🛠️ Phân tích hiện trạng & Khoảng cách Kỹ thuật (Gap Analysis)

Hiện tại, giao diện (UI) đang dẫn trước logic Backend (API/DB) một bước để đảm bảo trải nghiệm người dùng (UX) được tối ưu trước khi "đóng băng" code.

### 🔴 Khoảng cách API & Database:
1.  **Authentication (Lớn nhất)**: 
    *   *Hiện tại*: Login đang dùng stub (giả lập redirect), chưa thực sự set HttpOnly Cookie/JWT.
    *   *Yêu cầu*: Phải hoàn thiện `authAPI` để tích hợp với Hono middleware.
2.  **Budget Summary Logic**:
    *   *Hiện tại*: API chỉ tính toán dựa trên `active_budgets` nói chung.
    *   *Yêu cầu*: Cần logic tách biệt "Ngân sách tổng" và "Ngân sách hạng mục" để tránh tính trùng (double-counting) trong Summary.
3.  **Wallet Management**:
    *   *Hiện tại*: DB schema cho `wallets` khá cơ bản.
    *   *Yêu cầu*: Cần thêm metadata để hỗ trợ logic "Không tính vào S2S" cho ví tiền mặt (Cash Wallet) như trong UI mock-up.
4.  **Analytics richness**:
    *   *Hiện tại*: API trả về dữ liệu thô (raw spending).
    *   *Yêu cầu*: Cần bổ sung đếm số lượng giao dịch (transactionCount) và phân loại icon/màu sắc danh mục trực tiếp từ API để UI không phải tính toán lại.

### 🟡 Trạng thái UI (Mock Data Integration):
Để đẩy nhanh tốc độ phát triển UI, chúng ta đã tách biệt hoàn toàn dữ liệu mẫu vào `apps/web/src/_lib/mock-data.ts`.
- **Đã Mock**: Toàn bộ Dashboard, Budgets, Goals, Bills, Wallets, Analytics.
- **Chưa Mock**: Luồng cài đặt (Settings), Profile nâng cao.

---

## 4. 📅 Lộ trình tích hợp (Integration Roadmap)

1.  **Phase 1 (Stabilize UI)**: Hoàn thiện các modal Thêm/Sửa bằng Mock Data (Đang thực hiện).
2.  **Phase 2 (Auth Sync)**: Tích hợp JWT thật để gỡ bỏ hoàn toàn rào cản 401 khi gọi API.
3.  **Phase 3 (Service Layer Refactor)**: Cập nhật `budget-service.ts` và `wallet-service.ts` để khớp với cấu trúc dữ liệu của V3.
4.  **Phase 4 (Mock Removal)**: Chuyển dần các Hooks từ dùng `MOCK_DATA` sang gọi API thật khi Services đã sẵn sàng.

---
> [!IMPORTANT]
> Toàn bộ giao diện hiện tại được thiết kế theo tiêu chuẩn **Antigravity V1.2**. Tuyệt đối không sử dụng các UI components mặc định của trình duyệt hoặc các màu sắc đơn điệu.
