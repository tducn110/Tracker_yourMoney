'use client';

// Google Analytics 4 type helpers

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

/**
 * Track a pageview manually. Next.js <Script> with gtag loads config
 * automatically — this is for SPAs where route changes don't refresh the page.
 */
export function pageview(url: string) {
  if (
    typeof window === 'undefined' ||
    typeof window.gtag !== 'function'
  ) {
    return;
  }
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

/**
 * Track a custom event.
 */
export function event(
  action: string,
  params?: Record<string, string | number | boolean>,
) {
  if (
    typeof window === 'undefined' ||
    typeof window.gtag !== 'function'
  ) {
    return;
  }
  window.gtag('event', action, params);
}

// Extend Window so TypeScript knows about gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string,
      config?: Record<string, unknown>,
    ) => void;
  }
}
