// apps/api/src/middleware/security-headers.ts
// Security headers middleware (OWASP recommended)
import { createMiddleware } from "hono/factory";

export const securityHeaders = createMiddleware(async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  // Safe environment check
  const isDevelopment = (c.env as any)?.NODE_ENV === "development";
  if (!isDevelopment) {
    c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  
  await next();
});
