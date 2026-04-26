# 🎯 Executive Project Brief & Master Plan (Finance Tracker V3)

Tài liệu này đóng vai trò là "Kim chỉ nam" (Bản Brief) dành cho toàn bộ dự án ở thời điểm hiện tại, kết hợp cùng lộ trình thực thi đã được tối ưu hóa để phù hợp nhất với trạng thái code base lúc này.

---

## 📌 EXECUTIVE BRIEF (TÓM TẮT TÌNH HÌNH DỰ ÁN)

- **Trạng thái cốt lõi**: Dự án đã xử lý xong điểm nghẽn khó nhất là tích hợp **Firebase Social Login** và đồng bộ **Session Cookie** với Hono Backend. User đã có thể đăng nhập thành công và xem được Dashboard.
- **Tình trạng UI**: Giao diện chia Layout Grid (2/3 & 1/3) rất chuẩn chỉ, bám sát các tiêu chuẩn thiết kế tài chính. Tuy nhiên, nó đang ở trạng thái "Skeleton" (khung sườn) tĩnh, thiếu linh hồn (Animations) và mã nguồn UI đang bị "trộn lẫn" giữa Logic gọi API và Hiển thị HTML.
- **Tình trạng Backend**: Cấu trúc Monorepo (Turborepo) với TiDB Serverless & Drizzle cực kỳ mạnh mẽ, tách lớp Service rõ ràng. Nhưng có rủi ro tiềm ẩn về hiệu năng nếu người dùng có hàng chục ngàn giao dịch do thiếu Caching ở endpoint `GET /api/budgets/summary`.
- **Mục tiêu cấp bách (Next Immediate Step)**: Tái cấu trúc (Clean Code) cho Frontend trước khi tiếp tục nhồi nhét tính năng mới. Tách biệt Text/HTML, phân rã Component, và áp dụng Optimistic UI.

---

## PHẦN 1: ĐÁNH GIÁ TÌNH TRẠNG HIỆN TẠI (PROJECT SCAN)

### 1. Đánh giá UI Grid & Bố cục
- **Đánh giá**: **Rất chuẩn mực**. 
- Sử dụng `max-w-[1200px] mx-auto` cho Dashboard kết hợp `grid-cols-1 lg:grid-cols-3` cho phép layout co giãn linh hoạt mà không vỡ bố cục trên màn hình siêu rộng (Ultrawide).

### 2. Đánh giá Chất lượng UI & Khuyết điểm
- **Điểm tốt**: Màu sắc dark-theme sang trọng, theo sát tiêu chí "Budget-First".
- **Khuyết điểm**: 
  - Thiếu hiệu ứng chuyển động (`motion/react`).
  - Text tiếng Việt đang bị "Hardcode" vào trực tiếp thẻ HTML, rất khó tái sử dụng hoặc sửa đổi hàng loạt.
  - Các Component bị "nhồi nhét" (God Component), ví dụ một Component vừa gọi API, vừa xử lý tính toán, vừa render HTML.

### 3. Đánh giá Backend (Tech Debt & Missing Pieces)
- **Kiến trúc tốt**: Đã có `Auth Guard`, `Rate Limit`, `Error Handler` và thiết kế `Dependency Injection` cho các Services.
- **Nợ kỹ thuật**:
  - Thiếu Log Audit (Dấu vết thay đổi hệ thống).
  - Chưa áp dụng Optimistic Concurrency Control (OCC) thông qua cột `version` cho ví tiền mặt.
  - Điểm nghẽn ở hàm tính tổng Ngân sách (`summary`) chưa có Caching.

### 4. Khái niệm ERD từ góc độ Frontend
- Frontend **không dùng ERD**.
- Thay vào đó, Frontend dùng **State Architecture Diagram** (Sơ đồ trạng thái) & **API DTO Mapping**. Quy trình mở rộng đúng là: Frontend định nghĩa TypeScript Interface (DTO) mong muốn $\rightarrow$ Backend nhận yêu cầu $\rightarrow$ Backend thiết kế ERD Database và viết API trả đúng cục JSON đó.

---

## PHẦN 2: LỘ TRÌNH TRIỂN KHAI HOÀN CHỈNH (PHASE-BY-PHASE PLAN)

### 🟢 Phase 1: Tái Cấu Trúc (Refactoring) & Làm Sạch Frontend
**Mục tiêu**: Xây dựng móng nhà vững chãi trước khi xây thêm lầu.

1. **Quản lý Text & Ngôn ngữ (Dictionary/i18n)**
   - Tạo thư mục `apps/web/src/locales/` chứa file `vi.json`.
   - Di chuyển toàn bộ text tĩnh (ví dụ: "Tổng quan", "Chi tiêu", "Thu nhập") vào file JSON. 
   - *Lợi ích*: HTML siêu sạch, Component mỏng gọn, sửa lỗi chính tả chỉ cần sửa ở 1 nơi duy nhất.
2. **Áp dụng mô hình Container-Presentational Components**
   - Tách UI thành 2 loại:
     - **UI Presentational** (`apps/web/src/_components/ui`): Các nút bấm, thẻ Card chỉ nhận `props` và render HTML đẹp mắt. Tuyệt đối không chứa hook `useQuery` hay `axios`.
     - **UI Container / Controller** (`apps/web/src/app/...`): Nơi gọi API, lấy dữ liệu, bắt sự kiện click, sau đó truyền dữ liệu xuống Presentational Components.

### 🟡 Phase 2: Nâng cấp UX (Trải nghiệm Người Dùng)
**Mục tiêu**: Nâng cấp UI thành "Premium App".

1. **Sửa màn hình Login (`/login`)**:
   - Thêm hiệu ứng nền (Animated Background).
   - Thêm trạng thái Loading Spinner trên nút bấm trong lúc đợi Firebase trả về token, tránh user bấm 2 lần.
2. **Bổ sung Hiệu ứng (Animations)**:
   - Dùng `motion/react`. Các thẻ Card khi Dashboard tải xong cần có hiệu ứng mờ dần và trượt lên (`opacity: 0, y: 20` $\rightarrow$ `opacity: 1, y: 0`).
3. **Triển khai Optimistic UI**:
   - Khi thêm giao dịch, dùng hàm `onMutate` của React Query để trừ/cộng số dư trực tiếp trên màn hình, không cần đợi Backend trả lời.

### 🔵 Phase 3: Hoàn thiện Backend & Lấp đầy Tính Năng
**Mục tiêu**: Đảm bảo Backend vững chắc, chịu tải cao.

1. **Tối ưu Database & Caching**:
   - Cài đặt Redis Cache cho endpoint `GET /api/budgets/summary`.
2. **Hoàn thiện màn hình Settings & Category**:
   - Mở khóa tính năng Tự tạo/Sửa/Xóa Category cho user trên UI (hiện tại backend đã có API).
3. **Ví & Chuyển Tiền (Transfer)**:
   - Làm UI hiển thị Modal chuyển tiền qua lại giữa các ví.
4. **Viết E2E Test (Playwright)**:
   - Test luồng đăng nhập, tạo giao dịch và kiểm tra biểu đồ.

---

## 💡 GỢI Ý THỰC CHIẾN TỪ AI (Dựa trên tình hình hiện tại)

Vì chúng ta vừa vượt qua cột mốc Đăng nhập thành công, mạch code đang rất "nóng". Mình khuyến nghị bạn **HÃY BẮT ĐẦU NGAY VỚI PHASE 1: TÁI CẤU TRÚC TEXT VÀ LOGIN UI**.

**Ví dụ thiết kế chuẩn (Bạn nên áp dụng):**
```typescript
// THAY VÌ CODE NHƯ HIỆN TẠI:
<div className="card">
   <h1>Tổng Quan Ngân Sách</h1>
   <button onClick={handleSave}>Lưu Giao Dịch</button>
</div>

// HÃY CHUYỂN SANG:
import vi from '@/locales/vi.json';

<BudgetCardContainer>
   <h1>{vi.dashboard.budgetOverview}</h1>
   <SaveButton onClick={handleSave} text={vi.common.save} />
</BudgetCardContainer>
```
Làm theo cách này, sau này dự án phình to lên gấp 10 lần, bạn vẫn kiểm soát hoàn toàn mã nguồn của mình một cách hoàn hảo!
