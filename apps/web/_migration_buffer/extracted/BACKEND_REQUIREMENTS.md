# BACKEND REQUIREMENTS — Finance Tracker V3
**API Specifications for Hono.js Backend**

**Ngày:** 16/04/2026  
**Target Stack:** Hono.js + Drizzle ORM + TiDB Serverless  
**Deploy:** Vercel Edge Functions

---

## 🎯 TỔNG QUAN

Backend API cần cung cấp REST endpoints cho Frontend (Next.js 15) gọi qua HTTP.

**Nguyên tắc:**
- ✅ RESTful API design
- ✅ JWT authentication (access + refresh token)
- ✅ Standardized response format
- ✅ Zod validation cho mọi request
- ✅ Business logic ở tầng Service (KHÔNG dùng DB Views/Triggers)
- ✅ Rate limiting (Upstash Redis)
- ✅ CORS config cho Next.js frontend

---

## 📡 API ENDPOINTS (Chi tiết)

### 1. AUTHENTICATION

#### POST `/api/auth/register`
**Mục đích:** Đăng ký user mới

**Request:**
```typescript
{
  email: string;          // valid email format
  password: string;       // min 8 chars
  fullName: string;       // min 2 chars
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    token: string,        // JWT access token (15 min expiry)
    refreshToken: string, // JWT refresh token (7 days expiry)
    user: {
      id: number,
      email: string,
      fullName: string,
      avatarUrl: string | null,
      createdAt: string,  // ISO 8601
    }
  }
}
```

**Errors:**
- `400`: Email đã tồn tại
- `422`: Validation error

**Backend tasks:**
1. Validate input với Zod
2. Check email unique
3. Hash password (bcrypt)
4. Insert user vào DB
5. Call `initializeNewUser(userId)` service (tạo settings, wallet)
6. Generate JWT tokens
7. Return response

---

#### POST `/api/auth/login`
**Mục đích:** Đăng nhập

**Request:**
```typescript
{
  email: string,
  password: string,
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    token: string,
    refreshToken: string,
    user: {
      id: number,
      email: string,
      fullName: string,
      avatarUrl: string | null,
    }
  }
}
```

**Errors:**
- `401`: Email hoặc password không đúng
- `403`: User bị khóa (isActive = 0)

---

#### POST `/api/auth/refresh`
**Mục đích:** Refresh access token

**Request:**
```typescript
{
  refreshToken: string,
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    token: string,        // New access token
    refreshToken: string, // Optional: rotate refresh token
  }
}
```

**Errors:**
- `401`: Refresh token không hợp lệ hoặc đã hết hạn

---

#### POST `/api/auth/logout`
**Mục đích:** Đăng xuất (revoke refresh token)

**Request:** Bearer token in header

**Response (200):**
```typescript
{
  success: true,
  data: null,
}
```

---

#### GET `/api/auth/me`
**Mục đích:** Lấy thông tin user hiện tại

**Request:** Bearer token in header

**Response (200):**
```typescript
{
  success: true,
  data: {
    id: number,
    email: string,
    fullName: string,
    avatarUrl: string | null,
    avatarText: string | null,
    createdAt: string,
  }
}
```

---

### 2. FINANCE (S2S Engine)

#### GET `/api/finance/safe-to-spend`
**Mục đích:** Lấy thông tin S2S (Safe-to-Spend)

**Query params:**
```typescript
month?: string  // "YYYY-MM", default: current month
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    safeToSpend: number,        // VNĐ
    isOverBudget: boolean,
    usagePercent: number,       // 0-100
    status: 'safe' | 'warning' | 'danger',
    period: string,             // "2026-04"
    breakdown: {
      totalIncome: number,
      totalExpense: number,
      fixedCostsPending: number,
      goalsAllocation: number,
      emergencyBuffer: number,
    }
  }
}
```

**Backend logic:**
1. Parse `month` param (default: current month)
2. Call `calculateSafeToSpend(userId, month)` service
3. Return S2SResult

**Reference:** `SYSTEM_ARCHITECTURE.md` → Section 4 → S2S Engine

---

#### POST `/api/finance/check-impact`
**Mục đích:** Preview impact của transaction mới lên S2S

**Request:**
```typescript
{
  amount: number,
  type: 'income' | 'expense',
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    currentS2S: number,
    newS2S: number,
    impact: number,          // positive or negative
    newStatus: 'safe' | 'warning' | 'danger',
  }
}
```

---

### 3. TRANSACTIONS

#### GET `/api/transactions`
**Mục đích:** Lấy danh sách giao dịch

**Query params:**
```typescript
month?: string,       // "YYYY-MM"
category_id?: number,
type?: 'income' | 'expense',
page?: number,        // default: 1
limit?: number,       // default: 20, max: 100
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    transactions: [
      {
        id: number,
        userId: number,
        amount: number,
        type: 'income' | 'expense',
        categoryId: number | null,
        categoryName: string | null,
        note: string | null,
        transactionDate: string,  // ISO 8601
        createdAt: string,
      }
    ],
    meta: {
      page: number,
      limit: number,
      total: number,
      totalPages: number,
    }
  }
}
```

---

#### POST `/api/transactions`
**Mục đích:** Tạo giao dịch mới

**Request:**
```typescript
{
  amount: number,           // > 0
  type: 'income' | 'expense',
  categoryId?: number,
  note?: string,
  transactionDate?: string, // ISO 8601, default: now
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    id: number,
    userId: number,
    amount: number,
    type: string,
    categoryId: number | null,
    note: string | null,
    transactionDate: string,
    createdAt: string,
  }
}
```

**Backend tasks:**
1. Validate với Zod
2. Insert vào `transactions` table
3. Invalidate S2S cache (nếu có)
4. Return created transaction

---

#### POST `/api/transactions/quick`
**Mục đích:** Quick-add transaction với NLP

**Request:**
```typescript
{
  text: string,  // "ăn sáng 30k", "lương tháng 4 25 triệu"
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    id: number,
    amount: number,
    type: 'income' | 'expense',
    categoryId: number | null,
    note: string,
    transactionDate: string,
    parsed: {
      originalText: string,
      confidence: number,  // 0-1
    }
  }
}
```

**Backend logic:**
1. Call OpenAI API để parse text
2. Extract: amount, type, category, date
3. Create transaction
4. Return với metadata `parsed`

---

#### PUT `/api/transactions/:id`
**Mục đích:** Cập nhật transaction

**Request:**
```typescript
{
  amount?: number,
  type?: 'income' | 'expense',
  categoryId?: number | null,
  note?: string | null,
  transactionDate?: string,
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    id: number,
    // ... updated fields
  }
}
```

---

#### DELETE `/api/transactions/:id`
**Mục đích:** Xóa transaction (soft delete)

**Response (200):**
```typescript
{
  success: true,
  data: null,
}
```

**Backend:** Set `deletedAt = NOW()`

---

### 4. CATEGORIES

#### GET `/api/categories`
**Mục đích:** Lấy danh sách categories

**Response (200):**
```typescript
{
  success: true,
  data: [
    {
      id: number,
      userId: number,
      name: string,
      icon: string,         // emoji
      color: string,        // hex
      type: 'income' | 'expense',
      isSystem: boolean,
      createdAt: string,
    }
  ]
}
```

---

#### POST `/api/categories`
**Request:**
```typescript
{
  name: string,
  icon: string,
  color: string,
  type: 'income' | 'expense',
}
```

---

#### PUT `/api/categories/:id`
#### DELETE `/api/categories/:id`

---

### 5. GOALS

#### GET `/api/goals`
**Response (200):**
```typescript
{
  success: true,
  data: [
    {
      id: number,
      userId: number,
      name: string,
      icon: string,
      targetAmount: number,
      currentSaved: number,
      monthlyContribution: number,
      targetDate: string,
      status: 'active' | 'completed' | 'paused',
      completedAt: string | null,
      createdAt: string,
    }
  ]
}
```

---

#### POST `/api/goals`
**Request:**
```typescript
{
  name: string,
  icon: string,
  targetAmount: number,
  monthlyContribution: number,
  targetDate: string,
}
```

---

#### PUT `/api/goals/:id`
**Request:**
```typescript
{
  name?: string,
  currentSaved?: number,     // Trigger checkAndCompleteGoal() if >= targetAmount
  monthlyContribution?: number,
  status?: 'active' | 'paused',
}
```

**Backend logic:**
- Nếu `currentSaved >= targetAmount`:
  - Set `status = 'completed'`
  - Set `completedAt = NOW()`
  - Create notification

---

### 6. BILLS

#### GET `/api/bills`
**Response (200):**
```typescript
{
  success: true,
  data: [
    {
      id: number,
      userId: number,
      name: string,
      amount: number,
      frequency: 'monthly' | 'quarterly' | 'yearly',
      dueDay: number,       // 1-31
      isActive: boolean,
      lastPaidMonth: string | null,
      createdAt: string,
    }
  ]
}
```

---

#### POST `/api/bills`
**Request:**
```typescript
{
  name: string,
  amount: number,
  frequency: 'monthly' | 'quarterly' | 'yearly',
  dueDay: number,
}
```

---

#### PATCH `/api/bills/:id/pay`
**Mục đích:** Đánh dấu bill đã thanh toán

**Request:**
```typescript
{
  periodMonth: string,      // "2026-04"
  amountPaid: number,
}
```

**Backend logic:**
1. Create/update `bill_payments` record
2. Set `status = 'paid'`
3. Update `lastPaidMonth`
4. Create expense transaction (nếu chưa có)

---

### 7. WALLET

#### GET `/api/wallet/cash`
**Response (200):**
```typescript
{
  success: true,
  data: {
    balance: number,
    lastSyncAt: string,
  }
}
```

---

#### PUT `/api/wallet/cash`
**Mục đích:** Sync cash wallet

**Request:**
```typescript
{
  newBalance: number,
  note: string,
}
```

**Backend logic:**
1. Get current balance
2. Calculate diff = newBalance - currentBalance
3. If diff < 0:
   - Create expense transaction (amount = abs(diff), note = "Chi phí không tên")
4. Update `cash_wallet.balance`
5. Insert log vào `cash_wallet_logs`

---

### 8. ANALYTICS

#### GET `/api/analytics/category-spending`
**Query params:**
```typescript
month: string  // "YYYY-MM"
```

**Response (200):**
```typescript
{
  success: true,
  data: [
    {
      categoryId: number,
      categoryName: string,
      totalAmount: number,
      transactionCount: number,
      percentage: number,   // % of total expenses
    }
  ]
}
```

---

#### GET `/api/analytics/monthly-trend`
**Query params:**
```typescript
months?: number  // default: 6
```

**Response (200):**
```typescript
{
  success: true,
  data: [
    {
      month: string,        // "2026-04"
      totalIncome: number,
      totalExpense: number,
      netSavings: number,
      s2sBudget: number,
    }
  ]
}
```

---

### 9. NOTIFICATIONS

#### GET `/api/notifications`
**Query params:**
```typescript
unreadOnly?: boolean
```

**Response (200):**
```typescript
{
  success: true,
  data: [
    {
      id: number,
      userId: number,
      type: 'bill_reminder' | 'goal_completed' | 'overspending',
      title: string,
      body: string,
      isRead: boolean,
      createdAt: string,
    }
  ]
}
```

---

#### PATCH `/api/notifications/:id/read`
**Response (200):**
```typescript
{ success: true, data: null }
```

---

#### PATCH `/api/notifications/read-all`
**Response (200):**
```typescript
{ success: true, data: null }
```

---

## 🔒 AUTHENTICATION & AUTHORIZATION

### JWT Token Structure

**Access Token (15 minutes expiry):**
```json
{
  "userId": 123,
  "email": "user@example.com",
  "iat": 1713254400,
  "exp": 1713255300
}
```

**Refresh Token (7 days expiry):**
```json
{
  "userId": 123,
  "tokenId": "uuid-v4",
  "iat": 1713254400,
  "exp": 1713859200
}
```

### Auth Middleware

**File:** `apps/api/src/middleware/auth.ts`

```typescript
import { verify } from 'jose';
import type { Context, Next } from 'hono';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ 
      success: false, 
      error: { code: 'UNAUTHORIZED', message: 'Missing token' } 
    }, 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await verify(token, secret);
    
    // Attach userId to context
    c.set('userId', payload.userId as number);
    
    await next();
  } catch (err) {
    return c.json({ 
      success: false, 
      error: { code: 'UNAUTHORIZED', message: 'Invalid token' } 
    }, 401);
  }
}
```

---

## 📊 STANDARDIZED RESPONSE FORMAT

### Success Response
```typescript
{
  success: true,
  data: T,                  // Generic type
  meta?: {                  // Optional pagination
    page: number,
    limit: number,
    total: number,
    totalPages: number,
  }
}
```

### Error Response
```typescript
{
  success: false,
  error: {
    code: string,           // 'VALIDATION_ERROR', 'UNAUTHORIZED', etc.
    message: string,        // Human-readable message
    details?: Array<{       // Zod validation errors
      path: string[],
      message: string,
    }>,
  }
}
```

**Error Codes:**
- `VALIDATION_ERROR`: Input validation failed (400)
- `UNAUTHORIZED`: Missing/invalid token (401)
- `FORBIDDEN`: Insufficient permissions (403)
- `NOT_FOUND`: Resource not found (404)
- `CONFLICT`: Duplicate resource (409)
- `RATE_LIMIT`: Too many requests (429)
- `INTERNAL_ERROR`: Server error (500)

---

## 🛡️ SECURITY REQUIREMENTS

### 1. Rate Limiting
**Tool:** Upstash Redis + Hono rate-limit middleware

**Limits:**
- Auth endpoints: 5 req/min per IP
- Other endpoints: 100 req/min per userId

```typescript
// apps/api/src/middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
});

export async function rateLimitMiddleware(c: Context, next: Next) {
  const userId = c.get('userId');
  const { success } = await ratelimit.limit(userId.toString());
  
  if (!success) {
    return c.json({ 
      success: false, 
      error: { code: 'RATE_LIMIT', message: 'Too many requests' } 
    }, 429);
  }
  
  await next();
}
```

---

### 2. CORS Configuration
```typescript
// apps/api/src/index.ts
import { cors } from 'hono/cors';

app.use('*', cors({
  origin: process.env.CLIENT_URL!,  // https://app.s2s-finance.com
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

---

### 3. Input Validation (Zod)
**Example:** Create Transaction Schema

```typescript
// packages/shared-schemas/src/transaction.ts
import { z } from 'zod';

export const CreateTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  categoryId: z.number().int().positive().optional(),
  note: z.string().max(500).optional(),
  transactionDate: z.string().datetime().optional(),
});

export type CreateTransactionDTO = z.infer<typeof CreateTransactionSchema>;
```

**Usage in route:**
```typescript
import { zValidator } from '@hono/zod-validator';

app.post('/api/transactions', 
  authMiddleware,
  zValidator('json', CreateTransactionSchema),
  async (c) => {
    const data = c.req.valid('json');
    // data is typed as CreateTransactionDTO
  }
);
```

---

## 🗄️ BUSINESS LOGIC REQUIREMENTS

### 1. S2S Calculation Service
**File:** `apps/api/src/services/s2s-engine.ts`

**Function:** `calculateSafeToSpend(userId: number, month: string): Promise<S2SResult>`

**Logic:**
```
S2S = Total_Income - Actual_Expense - Fixed_Costs_Pending - Goals_Allocation - Emergency_Buffer

WHERE:
- Total_Income: SUM(transactions.amount WHERE type='income' AND month=X)
- Actual_Expense: SUM(transactions.amount WHERE type='expense' AND month=X)
- Fixed_Costs_Pending: SUM(bills.amount WHERE isActive=true AND NOT paid in month X)
- Goals_Allocation: SUM(goals.monthlyContribution WHERE status='active')
- Emergency_Buffer: user_settings.emergencyBuffer
```

**Reference:** `SYSTEM_ARCHITECTURE.md` lines 265-372

---

### 2. Bill Payment Generator
**File:** `apps/api/src/services/bill-service.ts`

**Function:** `generateBillPaymentsForMonth(month: string): Promise<void>`

**Trigger:** Vercel Cron Job (1st day of month)

**Logic:**
1. Get all active bills
2. Filter by frequency (monthly, quarterly, yearly)
3. Create `bill_payments` records với `status='pending'`

---

### 3. Goal Auto-Complete
**File:** `apps/api/src/services/goal-service.ts`

**Function:** `checkAndCompleteGoal(goalId: number, newSavedAmount: number): Promise<boolean>`

**Trigger:** PUT `/api/goals/:id` route

**Logic:**
1. If `newSavedAmount >= targetAmount`:
   - Set `status='completed'`
   - Set `completedAt=NOW()`
   - Create notification (type='goal_completed')

---

## 📦 DEPENDENCIES

### Hono.js App
```json
{
  "hono": "^4.0.0",
  "@hono/zod-validator": "^0.2.0",
  "jose": "^5.0.0",
  "@upstash/ratelimit": "^1.0.0",
  "@upstash/redis": "^1.0.0"
}
```

### Database
```json
{
  "drizzle-orm": "^0.30.0",
  "@tidbcloud/serverless": "^0.1.0",
  "drizzle-kit": "^0.21.0"
}
```

### Validation
```json
{
  "zod": "^3.0.0",
  "@finance/shared-schemas": "workspace:*"
}
```

---

## 🚀 DEPLOYMENT (Vercel Edge Functions)

### vercel.json
```json
{
  "functions": {
    "src/index.ts": {
      "runtime": "edge"
    }
  },
  "routes": [
    { "src": "/api/(.*)", "dest": "src/index.ts" }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "JWT_SECRET": "@jwt-secret",
    "OPENAI_API_KEY": "@openai-api-key",
    "CLIENT_URL": "https://app.s2s-finance.com"
  }
}
```

---

## ✅ CHECKLIST

### Phase 1: Core API
- [ ] Setup Hono.js project
- [ ] Setup Drizzle ORM + TiDB connection
- [ ] Create auth routes (login, register, refresh)
- [ ] Create JWT middleware
- [ ] Create error handler middleware

### Phase 2: Finance API
- [ ] Create S2S calculation service
- [ ] Create `/api/finance/safe-to-spend` endpoint
- [ ] Create `/api/finance/check-impact` endpoint

### Phase 3: CRUD APIs
- [ ] Create transactions CRUD
- [ ] Create categories CRUD
- [ ] Create goals CRUD
- [ ] Create bills CRUD

### Phase 4: Advanced Features
- [ ] Implement NLP quick-add (OpenAI)
- [ ] Implement cash wallet sync
- [ ] Implement analytics endpoints
- [ ] Implement notifications

### Phase 5: Infrastructure
- [ ] Setup rate limiting (Upstash Redis)
- [ ] Setup CORS
- [ ] Setup Zod validation
- [ ] Setup Vercel Cron Jobs (bill reminders)

### Phase 6: Testing
- [ ] Unit tests (services)
- [ ] Integration tests (routes)
- [ ] Load testing (rate limits)

---

**Status:** 🔴 Not Started  
**Owner:** Backend Team  
**Deadline:** TBD
