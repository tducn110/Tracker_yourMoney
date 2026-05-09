import './env';
// ── INSTRUMENTATION ──────────────────────────────────────────────────
// Only load Sentry in Node.js fallback if DSN is present.
// For Cloudflare Workers, use @sentry/cloudflare middleware if needed.
if (process.env.SENTRY_DSN) {
  import('./instrument').catch(() => {});
}

// ── GLOBAL POLYFILLS ───────────────────────────────────────────────
// Support BigInt serialization in JSON.stringify (required for PostgreSQL bigint IDs)
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// ── CORE IMPORTS ────────────────────────────────────────────────────
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { compress } from 'hono/compress';
import { db } from '@finance/db';
import type { Context } from 'hono';

import { logger, logRequest, logError } from './lib/logger';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { authMiddleware } from './middleware/auth-guard';
import { auditMiddleware } from './middleware/audit';
import { AppError } from './lib/errors';

import { authRoutes } from './routes/auth';
import { internalRoutes } from './routes/internal';
import { walletRoutes } from './routes/wallet';
import { analyticsRoutes } from './routes/analytics';
import { transactionRoutes } from './routes/transactions';
import { billRoutes } from './routes/bills';
import { categoryRoutes } from './routes/categories';
import { goalRoutes } from './routes/goals';
import { budgetRoutes } from './routes/budgets';
import { userRoutes } from './routes/user';
import { notificationRoutes } from './routes/notifications';

// ── TYPE DEFINITIONS ───────────────────────────────────────────────
type Variables = {
  correlationId: string;
  userId: string;
  userEmail: string;
};

const app = new Hono<{ Variables: Variables }>();

// Helper for correlation ID (portable across Node.js versions)
const getCorrelationId = (c: Context) => {
  const fromHeader = c.req.header('x-correlation-id');
  if (fromHeader) return fromHeader;
  
  // Try global crypto (standard in Node 20+, available in Node 18)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback
    }
  }
  
  // Generic fallback for older environments
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// ── GLOBAL MIDDLEWARES ──────────────────────────────────────────────
// Payload Compression (Phase 29) — gzip/deflate for JSON responses >1KB
app.use('*', compress({ threshold: 1024 }));

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return 'http://localhost:3000';
    if (
      origin === 'http://127.0.0.1:3000' ||
      origin === 'http://localhost:3000' ||
      origin.endsWith('.vercel.app')
    ) {
      return origin;
    }
    return 'http://localhost:3000';
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-correlation-id', 'Idempotency-Key', 'x-e2e-secret'],
}));

// Structured Logging & Correlation ID
app.use('*', async (c, next) => {
  const correlationId = getCorrelationId(c);
  c.set('correlationId', correlationId);
  c.header('x-correlation-id', correlationId); // Echo back for debugging
  c.header('x-hono-matched', 'true'); // Verify Hono is hit
  const start = Date.now();

  logRequest('API_REQUEST_START', c.req.path, c.req.method, correlationId);
  await next();

  const durationMs = Date.now() - start;
  const status = c.res.status;
  const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

  logger[logLevel]({
    event: 'API_REQUEST_END',
    path: c.req.path,
    method: c.req.method,
    status,
    correlationId,
    durationMs,
  });
});

// ── API V1 ROUTES ──────────────────────────────────────────────────
const v1 = new Hono<{ Variables: Variables }>();

// Rate Limiting (Phase 9) — sliding window, in-memory, per IP+path
// Global: 100 req/min per IP across all v1 endpoints
v1.use('*', rateLimitMiddleware({ limit: 100, windowMs: 60_000 }));
// Quick Add: 10 req/min (NLP parsing is the most expensive endpoint)
v1.use('/transactions/quick', rateLimitMiddleware({ limit: 10, windowMs: 60_000 }));

// Authentication Guard (Phase 13) — apply to all business logic routes
v1.use('*', authMiddleware);

// Audit Logging (Phase 24) — records all financial mutations (non-GET)
v1.use('*', auditMiddleware);

// Feature Route Modules
v1.route('/wallet', walletRoutes);
v1.route('/analytics', analyticsRoutes);
v1.route('/transactions', transactionRoutes);
v1.route('/bills', billRoutes);
v1.route('/categories', categoryRoutes);
v1.route('/goals', goalRoutes);
v1.route('/budgets', budgetRoutes);
v1.route('/user', userRoutes);
v1.route('/notifications', notificationRoutes);

v1.get('/health', (c) => {
  return c.json({
    data: { 
      status: 'healthy', 
      database: 'connected', 
      timestamp: new Date().toISOString(),
      version: 'v4.0.0-purified'
    }
  });
});

// ── API ROUTES DEFINITION ──────────────────────────────────────────
const apiRouter = new Hono<{ Variables: Variables }>();

// Health check and root route
apiRouter.get('/', (c) => c.text('S2S Finance API v1.0.0 is running'));
apiRouter.get('/ping', (c) => c.text('pong'));

// Auth routes — strict rate limit for brute force protection (30 req/min per IP)
apiRouter.use('/auth/*', rateLimitMiddleware({ limit: 30, windowMs: 60_000 }));
apiRouter.route('/auth', authRoutes);

// V1 Business Logic
apiRouter.route('/v1', v1);

if (process.env.NODE_ENV === 'test') {
  apiRouter.route('/internal', internalRoutes);
}

// ── MOUNT ROUTES ──────────────────────────────────────────────────
// Mount under /api to support Next.js rewrites and explicit calls
app.route('/api', apiRouter);

// ALSO mount under / to handle cases where the environment (like hono/vercel)
// might be passing a path that already has /api stripped by Next.js routing.
app.route('/', apiRouter);

// ── ERROR HANDLING ────────────────────────────────────────────────
// Catch-all 404 for API paths to return JSON instead of Next.js HTML
app.notFound((c) => {
  logger.warn({ event: 'API_404', path: c.req.path, method: c.req.method });
  return c.json({ 
    success: false,
    error: { 
      code: 'not_found', 
      message: `Endpoint not found: ${c.req.method} ${c.req.path}` 
    } 
  }, 404);
});

// Standardize error responses
app.onError((err, c) => {
  const correlationId = c.get('correlationId');
  const errorMessage = err.message || '';

  const isDuplicate = errorMessage.includes('ER_DUP_ENTRY') || 
                     errorMessage.includes('Duplicate entry') || 
                     (err as any).code === 'ER_DUP_ENTRY' ||
                     (err as any).code === '23505';

  if (err instanceof AppError) {
    return c.json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details, correlationId }
    }, err.status as any);
  }

  if (isDuplicate) {
    return c.json({
      success: false,
      error: { code: 'conflict_idempotency', message: 'Giao dịch này đã tồn tại.', correlationId }
    }, 409);
  }

  logError(err, c.req.path, c.req.method, correlationId);
  return c.json({
    success: false,
    error: { 
      code: 'internal_server_error', 
      message: process.env.NODE_ENV !== 'production' ? err.message : 'Có lỗi xảy ra.',
      correlationId 
    }
  }, 500);
});

// ── SERVER LIFECYCLE ──────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const port = Number(process.env.PORT) || 3001;
  const server = serve({ fetch: app.fetch, port }, (info) => {
    logger.info({ event: 'SERVER_READY', port: info.port });
  });

  const shutdown = (signal: string) => {
    server.close(() => {
      logger.info({ event: 'SERVER_SHUTDOWN_COMPLETE', signal });
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

export default app;
