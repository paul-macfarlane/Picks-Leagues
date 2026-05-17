# Picks Leagues API

Hono on Vercel Node serverless, Drizzle + Postgres.

## Database setup

Two ways to run: **local Docker Postgres** (recommended for day-to-day
development) or a **Neon branch** (used by preview/production; Neon project
provisioning is deferred to FND-005/FND-014).

`db:generate` requires no DB connection and works regardless.

### Driver note

The driver is selected automatically from the `DATABASE_URL` host — you never
change code to switch targets:

- **Local** (`localhost`/Docker): `drizzle-orm/node-postgres` against stock
  Postgres 17.
- **Neon** (dev/preview/prod): the Neon serverless **WebSocket pooled** driver
  (`drizzle-orm/neon-serverless` + `Pool` from `@neondatabase/serverless`). The
  Neon WebSocket driver speaks Neon's proxy protocol and cannot talk to a plain
  Postgres server, which is why local dev uses node-postgres.

Both drivers support interactive `db.transaction()`. The HTTP driver
(`neon-http`) does not and must not be used. See
[docs/code-standards.md](../../docs/code-standards.md) § Database → Transactions
for the enforced transaction discipline.

### Local development with Docker (recommended)

Requires Docker. From the repo root:

```sh
docker compose up -d                      # start Postgres 17
cp services/api/.env.example services/api/.env   # default points at local DB
pnpm --filter @picksleagues/api db:migrate       # apply migrations
```

The default `DATABASE_URL` in `.env.example` already targets the local
container (`postgresql://postgres:postgres@localhost:5432/picksleagues`), so no
edits are needed.

Stop it with `docker compose down`. Add `-v` to also delete the data volume
(`picksleagues-pgdata`) for a clean slate:

```sh
docker compose down        # stop, keep data
docker compose down -v     # stop, wipe the database
```

### Using a Neon branch instead

```sh
cp services/api/.env.example services/api/.env
```

Replace `DATABASE_URL` in `services/api/.env` with the pooled connection string
from the Neon dashboard for your branch. Everything below works the same.

### Regenerate migrations after a schema change

```sh
pnpm --filter @picksleagues/api db:generate
```

Reads the schema files in `src/db/schema/`, diffs against the committed
migrations, and emits a new SQL file into `src/db/migrations/`. No DB
connection required. Commit the generated files alongside the schema change.

### Apply migrations

```sh
pnpm --filter @picksleagues/api db:migrate
```

Requires `DATABASE_URL`. Runs all pending migrations in order against whatever
the connection string points at (local Docker or Neon).

### Open Drizzle Studio

```sh
pnpm --filter @picksleagues/api db:studio
```

Requires `DATABASE_URL`. Opens a browser-based GUI for inspecting the database.

### Migration hygiene

Migrations are generated, reviewed, and committed alongside the schema change.
Never edit a migration that has already run in production — add a new one
instead.
