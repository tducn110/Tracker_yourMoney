import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ── ENVIRONMENT INITIALIZATION ──────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '../../../');

if (process.env.NODE_ENV !== 'production') {
  const envPath = path.join(rootPath, '.env');
  const envLocalPath = path.join(rootPath, '.env.local');

  dotenv.config({ path: envPath, override: true });
  dotenv.config({ path: envLocalPath, override: true });
}

// ── INSTRUMENTATION ──────────────────────────────────────────────────
// Only load Sentry in Node.js fallback if DSN is present.
// For Cloudflare Workers, use @sentry/cloudflare middleware if needed.
if (process.env.SENTRY_DSN) {
  await import('./instrument');
}

// ── GLOBAL POLYFILLS ───────────────────────────────────────────────
// Support BigInt serialization in JSON.stringify (required for TiDB IDs)
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// ── CORE IMPORTS ────────────────────────────────────────────────────
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { db } from '@finance/db';
import type { Context } from 'hono';

import { logger, logRequest, logError } from './lib/logger';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { authMiddleware } from './middleware/auth-guard';

import { authRoutes } from './routes/auth';
import { internalRoutes } from './routes/internal';
import { walletRoutes } from './routes/wallet';
import { analyticsRoutes } from './routes/analytics';
import { transactionRoutes } from './routes/transactions';
import { billRoutes } from './routes/bills';
import { categoryRoutes } from './routes/categories';
import { goalRoutes } from './routes/goals';
import { budgetRoutes } from './routes/budgets';

// ── TYPE DEFINITIONS ───────────────────────────────────────────────
type Variables = {
  correlationId: string;
  userId: string;
  userEmail: string;
};

const app = new Hono<{ Variables: Variables }>();

// ── GLOBAL MIDDLEWARES ──────────────────────────────────────────────
app.use('*', cors({
  origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-correlation-id', 'Idempotency-Key', 'x-e2e-secret'],
}));

// Structured Logging & Correlation ID
app.use('*', async (c, next) => {
  const correlationId = c.req.header('x-correlation-id') || crypto.randomUUID();
  c.set('correlationId', correlationId);
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

// Quick Add Rate Limit: 10 req/min per IP applies to the /transactions/quick endpoint
v1.use('/transactions/quick', rateLimitMiddleware({ limit: 10, windowMs: 60_000 }));

v1.use('/*', authMiddleware);

v1.route('/wallet', walletRoutes);
v1.route('/analytics', analyticsRoutes);
v1.route('/transactions', transactionRoutes);
v1.route('/bills', billRoutes);
v1.route('/categories', categoryRoutes);
v1.route('/goals', goalRoutes);
v1.route('/budgets', budgetRoutes);

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

app.route('/api/auth', authRoutes);
app.route('/api/v1', v1);

if (process.env.NODE_ENV === 'test') {
  app.route('/api/internal', internalRoutes);
}


app.get('/', (c) => c.text('API is running'));
app.get('/ping', (c) => c.text('pong'));

app.get('/debug-sentry', () => {
  throw new Error('My first Sentry error!');
});

// ── GLOBAL ERROR HANDLER ───────────────────────────────────────────
app.onError((err, c) => {
  const correlationId = c.get('correlationId');
  const errorMessage = err.message || '';

  const isDuplicate = errorMessage.includes('ER_DUP_ENTRY') || 
                     errorMessage.includes('Duplicate entry') || 
                     (err as any).code === 'ER_DUP_ENTRY';

  if (isDuplicate) {
    return c.json({
      error: { code: 'conflict_idempotency', message: 'Giao dịch này đã tồn tại.', correlationId }
    }, 409);
  }

  logError(err, c.req.path, c.req.method, correlationId);
  return c.json({
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
