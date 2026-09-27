// packages/db/drizzle.config.ts
import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import * as path from "path";

// Load from root — try .env.local first (overrides), fall back to .env
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export default {
  schema: "./src/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
