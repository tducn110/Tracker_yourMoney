import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root — try .env.local first, fall back to .env
const rootPath = path.resolve(__dirname, "../../../../");
dotenv.config({ path: path.join(rootPath, ".env.local") });
dotenv.config({ path: path.join(rootPath, ".env") });

async function check() {
  const { db, users } = await import("../index");
  const { count } = await import("drizzle-orm");
  const typedDb = db as any; // Temporary any to bypass the union type issues in this small script
  
  try {
    const [result] = await typedDb.select({ value: count() }).from(users);
    console.log("✅ Database is reachable.");
    console.log(`📊 Total Users: ${result.value}`);
  } catch (err) {
    console.error("❌ Database Error:", err);
  }
  process.exit(0);
}

check();
