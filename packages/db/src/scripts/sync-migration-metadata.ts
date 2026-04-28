import mysql from "mysql2/promise";
import path from "path";
import * as dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

// ── ROBUST PATHING ───────────────────────────────────────────────────
// Ensures script works from any directory in the monorepo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from workspace root
const rootPath = path.resolve(__dirname, "../../../../");
dotenv.config({ path: path.join(rootPath, ".env.local") });
dotenv.config({ path: path.join(rootPath, ".env") });

/**
 * Dynamically extract migration hashes and timestamps from filesystem.
 * Implements normalization to ensure cross-platform (Win/Linux) hash consistency.
 */
function getMigrations() {
  const migrationsDir = path.resolve(__dirname, "../../drizzle/migrations");
  const journalPath = path.join(migrationsDir, "meta/_journal.json");

  let entries: { sqlFile: string; timestamp: number }[] = [];

  // Primary Source: _journal.json (standard Drizzle behavior)
  if (fs.existsSync(journalPath)) {
    try {
      const journalStr = fs.readFileSync(journalPath, "utf8");
      const journal = JSON.parse(journalStr);
      entries = journal.entries.map((e: any) => ({
        sqlFile: `${e.tag}.sql`,
        timestamp: e.when,
      }));
    } catch (err) {
      process.stderr.write("⚠️ Warning: Could not parse _journal.json. Falling back to directory scan.\n");
    }
  }

  // Fallback: Scan directory for SQL files if journal is missing/corrupt
  if (entries.length === 0) {
    entries = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()
      .map((file) => ({
        sqlFile: file,
        timestamp: Math.floor(fs.statSync(path.join(migrationsDir, file)).mtimeMs),
      }));
  }

  return entries.map((entry) => {
    const filePath = path.join(migrationsDir, entry.sqlFile);
    
    // Integrity Check 1: File Existence
    if (!fs.existsSync(filePath)) {
      throw new Error(`Critical Integrity Failure: Migration file listed in journal not found on disk: "${entry.sqlFile}"`);
    }

    const stats = fs.statSync(filePath);
    // Integrity Check 2: Empty File Detection
    if (stats.size === 0) {
      process.stderr.write(`⚠️ Warning: Migration file "${entry.sqlFile}" is empty. This is acceptable but unusual.\n`);
    }

    // Force UTF-8 (No BOM) and normalize line endings to LF
    const content = fs.readFileSync(filePath, "utf8");
    const normalizedContent = content.replace(/\r\n/g, "\n");
    const hash = crypto.createHash("sha256").update(normalizedContent).digest("hex");

    return { hash, timestamp: entry.timestamp };
  });
}

async function syncMetadata() {
  const isProduction = process.env.NODE_ENV === "production";
  const force = process.argv.includes("--force");

  process.stdout.write("--- 👣 STARTING MIGRATION METADATA SYNCHRONIZATION ---\n");

  if (isProduction && !force) {
    process.stderr.write("❌ FATAL: Synchronization blocked on Production environment.\n");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    process.stderr.write("❌ FATAL: DATABASE_URL not found in environment.\n");
    process.exit(1);
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    const [rows] = await connection.query<mysql.RowDataPacket[]>("SHOW TABLES LIKE \"__drizzle_migrations\"");
    
    if (rows.length === 0) {
      process.stdout.write("⚠️ Infrastructure Warning: __drizzle_migrations table does not exist. Initializing...\n");
      // Use backticks for table name in SQL to support reserved words/special chars
      await connection.query("CREATE TABLE `__drizzle_migrations` (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, hash TEXT NOT NULL, created_at BIGINT NOT NULL) ENGINE=InnoDB");
    }

    const migrations = getMigrations();
    process.stdout.write(`📦 Found ${migrations.length} migrations in directory.\n`);

    await connection.query("TRUNCATE TABLE `__drizzle_migrations` ");
    for (const entry of migrations) {
      await connection.query("INSERT INTO `__drizzle_migrations` (hash, created_at) VALUES (?, ?)", [entry.hash, entry.timestamp]);
    }

    process.stdout.write("--- ✅ METADATA SYNCHRONIZATION SUCCESSFUL ---\n");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    process.stderr.write("❌ CRITICAL FAILURE: " + errorMessage + "\n");
    process.exit(1);
  } finally {
    await connection.end();
  }
}

syncMetadata();

