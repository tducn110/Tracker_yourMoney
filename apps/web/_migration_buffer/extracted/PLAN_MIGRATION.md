# KẾ HOẠCH MIGRATION — Finance Tracker V3
## React+Vite → Next.js 15 App Router (Pure Frontend Only)

**Ngày tạo:** 16/04/2026  
**Phân tích bởi:** AI Assistant  
**Phê duyệt bởi:** User

---

## 📋 TỔNG QUAN

### Mục tiêu
1. ✅ Migrate toàn bộ code từ **React + Vite** sang **Next.js 15 App Router**
2. ✅ Tách biệt hoàn toàn **Frontend** (Next.js) và **Backend** (Hono.js - sẽ làm sau)
3. ✅ Tổ chức lại components theo **module-based architecture**
4. ✅ Chuẩn bị infrastructure cho việc tích hợp API backend

### Nguyên tắc chính
- ❌ KHÔNG tạo Next.js API Routes (`/app/api/*`)
- ❌ KHÔNG tạo Server Actions truy cập database
- ✅ CHỈ làm Pure UI với HTTP Client
- ✅ Middleware layer = Client-side (axios interceptors, React Query)
- ✅ Giữ nguyên 100% UI hiện tại (Antigravity V1.2 layout)

---

## 🏗️ PHASE 1: FOUNDATION SETUP

### 1.1. Package.json Migration
**File:** `/package.json`

**Thay đổi:**
```json
{
  "dependencies": {
    - "vite": "6.3.5"
    - "@vitejs/plugin-react": "4.7.0"
    + "next": "^15.1.5"
    + "@tanstack/react-query": "^5.0.0"  // Thay thế useAPI hooks
    + "axios": "^1.6.0"                  // HTTP client cho backend API
  }
}
```

**Tasks:**
- [ ] Install Next.js 15
- [ ] Install React Query (state management + caching)
- [ ] Install Axios (HTTP client)
- [ ] Remove Vite & plugins

### 1.2. Cấu trúc thư mục mới
```
/src/app/
├── (auth)/
│   ├── login/page.tsx           ← /src/app/pages/Login.tsx
│   └── register/page.tsx        ← /src/app/pages/Register.tsx
│
├── (dashboard)/
│   ├── layout.tsx               ← /src/app/components/Layout.tsx (Sidebar + Header)
│   ├── page.tsx                 ← /src/app/pages/Dashboard.tsx
│   ├── transactions/page.tsx    ← /src/app/pages/Transactions.tsx
│   ├── analytics/page.tsx       ← /src/app/pages/Analytics.tsx
│   ├── goals/page.tsx           ← /src/app/pages/Goals.tsx
│   ├── bills/page.tsx           ← /src/app/pages/Bills.tsx
│   └── settings/page.tsx        ← /src/app/pages/Settings.tsx
│
├── _components/                 ← Shared components (private, không route)
│   ├── s2s/
│   │   ├── S2SHeroSection.tsx
│   │   └── S2SRingChart.tsx
│   ├── wallet/
│   │   ├── CashWalletStrip.tsx
│   │   └── CashWalletWidget.tsx
│   ├── quick-add/
│   │   ├── QuickInputBar.tsx
│   │   ├── ChatQuickAdd.tsx
│   │   └── QuickAddModal.tsx
│   ├── transactions/
│   │   └── TransactionList.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ui/                      ← shadcn/ui components (giữ nguyên)
│
├── _lib/                        ← Library code (private)
│   ├── api/
│   │   ├── client.ts            ← Axios instance config
│   │   └── endpoints.ts         ← API endpoint definitions
│   ├── hooks/
│   │   ├── useS2S.ts            ← React Query hook for S2S
│   │   ├── useTransactions.ts
│   │   ├── useGoals.ts
│   │   └── useBills.ts
│   ├── utils/
│   │   ├── formatters.ts        ← formatVND, formatDate
│   │   └── validators.ts
│   └── types/
│       └── index.ts             ← TypeScript types
│
├── layout.tsx                   ← Root layout (Providers)
└── providers.tsx                ← React Query Provider

/src/styles/                     ← Giữ nguyên
```

**Tasks:**
- [ ] Tạo cấu trúc thư mục mới
- [ ] Copy components hiện tại vào đúng vị trí
- [ ] Chuyển đổi routing từ React Router → Next.js App Router

---

## 🎨 PHASE 2: COMPONENT REFACTORING

### 2.1. Core Components (Module-based)

#### Module: S2S (Safe-to-Spend)
**Files:**
- `/src/app/_components/s2s/S2SHeroSection.tsx` (main)
- `/src/app/_components/s2s/S2SRingChart.tsx` (SVG ring chart)
- `/src/app/_components/s2s/S2SFormulaPills.tsx` (breakdown pills)
- `/src/app/_lib/hooks/useS2S.ts` (React Query hook)

**Changes:**
```tsx
// OLD: src/app/components/S2SHeroSection.tsx
import { mockS2SData } from '../data/mockData';
const data = mockS2SData; // ❌ Hardcoded mock

// NEW: src/app/_components/s2s/S2SHeroSection.tsx
'use client';
import { useS2S } from '@/app/_lib/hooks/useS2S';

export function S2SHeroSection({ userId, period = 'month' }) {
  const { data, isLoading, error } = useS2S(userId, period);
  
  if (isLoading) return <S2SSkeleton />;
  if (error) return <S2SError error={error} />;
  
  return <div>...</div>;
}
```

**Tasks:**
- [ ] Tách S2SRingChart thành component riêng
- [ ] Tách S2SFormulaPills thành component riêng
- [ ] Tạo useS2S hook với React Query
- [ ] Add loading state (skeleton)
- [ ] Add error state

#### Module: Wallet (Cash Wallet)
**Files:**
- `/src/app/_components/wallet/CashWalletStrip.tsx`
- `/src/app/_components/wallet/CashWalletWidget.tsx`
- `/src/app/_lib/hooks/useCashWallet.ts`

**Tasks:**
- [ ] Di chuyển sang module wallet/
- [ ] Tạo useCashWallet hook
- [ ] Add Quick Sync mutation (React Query)

#### Module: Quick Add
**Files:**
- `/src/app/_components/quick-add/QuickInputBar.tsx`
- `/src/app/_components/quick-add/ChatQuickAdd.tsx`
- `/src/app/_components/quick-add/QuickAddModal.tsx`
- `/src/app/_lib/hooks/useCreateTransaction.ts`

**Tasks:**
- [ ] Group vào module quick-add/
- [ ] Tạo useCreateTransaction mutation hook
- [ ] Integrate với React Query

### 2.2. Page Components

#### Dashboard Page
**File:** `/src/app/(dashboard)/page.tsx`

**Structure:**
```tsx
'use client';
import { S2SHeroSection } from '@/app/_components/s2s/S2SHeroSection';
import { CashWalletStrip } from '@/app/_components/wallet/CashWalletStrip';
import { QuickInputBar } from '@/app/_components/quick-add/QuickInputBar';

export default function DashboardPage() {
  const userId = 1; // TODO: Get from auth context
  
  return (
    <div className="space-y-6">
      {/* HÀNG 1 — S2S Hero */}
      <S2SHeroSection userId={userId} />
      
      {/* HÀNG 2 — 3 Metric Cards */}
      <MetricCardsRow userId={userId} />
      
      {/* HÀNG 3 — Cash Wallet Strip */}
      <CashWalletStrip userId={userId} />
      
      {/* HÀNG 4 — Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <RecentTransactions userId={userId} />
          <GoalsGrid userId={userId} />
        </div>
        <div className="col-span-4">
          <UpcomingBills userId={userId} />
        </div>
      </div>
      
      {/* FAB — Quick Add */}
      <QuickInputBar />
    </div>
  );
}
```

**Tasks:**
- [ ] Convert Dashboard.tsx → page.tsx
- [ ] Replace mock data với React Query hooks
- [ ] Add loading states
- [ ] Add error boundaries

#### Other Pages
**Files:**
- `/src/app/(dashboard)/transactions/page.tsx`
- `/src/app/(dashboard)/analytics/page.tsx`
- `/src/app/(dashboard)/goals/page.tsx`
- `/src/app/(dashboard)/bills/page.tsx`
- `/src/app/(dashboard)/settings/page.tsx`

**Tasks:**
- [ ] Convert từ pages/* sang (dashboard)/*/page.tsx
- [ ] Replace mock data với API calls
- [ ] Add Server Components cho static content
- [ ] Add Client Components cho interactive parts

---

## 🔌 PHASE 3: API CLIENT LAYER

### 3.1. Axios Instance Setup
**File:** `/src/app/_lib/api/client.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — Add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — Handle 401 & refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken
        });
        
        localStorage.setItem('access_token', data.token);
        apiClient.defaults.headers.Authorization = `Bearer ${data.token}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

**Tasks:**
- [ ] Tạo axios instance
- [ ] Add request interceptor (token injection)
- [ ] Add response interceptor (401 handling + refresh token)
- [ ] Add error formatting

### 3.2. API Endpoints
**File:** `/src/app/_lib/api/endpoints.ts`

```typescript
import { apiClient } from './client';

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/api/auth/login', { email, password }),
  
  register: (data: RegisterData) =>
    apiClient.post('/api/auth/register', data),
  
  logout: () =>
    apiClient.post('/api/auth/logout'),
  
  me: () =>
    apiClient.get('/api/auth/me'),
};

// S2S
export const s2sAPI = {
  getSummary: (month: string) =>
    apiClient.get(`/api/finance/safe-to-spend?month=${month}`),
  
  checkImpact: (amount: number, type: 'income' | 'expense') =>
    apiClient.post('/api/finance/check-impact', { amount, type }),
};

// Transactions
export const transactionsAPI = {
  list: (filters: TransactionFilters) =>
    apiClient.get('/api/transactions', { params: filters }),
  
  create: (data: CreateTransactionDTO) =>
    apiClient.post('/api/transactions', data),
  
  update: (id: number, data: UpdateTransactionDTO) =>
    apiClient.put(`/api/transactions/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/api/transactions/${id}`),
};

// Goals
export const goalsAPI = {
  list: () => apiClient.get('/api/goals'),
  create: (data: CreateGoalDTO) => apiClient.post('/api/goals', data),
  update: (id: number, data: UpdateGoalDTO) => apiClient.put(`/api/goals/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/goals/${id}`),
};

// Bills
export const billsAPI = {
  list: () => apiClient.get('/api/bills'),
  create: (data: CreateBillDTO) => apiClient.post('/api/bills', data),
  pay: (id: number, data: PayBillDTO) => apiClient.patch(`/api/bills/${id}/pay`, data),
};

// Cash Wallet
export const walletAPI = {
  getCash: () => apiClient.get('/api/wallet/cash'),
  updateCash: (newBalance: number, note: string) =>
    apiClient.put('/api/wallet/cash', { newBalance, note }),
};

// Analytics
export const analyticsAPI = {
  categorySpending: (month: string) =>
    apiClient.get(`/api/analytics/category-spending?month=${month}`),
  
  monthlyTrend: (months: number) =>
    apiClient.get(`/api/analytics/monthly-trend?months=${months}`),
};
```

**Tasks:**
- [ ] Tạo endpoint definitions
- [ ] Add TypeScript types cho request/response
- [ ] Add JSDoc comments

### 3.3. React Query Hooks
**File:** `/src/app/_lib/hooks/useS2S.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { s2sAPI } from '../api/endpoints';

export function useS2S(userId: number, period: string = 'month') {
  return useQuery({
    queryKey: ['s2s', userId, period],
    queryFn: async () => {
      const { data } = await s2sAPI.getSummary(period);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes
  });
}

export function useS2SCheckImpact() {
  return useMutation({
    mutationFn: ({ amount, type }: { amount: number; type: 'income' | 'expense' }) =>
      s2sAPI.checkImpact(amount, type),
  });
}
```

**Tasks:**
- [ ] Tạo useS2S query hook
- [ ] Tạo useTransactions query hook
- [ ] Tạo useGoals query hook
- [ ] Tạo useBills query hook
- [ ] Tạo mutation hooks (create/update/delete)

---

## 📄 PHASE 4: DOCUMENTATION FILES

### 4.1. File: MIDDLEWARE_GUIDE.md
**Mục đích:** Hướng dẫn sử dụng middleware layer (client-side)

**Nội dung:**
- Axios interceptors (request/response)
- Token management (access + refresh)
- Error handling strategy
- Request retry logic
- Loading state management
- Cache strategy với React Query

### 4.2. File: BACKEND_REQUIREMENTS.md
**Mục đích:** Yêu cầu cho backend API (Hono.js)

**Nội dung:**
- REST API endpoints cần thiết
- Request/Response schema (Zod)
- Authentication flow (JWT + refresh token)
- Error response format
- Rate limiting requirements
- CORS configuration

### 4.3. File: DATABASE_GUIDE.md
**Mục đích:** Hướng dẫn sử dụng database (cho backend team)

**Nội dung:**
- Schema design (Drizzle ORM)
- Query patterns (transactions, aggregations)
- Index strategy
- Data classification (PII, metrics, logs)
- Migration workflow
- Backup strategy

### 4.4. File: REPORT_UI.md
**Mục đích:** Report tiến độ UI implementation

**Nội dung:**
- Components đã hoàn thành
- Components đang làm
- Tech stack sử dụng
- Design system (colors, spacing, typography)
- Animation patterns
- Responsive breakpoints

### 4.5. File: TECH_RISKS.md
**Mục đích:** Tech risks & mitigation

**Nội dung:**
- Next.js 15 compatibility issues
- React Query cache invalidation
- Token refresh race condition
- CORS issues trong development
- Image optimization (Vercel Blob)
- Performance bottlenecks

---

## 🎯 PHASE 5: TESTING & VALIDATION

### 5.1. Mock Data Development Mode
**File:** `/src/app/_lib/api/mock.ts`

```typescript
export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const mockAPIClient = {
  s2s: {
    getSummary: async () => mockS2SData,
  },
  transactions: {
    list: async () => mockTransactions,
  },
  // ...
};

// Conditional export
export const api = USE_MOCK_API ? mockAPIClient : realAPIClient;
```

**Tasks:**
- [ ] Tạo mock API client
- [ ] Add feature flag (USE_MOCK_API)
- [ ] Keep mock data từ mockData.ts
- [ ] Add switch để toggle giữa mock và real API

### 5.2. Error Boundaries
**File:** `/src/app/error.tsx` (Next.js convention)

```tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2>Đã xảy ra lỗi!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Thử lại</button>
    </div>
  );
}
```

**Tasks:**
- [ ] Tạo global error boundary
- [ ] Tạo error boundaries cho từng page
- [ ] Add error logging (console/Sentry)

---

## 📊 MIGRATION CHECKLIST

### Pre-migration
- [ ] Backup toàn bộ code hiện tại
- [ ] Review SYSTEM_ARCHITECTURE.md
- [ ] Review UI_ARCHITECTURE.md
- [ ] Xác nhận Next.js version (15.x)

### Phase 1: Foundation
- [ ] Install Next.js 15 + dependencies
- [ ] Remove Vite config
- [ ] Create new folder structure
- [ ] Setup Tailwind CSS v4 for Next.js
- [ ] Setup Motion (motion/react)

### Phase 2: Components
- [ ] Migrate S2S module
- [ ] Migrate Wallet module
- [ ] Migrate Quick Add module
- [ ] Migrate UI components (shadcn/ui)
- [ ] Migrate Layout components (Sidebar, Header)

### Phase 3: Pages
- [ ] Migrate Dashboard page
- [ ] Migrate Transactions page
- [ ] Migrate Analytics page
- [ ] Migrate Goals page
- [ ] Migrate Bills page
- [ ] Migrate Settings page
- [ ] Migrate Auth pages (Login, Register)

### Phase 4: API Client
- [ ] Setup Axios instance
- [ ] Create API endpoints
- [ ] Create React Query hooks
- [ ] Setup React Query Provider
- [ ] Add mock data mode

### Phase 5: Documentation
- [ ] Write MIDDLEWARE_GUIDE.md
- [ ] Write BACKEND_REQUIREMENTS.md
- [ ] Write DATABASE_GUIDE.md
- [ ] Write REPORT_UI.md
- [ ] Write TECH_RISKS.md

### Phase 6: Testing
- [ ] Test all pages trong dev mode (mock data)
- [ ] Test routing (Next.js App Router)
- [ ] Test authentication flow (mock)
- [ ] Test responsive design
- [ ] Test animations

### Post-migration
- [ ] Delete old files (vite.config.ts, old pages/)
- [ ] Update .gitignore
- [ ] Update README.md
- [ ] Document breaking changes

---

## 🚀 EXECUTION PLAN

### Tuần 1: Foundation + Core Components
- Day 1-2: Phase 1 (Foundation setup)
- Day 3-4: Phase 2 (S2S + Wallet modules)
- Day 5: Phase 2 (Quick Add module)

### Tuần 2: Pages + API Layer
- Day 1-2: Phase 3 (Dashboard + Transactions pages)
- Day 3: Phase 3 (Other pages)
- Day 4-5: Phase 4 (API Client layer)

### Tuần 3: Documentation + Testing
- Day 1-2: Phase 5 (Documentation files)
- Day 3-4: Phase 6 (Testing)
- Day 5: Cleanup + handoff

---

## ⚠️ CRITICAL NOTES

1. **KHÔNG tạo Next.js API Routes** (`/app/api/*`)
2. **KHÔNG sử dụng Server Actions** để query database
3. **Frontend chỉ gọi HTTP API** (Hono.js backend - sẽ làm riêng)
4. **Middleware = Client-side only** (axios interceptors)
5. **Giữ nguyên 100% design** (Antigravity V1.2 layout)
6. **Mock data mode** cho development (không cần backend ngay lập tức)

---

**Approved by:** _________________  
**Date:** _________________
