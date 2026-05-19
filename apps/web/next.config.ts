import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // ── Image Optimization (Phase 28) ────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // ── Compression (Phase 28) ───────────────────────────────────────────
  compress: true, // enable gzip/brotli via Next.js built-in

  // ── Cache Headers for Static Assets (Phase 28) ───────────────────────
  // NOTE: Do NOT set immutable cache on /_next/static/ in development —
  // it causes "module factory not available" errors after server restarts
  // because the browser serves stale chunks with old hashes.
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    return [
      ...(isDev ? [] : [
        {
          source: '/_next/static/(.*)',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ],
        },
        {
          source: '/fonts/(.*)',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ],
        },
      ]),
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' },
        ],
      },
    ];
  },

  // ── API Rewrites ─────────────────────────────────────────────────────
  // In development: proxy /api/* to the separate Hono dev server (localhost:3001).
  // In production (Vercel): /api/* is handled by the catch-all route at
  //   src/app/api/[[...route]]/route.ts which embeds the Hono app directly.
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // @finance/api is included so Next.js transpiles the Hono app for the
  // catch-all serverless route on Vercel.
  transpilePackages: ['@finance/db', '@finance/shared-schemas', '@finance/api-client', '@finance/api'],
  // Next.js 16.2.x + pnpm monorepo workarounds for "module factory is not available"
  experimental: {
    optimizePackageImports: ['@finance/db', '@finance/shared-schemas', '@finance/api-client'],
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "pro-ej",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
