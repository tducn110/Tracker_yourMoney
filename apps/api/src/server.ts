import "./env.ts"; // Load env vars first!
import { serve } from "@hono/node-server";
import app from "./index.ts";

import { logger } from "./lib/logger";

const port = 8787;

logger.info({ event: 'SERVER_STARTUP', message: `Finance API (Node Fallback) is running on http://localhost:${port}`, port });

serve({
  fetch: app.fetch,
  port
});
