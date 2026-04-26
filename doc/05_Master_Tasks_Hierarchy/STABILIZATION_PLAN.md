# 🚨 KẾ HOẠCH FIX FINAL FINAL FINAL FINAL FINAL (MASTER ROADMAP 50 PHASES)

Tài liệu này lưu trữ **Toàn bộ** các lỗi Real-time hiện có (do chính AI vừa scan e2e) và vạch ra một lộ trình siêu chi tiết gồm **50 Phase** nhằm biến dự án thành một Siêu ứng dụng Tài chính (với tính năng AI và khả năng scale hàng chục ngàn users).

---

## 💥 PHẦN 1: CÁC LỖI TỒN ĐỌNG (SCANNED ERRORS & TECH DEBTS)

Kết quả từ quá trình chạy `pnpm typecheck` và `pnpm test` tự động:

1. **Lỗi TypeScript ở Firebase Auth (Nghiêm trọng)**
   - Vị trí: `apps/api/src/lib/firebase-auth.ts:18`
   - Báo lỗi: `Object literal may only specify known properties, and 'project_id' does not exist in type 'ServiceAccount'.`
   - *Nguyên nhân*: Object truyền vào `admin.credential.cert()` mong đợi key `projectId`, nhưng code đang truyền `project_id: projectId`. 
   - *Cách sửa*: Thay `{ project_id: projectId, client_email: clientEmail, private_key: privateKey }` thành `{ projectId, clientEmail, privateKey }`.

2. **Lỗi Test Suite ở Worker**
   - Vị trí: `worker#test`
   - Báo lỗi: `Command failed with exit code 1`.
   - *Nguyên nhân*: Chưa cấu hình đúng thư viện test trong package `worker` hoặc các test case mặc định đang bị fail/rỗng.

3. **Lỗ hổng bảo mật & Scale (Đã đề cập trước)**
   - Thiếu OCC (Optimistic Concurrency Control) cho `wallets`.
   - Hàm Budget Summary lấy toàn bộ data, không có Redis (Chỉ gánh được ~1,000-3,000 users). TiDB sẽ bị CPU Spikes.
   - Tràn số (BigInt) nếu quên ép kiểu thành chuỗi ở JSON response.

---

## 🚀 PHẦN 2: LỘ TRÌNH 50 PHASES (TỪ FIX LỖI ĐẾN TÍCH HỢP A.I & SCALE)

### Khối 1: Tắt cháy (Hotfixes) & Vững móng (Phases 1 - 5)
- **Phase 1**: Sửa ngay lỗi TypeScript ở `firebase-auth.ts` (`project_id` -> `projectId`).
- **Phase 2**: Sửa lỗi cấu hình Test của package `worker` để `pnpm test` vượt qua (Pass 100%).
- **Phase 3**: Khởi tạo thư mục `locales/vi.json` ở Frontend, di dời 100% text HTML sang file JSON (Ngăn rác code).
- **Phase 4**: Setup ESLint rule bắt buộc mọi truy vấn DB Drizzle đều phải chứa tham số `userId` (Phòng chống IDOR).
- **Phase 5**: Thêm cơ chế ép kiểu BigInt sang String an toàn hơn ở Global Middleware.

### Khối 2: Tái cấu trúc Frontend (Phases 6 - 10)
- **Phase 6**: Tách các UI lớn ở Dashboard thành Container-Presentational Components.
- **Phase 7**: Đưa tất cả lệnh gọi API `axios` vào custom hooks `react-query` (`useTransactions`, `useBudgets`).
- **Phase 8**: Cấu hình *Optimistic Updates* (thao tác là UI cập nhật ngay) cho hành động "Thêm giao dịch".
- **Phase 9**: Sửa UI màn hình Đăng Nhập (`/login`): Thêm CSS Background đẹp mắt, sửa lỗi nút bấm chờ (Skeleton / Loading Spinner).
- **Phase 10**: Thiết kế "Empty States" cho mọi trang khi User mới vào chưa có giao dịch nào.

### Khối 3: Backend Scale & Performance (Phases 11 - 15)
- **Phase 11**: Khởi tạo Redis (Upstash) trong Backend.
- **Phase 12**: Cache lại Endpoint `GET /api/budgets/summary` bằng Redis (TTL 5 phút).
- **Phase 13**: Cài đặt Optimistic Concurrency Control (OCC): Dùng `drizzle-kit` thêm cột `version` cho `wallets`.
- **Phase 14**: Dùng Dataloaders (hoặc query batching) để giải quyết truy vấn N+1 khi gọi danh sách giao dịch kèm Category.
- **Phase 15**: Nâng cấp hệ thống Log (`pino`): Bật tính năng redact để giấu `passwordHash` và `token` khi log.

### Khối 4: Lấp đầy Tính năng Cơ bản (Phases 16 - 20)
- **Phase 16**: Frontend: Viết UI trang `Settings -> Categories` (CRUD danh mục).
- **Phase 17**: Backend & Frontend: Modal "Chuyển khoản nội bộ" (Transfer giữa 2 ví).
- **Phase 18**: Frontend: Nút "Đóng góp tiền" (Fund) cho Mục tiêu (Goals).
- **Phase 19**: Frontend: Tính năng "Đánh dấu đã trả" (Mark as Paid) cho Hóa đơn (Bills).
- **Phase 20**: Đồng bộ dữ liệu LocalStorage (Offline-First) cho Ví Tiền Mặt.

### Khối 5: Tự động hóa & Tính toán tinh vi (Phases 21 - 25)
- **Phase 21**: Hóa đơn định kỳ (Recurring Bills): Viết background job (trong package `worker`) tự động trừ tiền vào ngày 1 hàng tháng.
- **Phase 22**: Budget Rollover: Chuyển tiền dư của tháng này sang ngân sách tháng sau.
- **Phase 23**: Thêm tính năng chia nhỏ Giao dịch (Split Transaction).
- **Phase 24**: Import dữ liệu từ CSV (Hỗ trợ nhập lịch sử tiêu dùng từ Excel).
- **Phase 25**: Export dữ liệu ra file PDF / CSV (Có dấu mộc/logo cá nhân).

### Khối 6: Advanced Analytics & Visuals (Phases 26 - 30)
- **Phase 26**: Tích hợp thư viện `Recharts` hoặc `Visx`.
- **Phase 27**: Vẽ Biểu đồ đường (Line Chart) dự báo chi tiêu cuối tháng dựa trên tốc độ tiêu (Burn Rate).
- **Phase 28**: Vẽ Biểu đồ tròn (Donut Chart) phân bổ chi phí (Expense Breakdown).
- **Phase 29**: Heatmap đóng góp (Giống GitHub commits) thể hiện các ngày chi tiền nhiều nhất.
- **Phase 30**: Tích hợp Animation chuyển cảnh toàn ứng dụng bằng `framer-motion` (hoặc `motion/react`).

### Khối 7: Artificial Intelligence (AI Integration) (Phases 31 - 35)
- **Phase 31**: Bật tính năng NLP Quick Add (Bóc tách Text). Thử nghiệm Adapter Regex hiện tại.
- **Phase 32**: Thay thế Regex bằng AI (OpenAI API / Claude API). Nhập: *"Hôm qua mua bó hoa 50k"* -> Tự suy ra `Category: Quà tặng`, `Date: Hôm qua`, `Amount: 50000`.
- **Phase 33**: Viết "Financial Advisor AI": Scan dữ liệu `budgets/summary` và gửi 1 câu khuyên người dùng (VD: "Bạn tiêu quá nhiều vào Ăn uống tuần này!").
- **Phase 34**: Voice to Text: Tích hợp ghi âm từ UI truyền lên Backend AI để tạo giao dịch.
- **Phase 35**: Smart Categorization: Nếu user không nhập Category, AI tự động dự đoán dựa trên `description`.

### Khối 8: Đảm bảo Chất Lượng Tuyệt Đối (QA & Testing) (Phases 36 - 40)
- **Phase 36**: Viết Unit Test cho thư viện tính toán tài chính (`Decimal.js`) đạt 100% Coverage.
- **Phase 37**: Viết E2E Test bằng `Playwright`: Test luồng Đăng Nhập.
- **Phase 38**: Viết E2E Test: Test luồng Tạo giao dịch -> Thấy Budget giảm đi tương ứng.
- **Phase 39**: Kiểm tra Accessibility (a11y) -> Đảm bảo dùng Tab phím và Screen Reader đọc được Dashboard.
- **Phase 40**: Cấu hình Husky / Lint-staged: Không cho phép commit nếu `pnpm typecheck` báo lỗi.

### Khối 9: Infrastructure & DevOps (Phases 41 - 45)
- **Phase 41**: Dockerize ứng dụng (Tạo Dockerfile cho API, Web, Worker).
- **Phase 42**: CI/CD với GitHub Actions: Tự động chạy test khi có Pull Request.
- **Phase 43**: Tối ưu Turbopack (Next.js) và chia tách Chunk (Code Splitting) để giảm dung lượng file JS.
- **Phase 44**: Cài đặt Error Tracking Tool (như Sentry) để theo dõi lỗi real-time.
- **Phase 45**: Setup Monitoring (Grafana/Datadog) để cảnh báo khi API có thời gian phản hồi > 1 giây.

### Khối 10: Production Scale & Beyond (Phases 46 - 50)
- **Phase 46**: Nâng cấp TiDB Serverless lên gói Dedicated (nếu số lượng user vượt 10,000).
- **Phase 47**: Áp dụng Database Sharding (Chia DB theo Vùng/Khu vực nếu ra quốc tế).
- **Phase 48**: Tối ưu Edge Caching trên Vercel: Phân phát tĩnh các trang không cần real-time.
- **Phase 49**: Biến ứng dụng thành PWA (Progressive Web App), hỗ trợ tải về điện thoại di động (Mobile Installable).
- **Phase 50**: DEPLOY LÊN PRODUCTION THEO CHUẨN `@/deploy` VÀ PHÁT HÀNH! (Vercel Prod).

---
*Ghi chú cuối cùng: Lộ trình này là hoàn hảo để biến một dự án cá nhân (Hobby) thành một Startup SaaS tầm cỡ.*
