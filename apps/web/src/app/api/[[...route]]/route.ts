/**
 * Next.js catch-all API route — delegates ALL /api/* requests to the Hono app.
 *
 * This is the Vercel deployment strategy: instead of a separate backend server,
 * the Hono app is embedded directly into Next.js and served as a serverless function.
 *
 * Local dev still uses the separate Hono server on localhost:3001 (via next.config.ts
 * rewrites), so this file is only active on Vercel.
 *
 * @see https://hono.dev/docs/getting-started/vercel
 */
import { handle } from 'hono/vercel';
import app from '@finance/api';

// Run as Node.js serverless function (not Edge) — required for:
// - firebase-admin (Node.js only)
// - pino logger
// - @hono/node-server compatibility
export const runtime = 'nodejs';

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
