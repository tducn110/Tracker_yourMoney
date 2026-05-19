/**
 * Client instrumentation for Sentry.
 * Init moved to sentry.client.config.ts — this file only exports
 * the router transition hook so Sentry tracks page navigation.
 */
import * as Sentry from '@sentry/nextjs';

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
