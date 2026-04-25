import * as Sentry from "@sentry/node";

// Ensure to call this before requiring any other modules!
Sentry.init({
  dsn: "https://a7f4701b77f3647cba0fe59be6dd99d3@o4511248082403328.ingest.de.sentry.io/4511248102588496",

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/hono/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
