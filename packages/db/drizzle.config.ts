// packages/db/drizzle.config.ts
import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import * as path from "path";

// Load from root .env.local
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

export default {
  schema: "./src/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
