import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  compress: true,
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    return [
      ...(isDev ? [] : [
        { source: '/_next/static/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
        { source: '/fonts/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      ]),
      { source: '/images/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' }] },
    ];
  },
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];
    return [{ source: '/api/:path*', destination: 'http://localhost:3001/api/:path*' }];
  },
  env: { CUSTOM_KEY: process.env.CUSTOM_KEY },
  typescript: { ignoreBuildErrors: true },
  transpilePackages: ['@finance/db', '@finance/shared-schemas', '@finance/api-client', '@finance/api'],
  experimental: {
    optimizePackageImports: ['@finance/db', '@finance/shared-schemas', '@finance/api-client'],
  },
};

export default withSentryConfig(nextConfig, {
  org: "pro-ej",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: true,
    treeshake: { removeDebugLogging: true },
  },
});
