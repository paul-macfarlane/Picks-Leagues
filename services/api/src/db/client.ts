import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import * as schema from "./schema/index.js";

// WHY: Node serverless has no native WebSocket; neonConfig requires one to use
// the pooled driver, which in turn enables interactive transactions. This must
// not be swapped for neonConfig.fetchConnectionCache (the HTTP driver) — the
// HTTP driver does not support db.transaction().
neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Copy services/api/.env.example to services/api/.env and set a Neon connection string.",
  );
}

const pool = new Pool({ connectionString: databaseUrl });

export const db = drizzle(pool, { schema });
