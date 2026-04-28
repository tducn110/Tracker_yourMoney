import * as Sentry from "@sentry/node";

// Ensure to call this before requiring any other modules!
const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
  });
}
