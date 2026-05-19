'use client';

import dynamic from 'next/dynamic';

/**
 * Client-side loader for GoogleAnalytics.
 * Uses dynamic import to avoid SSR — the GA script is only injected
 * in the browser, preventing `useEffect` crashes during static
 * prerendering of pages like /_not-found.
 */
const GoogleAnalytics = dynamic(
  () => import('./GoogleAnalytics').then((m) => ({ default: m.GoogleAnalytics })),
  { ssr: false },
);

export function GoogleAnalyticsLoader() {
  return <GoogleAnalytics />;
}
