# MIDDLEWARE LAYER GUIDE — Finance Tracker V3
**Frontend Middleware Strategy (Client-side Only)**

**Ngày:** 16/04/2026  
**Kiến trúc:** Pure Frontend (No Next.js API Routes)

---

## 🎯 KHÁI NIỆM

**Middleware trong kiến trúc này = CLIENT-SIDE interceptors**

```
┌──────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 15)                                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │  React Components                                  │  │
│  │  └─> React Query Hooks                            │  │
│  │      └─> API Client (Axios)                       │  │
│  │          └─> ① Request Interceptor  (Middleware)  │  │
│  │          └─> ② Response Interceptor (Middleware)  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                         ↕️ HTTP
┌──────────────────────────────────────────────────────────┐
│  BACKEND (Hono.js - Separate Server)                     │
│  └─> JWT verification                                    │
│  └─> Rate limiting                                       │
│  └─> Database queries                                    │
└──────────────────────────────────────────────────────────┘
```

---

## 📦 CÁC LOẠI MIDDLEWARE

### 1. Request Interceptor (Outbound Middleware)

**Chức năng:**
- ✅ Tự động thêm JWT token vào header
- ✅ Format request data
- ✅ Add request ID (tracking)
- ✅ Add timestamp
- ✅ Log outbound requests (dev mode)

**Implementation:**

```typescript
// /src/app/_lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
  timeout: 10000,
});

// ① REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
  (config) => {
    // Add JWT token
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID
    config.headers['X-Request-ID'] = crypto.randomUUID();
    
    // Add timestamp
    config.headers['X-Client-Time'] = new Date().toISOString();
    
    // Log (dev only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config);
    }
    
    return config;
  },
  (error) => {
    console.error('[Request Error]', error);
    return Promise.reject(error);
  }
);
```

---

### 2. Response Interceptor (Inbound Middleware)

**Chức năng:**
- ✅ Handle 401 Unauthorized → Refresh token tự động
- ✅ Format response data
- ✅ Handle errors globally
- ✅ Log responses (dev mode)
- ✅ Show toast notifications (errors)

**Implementation:**

```typescript
// ② RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response) => {
    // Log success (dev only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 — Refresh token flow
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          { refreshToken }
        );
        
        // Update tokens
        localStorage.setItem('access_token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }
        
        // Update header for retry request
        apiClient.defaults.headers.Authorization = `Bearer ${data.token}`;
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        
        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Clear tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Redirect to login
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    handleAPIError(error);
    
    return Promise.reject(error);
  }
);
```

---

### 3. Error Handler Middleware

**File:** `/src/app/_lib/api/error-handler.ts`

```typescript
import { toast } from 'sonner';

export function handleAPIError(error: any) {
  // Network error
  if (!error.response) {
    toast.error('Lỗi kết nối', {
      description: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
    });
    return;
  }
  
  const { status, data } = error.response;
  
  switch (status) {
    case 400:
      // Validation error
      toast.error('Dữ liệu không hợp lệ', {
        description: data.error?.message || 'Vui lòng kiểm tra lại thông tin.',
      });
      break;
      
    case 401:
      // Unauthorized (already handled in interceptor)
      toast.error('Phiên đăng nhập hết hạn', {
        description: 'Vui lòng đăng nhập lại.',
      });
      break;
      
    case 403:
      // Forbidden
      toast.error('Không có quyền truy cập', {
        description: 'Bạn không có quyền thực hiện thao tác này.',
      });
      break;
      
    case 404:
      // Not found
      toast.error('Không tìm thấy', {
        description: 'Tài nguyên yêu cầu không tồn tại.',
      });
      break;
      
    case 429:
      // Rate limit
      toast.error('Quá nhiều yêu cầu', {
        description: 'Vui lòng thử lại sau ít phút.',
      });
      break;
      
    case 500:
    case 502:
    case 503:
      // Server error
      toast.error('Lỗi máy chủ', {
        description: 'Server đang gặp sự cố. Vui lòng thử lại sau.',
      });
      break;
      
    default:
      toast.error('Đã xảy ra lỗi', {
        description: data.error?.message || 'Vui lòng thử lại.',
      });
  }
  
  // Log to console (dev only)
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', {
      status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });
  }
}
```

---

## 🔐 TOKEN MANAGEMENT

### Authentication Flow

```
┌─────────────┐
│  1. LOGIN   │
└──────┬──────┘
       │
       ├─> POST /api/auth/login { email, password }
       │
       ├─> Response: { token, refreshToken, user }
       │
       └─> localStorage.setItem('access_token', token)
           localStorage.setItem('refresh_token', refreshToken)

┌─────────────────────┐
│  2. API REQUEST     │
└──────┬──────────────┘
       │
       ├─> Request Interceptor adds: Authorization: Bearer {token}
       │
       └─> Backend validates JWT

┌─────────────────────┐
│  3. TOKEN EXPIRED   │
└──────┬──────────────┘
       │
       ├─> Backend returns 401
       │
       ├─> Response Interceptor catches 401
       │
       ├─> POST /api/auth/refresh { refreshToken }
       │
       ├─> Get new access_token
       │
       ├─> Update localStorage
       │
       └─> Retry original request

┌─────────────────────┐
│  4. REFRESH FAILED  │
└──────┬──────────────┘
       │
       ├─> Clear localStorage
       │
       └─> Redirect to /login
```

### Token Storage Strategy

```typescript
// /src/app/_lib/auth/token-manager.ts

export const tokenManager = {
  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },
  
  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },
  
  // Set tokens
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },
  
  // Clear tokens
  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  
  // Check if token is expired (JWT decode)
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },
};
```

---

## 📊 DATA FLOW (Chi tiết)

### Example: Fetch S2S Data

```
┌──────────────────────────────────────────────────────────┐
│  Component: S2SHeroSection.tsx                           │
│  const { data } = useS2S(userId, 'month');               │
└───────────────────────────┬──────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│  Hook: useS2S.ts                                         │
│  useQuery({                                              │
│    queryFn: () => s2sAPI.getSummary('2026-04')          │
│  })                                                      │
└───────────────────────────┬──────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│  API Client: endpoints.ts                                │
│  apiClient.get('/api/finance/safe-to-spend?month=...')  │
└───────────────────────────┬──────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│  ① REQUEST INTERCEPTOR                                   │
│  - Add: Authorization: Bearer eyJhbGc...                 │
│  - Add: X-Request-ID: 123e4567-e89b-12d3...              │
└───────────────────────────┬──────────────────────────────┘
                            ↓
                         HTTP GET
                            ↓
┌──────────────────────────────────────────────────────────┐
│  BACKEND (Hono.js)                                       │
│  GET /api/finance/safe-to-spend                          │
│  - Verify JWT                                            │
│  - Query database (Drizzle ORM)                          │
│  - Calculate S2S (in-memory)                             │
│  - Return JSON response                                  │
└───────────────────────────┬──────────────────────────────┘
                            ↓
                      HTTP 200 OK
                            ↓
┌──────────────────────────────────────────────────────────┐
│  ② RESPONSE INTERCEPTOR                                  │
│  - Check status (200 = OK)                               │
│  - Log response (dev mode)                               │
│  - Return response.data                                  │
└───────────────────────────┬──────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│  React Query Cache                                       │
│  - Store data với key: ['s2s', userId, 'month']         │
│  - staleTime: 5 minutes                                  │
└───────────────────────────┬──────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│  Component Re-render                                     │
│  - data = { safeToSpend: 5800000, ... }                 │
│  - isLoading = false                                     │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 CACHE STRATEGY (React Query)

### Cache Configuration

```typescript
// /src/app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 minutes
      gcTime: 1000 * 60 * 10,          // 10 minutes (formerly cacheTime)
      retry: 2,                         // Retry failed requests 2 times
      refetchOnWindowFocus: false,      // Don't refetch on window focus
      refetchOnReconnect: true,         // Refetch on network reconnect
    },
    mutations: {
      retry: 1,                         // Retry mutations once
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Cache Invalidation Strategy

```typescript
// When creating a transaction:
import { useQueryClient } from '@tanstack/react-query';

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTransactionDTO) =>
      transactionsAPI.create(data),
    
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['s2s'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      
      toast.success('Đã thêm giao dịch');
    },
    
    onError: (error) => {
      handleAPIError(error);
    },
  });
}
```

---

## 🛡️ SECURITY BEST PRACTICES

### 1. Token Storage
```typescript
// ✅ GOOD: Use localStorage (simpler for SPA)
localStorage.setItem('access_token', token);

// ❌ BAD: httpOnly cookies (requires backend on same domain)
// document.cookie = `token=${token}; httpOnly; secure`;
```

### 2. XSS Protection
```typescript
// ✅ GOOD: React auto-escapes by default
<div>{user.name}</div>

// ❌ BAD: dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### 3. HTTPS Only
```typescript
// Production: Always use HTTPS
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (process.env.NODE_ENV === 'production' && !API_BASE_URL?.startsWith('https')) {
  throw new Error('API URL must use HTTPS in production');
}
```

---

## 📝 PHÂN LOẠI DỮ LIỆU

### 1. Public Data (Không cần token)
```typescript
// Login, Register
POST /api/auth/login
POST /api/auth/register
```

### 2. Private Data (Cần JWT token)
```typescript
// User-specific data
GET /api/finance/safe-to-spend
GET /api/transactions
GET /api/goals
GET /api/bills
```

### 3. Sensitive Data (Không lưu frontend)
```typescript
// ❌ NEVER store in frontend:
// - Password
// - Credit card numbers
// - Bank account numbers
// - SSN/CCCD

// ✅ Only send to backend, never store:
POST /api/transactions { amount, note }
```

---

## 🧪 TESTING MIDDLEWARE

### Unit Test Example

```typescript
// __tests__/api/client.test.ts
import { apiClient } from '@/app/_lib/api/client';
import MockAdapter from 'axios-mock-adapter';

describe('API Client Middleware', () => {
  const mock = new MockAdapter(apiClient);
  
  beforeEach(() => {
    localStorage.setItem('access_token', 'fake-token');
  });
  
  test('should add Authorization header', async () => {
    mock.onGet('/test').reply((config) => {
      expect(config.headers.Authorization).toBe('Bearer fake-token');
      return [200, { success: true }];
    });
    
    await apiClient.get('/test');
  });
  
  test('should refresh token on 401', async () => {
    localStorage.setItem('refresh_token', 'fake-refresh-token');
    
    // First request fails with 401
    mock.onGet('/protected').replyOnce(401);
    
    // Refresh token succeeds
    mock.onPost('/api/auth/refresh').reply(200, {
      token: 'new-access-token',
    });
    
    // Retry original request
    mock.onGet('/protected').replyOnce(200, { data: 'success' });
    
    const response = await apiClient.get('/protected');
    expect(response.data.data).toBe('success');
  });
});
```

---

## 📌 SUMMARY

| Layer | Trách nhiệm | Công nghệ |
|-------|-------------|-----------|
| **Request Interceptor** | Add token, Add headers, Log | Axios interceptors |
| **Response Interceptor** | Handle 401, Format errors, Log | Axios interceptors |
| **Error Handler** | Show toast, Log, Format | Sonner + Custom handler |
| **Token Manager** | Store/retrieve/refresh tokens | localStorage + JWT decode |
| **Cache Layer** | Cache data, Invalidate cache | React Query |

---

**Lưu ý:** Frontend middleware CHỈ là client-side logic. Backend API (Hono.js) sẽ có middleware riêng (JWT verification, rate limiting, etc.).
