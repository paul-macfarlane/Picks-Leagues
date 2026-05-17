import "dotenv/config";

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import ws from "ws";

// WHY: Node serverless has no native WebSocket; neonConfig requires one to use
// the pooled driver, which in turn enables interactive transactions.
neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) {
  console.error(
    "DATABASE_URL is not set. Copy services/api/.env.example to services/api/.env and set a Neon connection string.",
  );
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

async function runMigrations(): Promise<void> {
  const db = drizzle(pool);
  try {
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("Migrations applied successfully.");
  } finally {
    await pool.end();
  }
}

await runMigrations();
