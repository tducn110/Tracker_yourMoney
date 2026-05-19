'use client';

import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

/**
 * Google Analytics 4 — using @next/third-parties/google.
 * Only renders when GA_ID is set.
 * Loaded lazily via GoogleAnalyticsLoader (ssr: false).
 */
export function GoogleAnalytics() {
  if (!GA_ID) {
    return null;
  }

  return <NextGoogleAnalytics gaId={GA_ID} />;
}
