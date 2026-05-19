import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const tracesSampleRate = Number(
  process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ??
  (process.env.NODE_ENV === 'production' ? '0.1' : '0')
);
const replaysSessionSampleRate = Number(
  process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ??
  (process.env.NODE_ENV === 'production' ? '0.05' : '0')
);

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate,
    replaysSessionSampleRate,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
      }),
    ],
  });
}
