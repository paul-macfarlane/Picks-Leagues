import "dotenv/config";

import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { migrate as migrateNeon } from "drizzle-orm/neon-serverless/migrator";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { migrate as migrateNodePg } from "drizzle-orm/node-postgres/migrator";
import { Pool as PgPool } from "pg";
import ws from "ws";

import { isLocalDatabaseUrl } from "./is-local-db.js";

const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) {
  console.error(
    "DATABASE_URL is not set. Copy services/api/.env.example to services/api/.env and set a connection string (local Docker Postgres or a Neon branch).",
  );
  process.exit(1);
}

const MIGRATIONS_FOLDER = "./src/db/migrations";

// WHY: mirror client.ts — local Docker Postgres uses the node-postgres
// migrator, Neon uses the WebSocket pooled migrator. Same committed migrations
// run against either target.
async function runMigrations(connectionString: string): Promise<void> {
  if (isLocalDatabaseUrl(connectionString)) {
    const pool = new PgPool({ connectionString });
    try {
      await migrateNodePg(drizzleNodePg(pool), {
        migrationsFolder: MIGRATIONS_FOLDER,
      });
    } finally {
      await pool.end();
    }
  } else {
    neonConfig.webSocketConstructor = ws;
    const pool = new NeonPool({ connectionString });
    try {
      await migrateNeon(drizzleNeon(pool), {
        migrationsFolder: MIGRATIONS_FOLDER,
      });
    } finally {
      await pool.end();
    }
  }
  console.log("Migrations applied successfully.");
}

await runMigrations(databaseUrl);
