import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
const tracesSampleRate = Number(
  process.env.SENTRY_TRACES_SAMPLE_RATE ??
  (process.env.NODE_ENV === 'production' ? '0.1' : '0')
);

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate,
  });
}
