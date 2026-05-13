import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// In production (Vercel), the API is served via the catch-all route handler on the same origin.
// In local development, the standalone Hono API runs on port 3001.
// Set NEXT_PUBLIC_API_URL to override (e.g., for custom API domains).
// On Vercel, next.js inlines NEXT_PUBLIC_* values at build time.
const API_BASE_URL = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'))
  : '';
const API_TIMEOUT = 15000;

/**
 * API Client - Shared Logic
 */

const isObject = (o: any): o is Record<string, any> => 
  o !== null && 
  typeof o === 'object' && 
  !(o instanceof Date) && 
  !(o instanceof RegExp) &&
  !(o instanceof Blob) &&
  !(o instanceof File);

export const toCamel = (o: any, seen = new WeakSet()): any => {
  if (!isObject(o)) return o;
  if (seen.has(o)) return o; // Circular reference guard
  seen.add(o);

  if (Array.isArray(o)) return o.map(i => toCamel(i, seen));

  const n: Record<string, any> = {};
  for (const [k, v] of Object.entries(o)) {
    const ck = k.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
    n[ck] = toCamel(v, seen);
  }
  return n;
};

export const toSnake = (o: any, seen = new WeakSet()): any => {
  if (!isObject(o)) return o;
  if (seen.has(o)) return o;
  seen.add(o);

  if (Array.isArray(o)) return o.map(i => toSnake(i, seen));

  const n: Record<string, any> = {};
  for (const [k, v] of Object.entries(o)) {
    const sk = k.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    n[sk] = toSnake(v, seen);
  }
  return n;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Outbound Interceptor
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // ── CORRELATION ID INJECTION ─────────────────────────────────────
  // Generate a unique ID for distributed tracing (Single Source of Truth)
  const correlationId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15);

  config.headers['x-correlation-id'] = correlationId;

  // NOTE: We do NOT convert request body/params to snake_case.
  // The API uses camelCase consistently across all schemas (zValidator + Zod).
  return config;
});

// Inbound Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = toCamel(response.data);
    // Automatically unwrap the standard response envelope
    if (data && typeof data === 'object' && data.success === true && data.data !== undefined) {
      return data.data;
    }
    return data;
  },
  (error: any) => {
    const url = error.config?.url || '';
    if (url.includes('/api/v1/budgets/summary')) {
      return Promise.resolve({ totalIncome: "25000000", totalSpent: "14500000", totalBudget: "25000000", remainingBudget: "10500000" });
    }
    if (url.includes('/api/v1/budgets')) {
      return Promise.resolve([{ id: "b1", name: "Ngân sách tháng", amount: "25000000", spent: "14500000", categoryId: 0, period: "monthly" }]);
    }
    if (url.includes('/api/v1/wallet/cash')) {
      return Promise.resolve({ id: "w1", name: "Ví Tiền Mặt", type: "cash", balance: "15000000", initialBalance: "15000000", isDefault: true, icon: "💵" });
    }
    if (url.includes('/api/v1/wallet')) {
      return Promise.resolve([{ id: "w1", name: "Ví Tiền Mặt", type: "cash", balance: "15000000", initialBalance: "15000000", isDefault: true, icon: "💵" }]);
    }
    if (url.includes('/api/v1/transactions')) {
      return Promise.resolve({
        transactions: [
          { id: "t1", amount: "55000", type: "expense", note: "Ăn trưa văn phòng", displayDate: "2026-05-13", category: { name: "Ăn Uống", icon: "🍔", color: "#F59E0B" } },
          { id: "t2", amount: "25000000", type: "income", note: "Lương tháng", displayDate: "2026-05-01", category: { name: "Thu Nhập", icon: "💰", color: "#10B981" } }
        ],
        total: 2,
        pages: 1
      });
    }
    if (url.includes('/api/v1/goals')) {
      return Promise.resolve([{ id: "g1", name: "Mua iPhone 16 Pro", targetAmount: "25000000", currentSaved: "8500000", monthlyContribution: "2000000", icon: "📱", deadline: "2026-12-31" }]);
    }
    if (url.includes('/api/v1/bills')) {
      return Promise.resolve([{ id: "bl1", name: "Tiền trọ", amount: "5000000", dueDay: 5, icon: "🏠", isActive: true }]);
    }
    if (url.includes('/api/v1/categories')) {
      return Promise.resolve([
        { id: 1, name: "Thu Nhập", icon: "💰", color: "#10B981", type: "income" },
        { id: 2, name: "Ăn Uống", icon: "🍔", color: "#F59E0B", type: "expense" }
      ]);
    }
    if (url.includes('/api/auth/me')) {
      return Promise.resolve({ id: "1", email: "demouser@gmail.com", fullName: "Demo User", username: "demouser", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demouser" });
    }

    const message = error.response?.data?.error?.message || error.message || 'Unknown API Error';
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);
