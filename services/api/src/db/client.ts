import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import {
  drizzle as drizzleNeon,
  type NeonDatabase,
} from "drizzle-orm/neon-serverless";
import {
  drizzle as drizzleNodePg,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { Pool as PgPool } from "pg";
import ws from "ws";

import { isLocalDatabaseUrl } from "./is-local-db.js";
import * as schema from "./schema/index.js";

// Either driver satisfies the same query/transaction API. Both support
// interactive db.transaction(); the transaction discipline in
// docs/code-standards.md § Database → Transactions applies to both.
export type Db = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Copy services/api/.env.example to services/api/.env and set a connection string (local Docker Postgres or a Neon branch).",
  );
}

// WHY: the Neon serverless WebSocket driver speaks Neon's proxy protocol and
// cannot talk to a plain Postgres server. Local development runs stock
// Postgres 17 in Docker (node-postgres driver). Neon dev/preview/prod use the
// WebSocket pooled driver — the driver the transaction discipline in
// docs/code-standards.md is written against. Selection is by DATABASE_URL host
// so switching targets is config-only, never a code change. Do not collapse
// this to the HTTP driver (neon-http) — it does not support db.transaction().
function createDb(connectionString: string): Db {
  if (isLocalDatabaseUrl(connectionString)) {
    return drizzleNodePg(new PgPool({ connectionString }), { schema });
  }
  neonConfig.webSocketConstructor = ws;
  return drizzleNeon(new NeonPool({ connectionString }), { schema });
}

export const db: Db = createDb(databaseUrl);
