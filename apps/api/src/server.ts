import "./env.ts"; // Load env vars first!
import { serve } from "@hono/node-server";
import app from "./index.ts";

const port = 8787;

console.log(`🚀 S2S API (Node Fallback) is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
