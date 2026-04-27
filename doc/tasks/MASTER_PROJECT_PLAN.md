# Plan: Kế Hoạch Hoàn Thiện Finance Tracker V3 Thành Web App Hoàn Chỉnh

**Date:** 2026-04-26
**Issue:** #N/A (Master Roadmap)
**Status:** Planning

## Objective
Thực hiện tái cấu trúc (Refactoring) và phát triển các tính năng còn thiếu để chuyển Finance Tracker V3 từ trạng thái "có khung Backend vững chắc" thành một Web App toàn diện, trải nghiệm mượt mà, dễ bảo trì và mở rộng.

## Scope & Impact
- **Database:** Yes - Thêm cơ chế OCC (cột `version`) cho `wallets`, xem xét Materialized Views cho Budget Summary.
- **API:** Modified - Chuẩn hóa Zod schemas, thêm caching layer, chia tách các Controller (Hono Routes) phức tạp.
- **Frontend:** Toàn bộ trang (Đặc biệt màn Login, Dashboard, Settings). Tách biệt các layer UI Component, UI Controller và Business Service. Tách text ra file locales riêng.

## Technical Design
### Data Model
- Giữ nguyên thiết kế Drizzle Schema hiện hành, tận dụng Soft Delete.
- Dự kiến thêm trường `version: int` vào bảng `wallets` để quản lý tranh chấp đồng thời (Concurrency Control).

### API Contract
- Đảm bảo API nhận request chuẩn hóa từ Zod (`@finance/shared-schemas`).
- Trả về cấu trúc `ApiSuccess<T>` chuẩn từ thư viện `lib/response.ts`.

### UI/UX Considerations
- Tách file `vi.json` để quản lý text tĩnh, giúp component React sạch hơn.
- Không gõ axios trực tiếp vào Component. Component chỉ gọi Hook React Query (ví dụ `useTransactions()`), Hook sẽ gọi `apiClient`.
- Cập nhật màn hình đăng nhập (Thêm hiệu ứng, bọc skeleton khi loading Firebase Auth).
- Sử dụng `motion/react` cho các thành phần chuyển cảnh để đạt chuẩn "Premium".

## Tasks
- [ ] Task 1: Tái cấu trúc Frontend - Tách biệt thư mục UI Component và UI Controller, chuyển text hardcode sang file locales (Phase 1).
- [ ] Task 2: Cải thiện màn hình Login (`/apps/web/src/app/(auth)/login/page.tsx`) (Phase 1).
- [ ] Task 3: Phát triển các trang Quản lý Category và Wallet Transfer Modal (Phase 2).
- [ ] Task 4: Bổ sung Redis Cache cho Backend và Optimistic UI cho Frontend (Phase 3).
- [ ] Task 5: Viết E2E Playwright Tests bảo vệ các luồng quan trọng (Phase 4).

## Risks & Mitigations
- **Rủi ro 1 - N+1 Query ở Summary**: Budget Summary quét tất cả transaction. 
  - *Giải pháp*: Áp dụng Cache hoặc Eventual Consistency để lưu lại giá trị thay vì tính realtime mỗi lần.
- **Rủi ro 2 - Lỗi Firebase Client**: Login UI dễ đơ nếu Firebase Auth load chậm.
  - *Giải pháp*: Gắn Loading Skeleton và Timeout Retry hợp lý.

## Definition of Done
- [ ] Kiến trúc Frontend được chuẩn hóa (không còn text hardcode lộn xộn).
- [ ] Đủ các luồng CRUD cốt lõi cho mọi thực thể.
- [ ] Tests passing (coverage ≥ 80%) theo chuẩn TDD Workflow.
- [ ] 100% hiệu ứng chuyển động hoạt động trơn tru.
