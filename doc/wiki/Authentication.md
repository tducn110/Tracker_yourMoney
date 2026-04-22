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