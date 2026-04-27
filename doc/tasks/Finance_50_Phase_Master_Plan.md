# 🚀 Finance Tracker V3 - Master Roadmap (50 Phases)

Bản kế hoạch chiến lược 50 Phase này được thiết kế để đưa dự án từ trạng thái hiện tại (MVP/Development) trở thành một hệ thống SaaS Tài chính chuẩn Enterprise, có khả năng Scale cho hàng trăm ngàn người dùng đồng thời, đảm bảo 100% chính xác tiền tệ và hiệu năng tối đa.

---

## 🎯 GIAI ĐOẠN 1: ỔN ĐỊNH CƠ SỞ HẠ TẦNG & DATABASE (PHASE 1 - 10)
*Mục tiêu: Hoàn thiện ERD, dọn dẹp Tech Debt, đảm bảo tính toàn vẹn dữ liệu ở tầng thấp nhất.*

* **Phase 1: Database Audit & ERD Finalization**: Rà soát lại toàn bộ schema Drizzle, chốt ERD cuối cùng. Đảm bảo 100% các bảng đều có `deletedAt` (Soft Delete).
* **Phase 2: BigInt to String Standardization**: Kiểm tra chéo toàn bộ API và UI, đảm bảo không có bất kỳ ID nào bị convert ngược thành `number`. Hoàn thiện parse chuỗi ID ở mọi endpoints.
* **Phase 3: Decimal.js Enforcement**: Chạy script quét toàn bộ codebase (Backend & Frontend) để loại bỏ mọi hàm `Number()`, `parseFloat()` áp dụng cho tiền tệ.
* **Phase 4: Cấu hình Indexing cho TiDB**: Thêm B-Tree Index cho các trường thường xuyên query: `userId`, `categoryId`, `createdAt`, `deletedAt` để tăng tốc độ read.
* **Phase 5: Thiết lập Optimistic Concurrency Control (OCC)**: Thêm cột `version` vào bảng `budgets` và `wallets` để ngăn chặn rủi ro Double-Spending khi có nhiều request đồng thời.
* **Phase 6: Hoàn thiện Idempotency Logic**: Đảm bảo 100% các API POST/PUT (tạo giao dịch, nạp tiền) đều lưu lại `Idempotency-Key` vào database để tránh duplicate data do network retry.
* **Phase 7: Backend Error Handling Standardization**: Chuẩn hóa format trả về cho mọi lỗi (Zod Error, DB Error, Auth Error) theo cấu trúc chuẩn trong `response.ts`.
* **Phase 8: Logging System & Audit Trail**: Tích hợp `pino` logger, ẩn (redact) các thông tin nhạy cảm. Lưu lịch sử thao tác quan trọng (tạo/xóa giao dịch) vào bảng `audit_logs`.
* **Phase 9: API Rate Limiting Setup**: Tích hợp rate limit middleware (Redis-based) cho Hono API để chống DDoS và Spam request.
* **Phase 10: Security Hardening (JWT & Cookies)**: Rà soát lại toàn bộ luồng Auth Firebase, đảm bảo Session Cookies (HttpOnly, Secure, SameSite=Lax) hoạt động trơn tru ở cả môi trường dev và prod.

---

## 🎯 GIAI ĐOẠN 2: HOÀN THIỆN TÍNH NĂNG CỐT LÕI (PHASE 11 - 20)
*Mục tiêu: Lắp đầy các "Feature Gaps" trên UI và Backend.*

* **Phase 11: Category Management CRUD**: Xây dựng API và UI cho phép người dùng tự tạo, sửa, xóa, và nhóm các danh mục thu/chi.
* **Phase 12: Cash Wallet Synchronization**: Hoàn thiện tính năng đồng bộ Ví tiền mặt (Offline-first), tích hợp đối soát (Reconciliation) khi online trở lại.
* **Phase 13: Bank Transfer Integration UI**: Thiết kế UI Modal cho việc chuyển tiền giữa các Ví/Ngân hàng (type `transfer`).
* **Phase 14: Goals Engine (Mục tiêu tiết kiệm)**: Phát triển luồng logic "Đóng góp (Fund) vào mục tiêu", tự động map giao dịch trừ tiền vào mục tiêu tương ứng.
* **Phase 15: Recurring Bills (Hóa đơn định kỳ)**: Viết cronjob hoặc worker để nhắc nhở và tự động tạo giao dịch cho các hóa đơn lặp lại (Netflix, Điện, Nước).
* **Phase 16: Budget-First Core Refactoring**: Tối ưu hóa thuật toán tính Budget trên Backend, đảm bảo không có vòng lặp thừa khi tính toán ngân sách.
* **Phase 17: User Settings & Preferences**: Xây dựng trang Cài đặt (đổi đơn vị tiền tệ, theme, mốc ngày bắt đầu tháng ngân sách).
* **Phase 18: Data Export/Import**: Xây dựng luồng xuất/nhập dữ liệu tài chính (CSV, Excel) phục vụ nhu cầu backup của người dùng.
* **Phase 19: Filter & Search Engine**: Thêm tính năng lọc và tìm kiếm giao dịch nâng cao (theo ngày, khoảng tiền, text, tags).
* **Phase 20: Notification System**: Thiết kế schema và UI cho hệ thống thông báo in-app (Nhắc nhở hóa đơn, cảnh báo vượt ngân sách).

---

## 🎯 GIAI ĐOẠN 3: TỐI ƯU HIỆU NĂNG & MẠNG (PHASE 21 - 30)
*Mục tiêu: Xử lý vấn đề Cold Start, Load chậm và Lag khi Scale.*

* **Phase 21: Redis Caching Layer**: Tích hợp Redis, cache lại các API nặng như `GET /api/budgets/summary`. Tự động invalidate cache khi có giao dịch mới.
* **Phase 22: Giải quyết Cold Start TiDB**: Viết một Serverless Cronjob (Warm-up worker) ping nhẹ vào database mỗi 3-5 phút để giữ kết nối TiDB luôn "thức".
* **Phase 23: Tối ưu Bundle Size Frontend**: Cấu hình Next.js (Turbopack/Webpack), áp dụng Code Splitting và Lazy Loading cho các Chart và Library nặng.
* **Phase 24: Khắc phục Network Waterfall**: Refactor lại cách fetch data trên Next.js Server Components, dùng `Promise.all` để fetch song song thay vì tuần tự.
* **Phase 25: Database Query Optimization (Drizzle)**: Xóa bỏ các query N+1, sử dụng tính năng relational queries của Drizzle `with: { category: true }` chuẩn xác.
* **Phase 26: Chuyển đổi Event-Driven Architecture**: Tách các tác vụ nặng (như update Budget, tính toán lại Analytics) ra khỏi request chính, sử dụng Message Queue (BullMQ).
* **Phase 27: Phân trang (Pagination) & Infinite Scroll**: Đảm bảo 100% các endpoint trả về list đều có phân trang (cursor-based hoặc offset). Áp dụng Infinite Scroll trên UI Lịch sử giao dịch.
* **Phase 28: Image & Asset Optimization**: Đưa toàn bộ icon, logo, tài nguyên tĩnh lên CDN.
* **Phase 29: Payload Compression**: Kích hoạt Brotli/Gzip cho Hono API để giảm kích thước file JSON trả về.
* **Phase 30: Edge Computing Readiness**: Triển khai các Middleware (Auth, Geo-routing) lên thẳng Edge (Cloudflare/Vercel Edge) để chặn request lỗi từ sớm.

---

## 🎯 GIAI ĐOẠN 4: NÂNG TẦM TRẢI NGHIỆM NGƯỜI DÙNG (PHASE 31 - 40)
*Mục tiêu: Đạt chuẩn "Antigravity Aesthetic", mượt mà, không độ trễ.*

* **Phase 31: 100% Optimistic UI Updates**: Áp dụng TanStack Query mutations với `onMutate` cho mọi thao tác CRUD. Nút bấm phản hồi tức thì < 50ms.
* **Phase 32: Offline-First Support (PWA - Part 1)**: Cấu hình Service Worker, cache các shell UI của Next.js để app vẫn load được khi mất mạng.
* **Phase 33: Offline Mutations (PWA - Part 2)**: Lưu các thao tác tạo giao dịch vào IndexedDB khi offline, tự động đồng bộ (Background Sync) khi có mạng trở lại.
* **Phase 34: Micro-Animations & Framer Motion**: Thêm hiệu ứng hover, skeleton loading, transition mượt mà giữa các trang (Glassmorphism, Apple Style).
* **Phase 35: Advanced Analytics Charts**: Tích hợp Recharts/Visx, xây dựng biểu đồ Line/Bar tương tác, có tooltip hiển thị chi tiết thu/chi.
* **Phase 36: Dark Mode & Theming Optimization**: Chuẩn hóa hệ thống màu sắc HSL Tailwind cho cả Light và Dark mode. Đảm bảo độ tương phản (Accessibility).
* **Phase 37: Skeleton Loaders Toàn Diện**: Thay thế các spinner bằng Skeleton loading UI mô phỏng cấu trúc dữ liệu thực tế.
* **Phase 38: Toast & Feedback System**: Xây dựng hệ thống thông báo trạng thái thao tác đẹp mắt, có thể undo (hoàn tác) ngay trên Toast (ví dụ: Vừa xóa 1 giao dịch -> Undo).
* **Phase 39: Responsive & Mobile Excellence**: Tối ưu UI riêng biệt cho màn hình nhỏ, thêm Bottom Navigation thay cho Sidebar trên Mobile.
* **Phase 40: Keyboard Shortcuts**: Thêm phím tắt (Cmd+K) để mở Quick Add Modal hoặc chuyển nhanh giữa các trang.

---

## 🎯 GIAI ĐOẠN 5: AI INTEGRATION, SCALE & PRODUCTION (PHASE 41 - 50)
*Mục tiêu: Tích hợp trí tuệ nhân tạo, kiểm thử, và triển khai Production tự động hóa.*

* **Phase 41: AI NLP Parsing Engine**: Chuyển đổi `RegexNLPAdapter` sang tích hợp AI (OpenAI/Claude API) để nhận diện ngôn ngữ tự nhiên cực chính xác (vd: "Hôm qua ăn phở 50k, cafe 30k ở quận 1").
* **Phase 42: AI Financial Insights**: Dùng AI để phân tích dữ liệu chi tiêu hàng tháng, đưa ra các lời khuyên tiết kiệm được cá nhân hóa.
* **Phase 43: E2E Testing (Playwright)**: Viết test phủ 100% các luồng quan trọng (Login, Quick Add, Budget Sync, Budget Calculation).
* **Phase 44: Load Testing & Stress Testing**: Chạy k6 hoặc Artillery mô phỏng 10,000 Concurrent Users để tìm điểm gãy (bottleneck) của Hono và TiDB.
* **Phase 45: CI/CD Pipeline (GitHub Actions)**: Cấu hình luồng tự động Typecheck -> Lint -> Test -> Build -> Dockerize khi có code merge vào nhánh `main`.
* **Phase 46: Dockerization & Orchestration**: Viết Multi-stage Dockerfile cho Backend, chuẩn bị sẵn sàng cho Kubernetes (nếu không dùng Vercel/Cloudflare).
* **Phase 47: Health Checks & Monitoring**: Cài đặt Datadog hoặc Sentry để theo dõi hiệu năng API, bắt lỗi real-time, lập Dashboard theo dõi Uptime.
* **Phase 48: Backup & Disaster Recovery**: Thiết lập cronjob backup dữ liệu tự động hằng ngày ra AWS S3. Xây dựng tài liệu khôi phục thảm họa (Disaster Recovery Plan).
* **Phase 49: Beta Release & User Acceptance Testing**: Mở giới hạn (Invite-only) cho một nhóm người dùng thật để thu thập feedback thực tế về UI/UX và Performance.
* **Phase 50: Official V3 Launch & Marketing Ops**: Hoàn tất tài liệu hướng dẫn (Help Center), tạo changelog, release chính thức lên Production (Bật full HTTPS, custom domain).

---
*Bản kế hoạch này tuân thủ các quy tắc trong Coding Standards và Security Context của Finance Tracker.*
