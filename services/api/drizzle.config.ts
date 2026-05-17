import "dotenv/config";

import { defineConfig } from "drizzle-kit";

// WHY: drizzle-kit generate reads schema files only and never opens a DB
// connection, so DATABASE_URL need not be set for that command. Commands that
// do open a connection (db:migrate, db:studio) are guarded in their own entry
// points (src/db/migrate.ts, src/db/client.ts).
const databaseUrl = process.env["DATABASE_URL"] ?? "";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
