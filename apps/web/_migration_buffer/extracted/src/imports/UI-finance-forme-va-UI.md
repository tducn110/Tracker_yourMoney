# So sánh kiến trúc UI.md và Thực tế thư mục dự án

Sau khi phân tích tệp `UI.md` và đối chiếu với cấu trúc thực tế của dự án trong thư mục `apps/web`, dưới đây là các điểm khác biệt đáng chú ý.

## 1. Về Framework và Stack
- **Trong UI.md**: Định nghĩa Stack là `React 18 + Vite + Tailwind CSS v4 + Motion`.
- **Thực tế**: 
  - Dự án hiện tại đang sử dụng **Next.js** với cấu trúc **App Router** (`apps/web/src/app`, có file `next.config.ts`).
  - Dù có thể có dự định dùng Vite, nhưng codebase Frontend web hiện tại thực thi qua Next.js.

## 2. Về Pages & Routing (Thư mục `apps/web/src/app` & `app-pages/`)
Trong mục Page Components và Routing của `UI.md`:
- **Đã khớp**:
  - `/` -> `Dashboard` (`Dashboard.tsx` có trong `app-pages`)
  - `/transactions` -> `Transactions`
  - `/goals` -> `Goals`
  - `/bills` -> `Bills`
  - `/analytics` -> `Analytics`
  - `/settings` -> `Settings`
  - `/login` và `/register` (nằm trong thư mục `(auth)`)
- **Khác biệt**:
  - **`/wireframes`**: Không tìm thấy thư mục route tương ứng trong `app/` và cũng không có component `Wireframes.tsx` nào trong `app-pages/`. Tuy nhiên lịch sử cho thấy đã có lúc chuyển 8-screen wireframe ra file HTML tĩnh (`/html` hoặc nơi khác) thay vì giữ trong React.
  - **`/userflows`**: Có component `UserFlows.tsx` trong `app-pages/` nhưng lại **không có route** tương ứng trong App Router (`app/`).
  - **Trang thừa**: Có một trang `CategoryManager.tsx` trong `app-pages/` nhưng **không được liệt kê** trong tài liệu `UI.md`.

## 3. Về Components (Thư mục `apps/web/src/components/`)
Trong tài liệu liệt kê 5 Core Components (`S2SHeroSection`, `CashWalletStrip`, `Layout`, `QuickAddModal`, `ChatQuickAdd`):
- **Đã khớp**: Cả 5 components này đều có mặt đầy đủ trong thư mục `components/`.
- **Thực tế đang có nhiều components hơn mô tả**: 
  Thư mục có cả những files sau nhưng chưa được bổ sung vào `UI.md`:
  - `CashWalletWidget.tsx`
  - `CategoryManager.tsx` (có cả ở đây và `app-pages`)
  - `DashboardSkeleton.tsx`
  - `ImageWithFallback.tsx` (cả ở root components và trong thư mục `figma/`)
  - `QuickInputBar.tsx`

## Tóm Lại
Tài liệu `UI.md` và mã nguồn đang phần lớn đồng bộ về mặt kiến trúc cốt lõi và các component chính ($S2S$, $CashWalletStrip$). 
Tuy nhiên:
1. `UI.md` có vẻ đã lỗi thời ở phần khai báo framework (Vite vs Next.js thực tế).
2. Tài liệu thiếu mô tả đối với các component mới và quản lý danh mục (Category).
3. Các trang phụ như Wireframes đã bị thay đổi logic phân phối (tách ra thành HTML độc lập chứ không còn là một route của Next.js). Tiếng vang của việc này không được update lên file `UI.md`.
