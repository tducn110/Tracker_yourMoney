'use client';

// Google Analytics 4 type helpers

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ??
  '';

type DebugEntry = {
  ts: number;
  kind: 'pageview' | 'event';
  payload: Record<string, unknown>;
};

const DEBUG_STORAGE_KEY = 'ga_debug_events_v1';

function isDebugEnabled() {
  if (process.env.NEXT_PUBLIC_GA_DEBUG === '1') return true;
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem('ga_debug') === '1';
}

function readDebugEvents(): DebugEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(DEBUG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DebugEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDebugEvents(events: DebugEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(events.slice(-80)));
  } catch {
    // Ignore storage failures in private mode.
  }
}

function recordDebug(entry: DebugEntry) {
  if (!isDebugEnabled()) return;
  const current = readDebugEvents();
  current.push(entry);
  writeDebugEvents(current);
}

export function getDebugEvents() {
  return readDebugEvents();
}

export function clearDebugEvents() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DEBUG_STORAGE_KEY);
}

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
  const debug_mode = isDebugEnabled();
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    ...(debug_mode ? { debug_mode: true } : {}),
  });

  recordDebug({
    ts: Date.now(),
    kind: 'pageview',
    payload: { page_path: url, measurementId: GA_MEASUREMENT_ID, debug_mode },
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
    typeof window.gtag !== 'function' ||
    !GA_MEASUREMENT_ID
  ) {
    return;
  }
  const debug_mode = isDebugEnabled();
  const finalParams = {
    ...(params ?? {}),
    ...(debug_mode ? { debug_mode: true } : {}),
  };
  window.gtag('event', action, finalParams);

  recordDebug({
    ts: Date.now(),
    kind: 'event',
    payload: { action, params: finalParams, measurementId: GA_MEASUREMENT_ID, debug_mode },
  });
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
