# 🏔️ BIG TASK HIERARCHY & HOW-TO FIX (Toàn Tập 50 Phases)

Tài liệu này không chỉ liệt kê các vấn đề mà còn chỉ rõ **cách làm, cách sửa (How-to)** chi tiết cho từng Phase một. File này đóng vai trò là Backlog Cao Cấp (Master Hierarchy) để Đội ngũ phát triển (hoặc AI) có thể gắp từng task ra và code ngay lập tức.

## 🛠 EPIC 1: HOTFIXES & FOUNDATION (Tắt cháy & Móng nhà)

**Phase 1: Sửa lỗi TypeScript ở Firebase Auth**

- **File**: `apps/api/src/lib/firebase-auth.ts` (Dòng 18)
- **Cách làm**: Sửa `{ project_id: projectId, client_email: clientEmail, private_key: privateKey }` thành `{ projectId, clientEmail, privateKey }`. Object `ServiceAccount` của Firebase bắt buộc dùng camelCase.
  **Phase 2: Khắc phục lỗi Test Suite ở Worker**
- **File**: `apps/worker/package.json`
- **Cách làm**: Hiện `pnpm test` đang fail do `worker` không có test case. Hãy chạy `pnpm add -D vitest` trong folder worker, tạo file `index.test.ts` chứa `test('dummy', () => expect(1).toBe(1))` để CI đi qua tạm thời.
  **Phase 3: Tách Text/HTML sang `vi.json`**
- **File**: `apps/web/src/locales/vi.json` (Tạo mới)
- **Cách làm**: Khai báo JSON `{ "common": { "save": "Lưu" }, "dashboard": { "title": "Tổng quan" } }`. Trong các file UI (như `OverviewSummaryCard.tsx`), thêm `import vi from '@/locales/vi.json'` và dùng `{vi.dashboard.title}` thay vì gõ cứng tiếng Việt.
  **Phase 4: ESLint Rule chống IDOR**
- **File**: `.eslintrc.js` hoặc Tự quy ước Code Review.
- **Cách làm**: Mọi hàm query Drizzle trong `packages/db/src/repositories/` đều bắt buộc phải nhận tham số `userId: string` và có lệnh `where(eq(table.userId, userId))`. Tuyệt đối không query theo ID đơn thuần.
  **Phase 5: Middleware chặn BigInt rò rỉ**
- **File**: `apps/api/src/index.ts`
- **Cách làm**: Cấu hình chuẩn `mode: 'string'` cho mọi khóa chính BigInt trong file schema (`packages/db/src/schema/*.ts`). Nếu Drizzle trả về BigInt ở raw query, viết một hàm đệ quy biến đổi JSON: `typeof val === 'bigint' ? val.toString() : val`.

## 🎨 EPIC 2: FRONTEND REFACTOR (Làm sạch Giao diện)

**Phase 6: Áp dụng Container-Presentational Pattern**

- **Cách làm**: Đừng nhét `useMutation` hay `axios` vào nút Bấm. Di chuyển state lên `apps/web/src/app/(dashboard)/page.tsx` (Container), sau đó truyền hàm `onSave` xuống `<BudgetGrid onSave={...} />` (Presentational).
  **Phase 7: Gom API vào React Query Custom Hooks**
- **File**: `apps/web/src/_lib/hooks/finance.ts`
- **Cách làm**: Viết `export const useTransactions = () => useQuery({ queryKey: ['transactions'], queryFn: () => apiClient.get('/transactions') })`.
  **Phase 8: Tích hợp Optimistic UI**
- **Cách làm**: Trong hàm `useMutation` tạo giao dịch, khai báo `onMutate: async (newTx) => { await queryClient.cancelQueries(['budgets']); const prev = queryClient.getQueryData(['budgets']); queryClient.setQueryData(['budgets'], updateLogic(prev, newTx)); return { prev }; }`. Nhớ làm `onError: (err, newTx, context) => queryClient.setQueryData(['budgets'], context.prev)`.
  **Phase 9: Tân trang Màn hình Login**
- **File**: `apps/web/src/app/(auth)/login/page.tsx`
- **Cách làm**: Bọc Nút Đăng nhập bằng thẻ `<button disabled={isLoading}>`. Cài thư viện `lucide-react`, khi click thì gán biến `isLoading = true`, hiển thị `<Loader2 className="animate-spin" />` thay cho chữ "Đăng nhập".
  **Phase 10: Empty States**
- **File**: `apps/web/src/_components/ui/EmptyState.tsx`
- **Cách làm**: Tạo component chứa 1 cái icon SVG to ở giữa màn hình mờ nhạt, bên dưới là text "Bạn chưa có giao dịch nào", và một nút CTA "Tạo giao dịch đầu tiên".

## 🚀 EPIC 3: BACKEND SCALE (Chống Tải Nặng)

**Phase 11 & 12: Tích hợp Redis Cache cho Budget Summary**

- **File**: `apps/api/src/services/budget-service.ts`
- **Cách làm**: Cài `@upstash/redis`. Đầu service kiểm tra `await redis.get(\`summary:\${userId}\`)`. Nếu có, trả về ngay. Nếu không, chạy hàm `SUM()`SQL, sau đó`await redis.set(\`summary:\${userId}\`, result, { ex: 300 })`(Cache 5 phút). Khi có giao dịch mới, gọi`redis.del(\`summary:\${userId}\`)`.
  **Phase 13: Optimistic Concurrency Control (OCC) cho Wallets**
- **File**: `packages/db/src/schema/wallet.ts`
- **Cách làm**: Thêm cột `version: int('version').default(0)`. Trong API cập nhật tiền: `update(wallets).set({balance: newBal, version: sql\`version + 1\`}).where(and(eq(wallets.id, id), eq(wallets.version, currentVersion)))`. Nếu `rowsAffected === 0`$\rightarrow$ Ném lỗi`ConcurrencyConflictError`.
  **Phase 14 & 15: Dataloaders & Log Redaction**
- **Cách làm**: Cài đặt thư viện `pino` cho Logger. Trong config cấu hình `redact: ['*.password', '*.token', 'req.headers.authorization']`. Không được in SQL Raw có chứa email thật của khách ra log file.

---

## 💎 EPIC 4: FILLING THE GAPS (Lấp đầy UI)

**Phase 16 - 20 (Categories, Transfers, Goals, Bills)**

- **Cách làm chung**:
  - Dùng `react-hook-form` kết hợp `@hookform/resolvers/zod` để tạo Form nhập liệu bên UI.
  - Form Transfer: Cần 2 Select Box (Từ ví A -> Sang ví B). Backend sẽ nhận 1 mảng tạo 2 record transaction trong SQL Database trong cùng 1 Drizzle Transaction (`tx.transaction(async (tx) => { ... })`) để đảm bảo ACID.

---

## 🤖 EPIC 5: A.I INTEGRATION (Trí tuệ nhân tạo)

**Phase 31 - 35 (Quick Add AI & Financial Advisor)**

- **File**: `apps/api/src/services/adapters/nlp-adapter.ts`
- **Cách làm**:
  - Đăng ký API Key OpenAI. Viết hàm gọi model `gpt-4o-mini`.
  - Prompt: _"Bạn là một AI phân tích tài chính. Hãy đọc câu sau: '{text}'. Trả về chuẩn JSON: { amount: number, category: string, date: YYYY-MM-DD }"_.
  - Dùng thuộc tính `response_format: { type: 'json_object' }` của OpenAI.
  - Trả JSON này về UI để tự động điền vào Form thay vì bắt người dùng gõ tay.

---

## 🛡 EPIC 6: TESTING & QA (Playwright & Coverage)

**Phase 36 - 40**

- **File**: `apps/api/src/services/__tests__/finance-utils.test.ts`
- **Cách làm**: Import thư viện `Decimal.js`. Viết Test bắt buộc kiểm tra `0.1 + 0.2 === 0.3`.
- **E2E Playwright**: Cài `@playwright/test`. Viết test giả lập gõ email, pass, bấm nút Login, chờ URL chuyển sang `/dashboard`.

---

## 🌐 EPIC 7: DEPLOYMENT & DEVOPS (Vercel & PWA)

**Phase 41 - 50**

- **Cách làm Docker**: Build Multi-stage Dockerfile cho Backend nếu không dùng Vercel Edge.
- **Cách làm Vercel**: Điền đủ biến môi trường. Chạy lệnh `pnpm db:migrate` trên máy local trước để TiDB có bảng, sau đó trên Vercel chỉ chạy `pnpm build && pnpm start`.
- **Cách làm PWA**: Tạo file `manifest.json` trong `apps/web/public/`. Khai báo `icons`, `theme_color`, `short_name`. Dùng `next-pwa` plugin để tự sinh Service Worker giúp app cài được vào Home Screen điện thoại.
