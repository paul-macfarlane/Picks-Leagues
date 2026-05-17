# Picks Leagues API

Hono on Vercel Node serverless, Drizzle + Neon Postgres.

## Database setup

> Neon is not yet provisioned (deferred to FND-005/FND-014). The instructions
> below are the procedure for when it is. Running `db:generate` works now —
> it requires no DB connection.

### Prerequisites

- A [Neon](https://neon.tech) project with a dev branch.
- The pooled connection string from the Neon dashboard for that branch.

### Driver note

The app uses the Neon serverless **WebSocket pooled** driver
(`drizzle-orm/neon-serverless` + `Pool` from `@neondatabase/serverless`) so
that `db.transaction()` — interactive transactions — work in the Vercel Node
serverless runtime. The HTTP driver (`neon-http`) does not support interactive
transactions. See [docs/code-standards.md](../../docs/code-standards.md)
§ Database → Transactions for the enforced transaction discipline.

### 1. Configure your environment

```sh
cp services/api/.env.example services/api/.env
```

Open `services/api/.env` and paste your Neon pooled connection string into
`DATABASE_URL`.

### 2. Regenerate migrations after a schema change

```sh
pnpm --filter @picksleagues/api db:generate
```

This reads the schema files in `src/db/schema/`, diffs against the committed
migrations, and emits a new SQL file into `src/db/migrations/`. No DB
connection required. Commit the generated files alongside the schema change.

### 3. Apply migrations to the branch

```sh
pnpm --filter @picksleagues/api db:migrate
```

Requires `DATABASE_URL`. Runs all pending migrations in order against the
configured Neon branch.

### 4. Open Drizzle Studio

```sh
pnpm --filter @picksleagues/api db:studio
```

Requires `DATABASE_URL`. Opens a browser-based GUI for inspecting the database.

### Migration hygiene

Migrations are generated, reviewed, and committed alongside the schema change.
Never edit a migration that has already run in production — add a new one
instead.
