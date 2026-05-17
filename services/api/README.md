# Picks Leagues API

Hono on Vercel Node serverless, Drizzle + Postgres.

## API server

### Running locally

```sh
pnpm --filter @picksleagues/api dev
```

Starts `@hono/node-server` on `http://localhost:3000` (or `$PORT` if set).

### Health endpoint

```
GET /api/health
→ { "status": "ok", "time": "<iso8601-utc>" }
```

`time` is the server clock at the moment of the request via `clock.now()`.

### Vercel entry

`services/api/api/index.ts` is the Vercel Node serverless entry. It exports
`handle(app)` from `hono/vercel`. All deploy config (`vercel.json`, routing
rewrites, env var wiring) is owned by **FND-012** — the entry file here is
self-contained and typechecked but not yet deploy-wired.

## OpenAPI spec

The API exposes a machine-readable OpenAPI 3.0 document at `GET /api/openapi.json`.
The spec is generated live from route definitions — there is no separate build step.

### Fetching the spec

While the dev server is running:

```sh
curl http://localhost:3000/api/openapi.json
```

FND-008's `pnpm gen:api` consumes this endpoint to emit the typed client for `apps/web`.

### Convention for new routes

New routes **must** be declared with `createRoute` and `OpenAPIHono.openapi()` (from
`@hono/zod-openapi`) so they appear in the generated spec. Plain `Hono` routes are invisible
to the spec generator.

```ts
// src/routes/my-route.ts
import { createRoute, z } from "@hono/zod-openapi";
import { createOpenApiApp } from "../lib/openapi";

const MyResponseSchema = z.object({ ... }).openapi("MyResponse");

const myRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      description: "...",
      content: { "application/json": { schema: MyResponseSchema } },
    },
  },
});

export function createMyRoute() {
  const route = createOpenApiApp();
  route.openapi(myRoute, (c) => {
    return c.json({ ... }, 200);
  });
  return route;
}
```

Mount it in `src/app.ts`:

```ts
app.route("/api/my-route", createMyRoute());
```

### Adding new routes

Each route module lives in `src/routes/` as its own `OpenAPIHono` sub-app created via
`createOpenApiApp()` from `src/lib/openapi.ts`.

#### Request validation

Every route validates its inputs at the HTTP boundary with Zod via `@hono/zod-openapi`.

**Convention:** exactly one Zod schema per route, defined at the top of the route file alongside the handler — no shared `schemas/` directory. Colocation keeps each route self-contained and reviewable.

Declare schemas with `z` from `@hono/zod-openapi` and name them via `.openapi("SchemaName")`
so they appear in `components.schemas` in the generated spec. Use `createRoute`'s `request`
block to declare headers, query params, and body — this wires both runtime validation and
spec generation in one place.

**Canonical `400` error shape** — returned by the `openApiDefaultHook` on any validation failure:

```jsonc
{
  "error": "ValidationError",
  "issues": [
    { "path": "body.name", "code": "too_small", "message": "String must contain at least 1 character(s)" }
  ]
}
```

`path` is prefixed by the validation target (`body` | `query` | `header` | `param`) so consumers
know which part of the request failed. The `/api/echo` route is the worked example of header,
query, and body validation together.

The `ValidationErrorSchema` (from `src/lib/openapi.ts`) should be referenced in each route's
`400` response so the generated client types errors correctly.

See [`docs/code-standards.md`](../../docs/code-standards.md) § Error handling for the broader error-handling policy.

## Database setup

Two ways to run: **local Docker Postgres** (recommended for day-to-day
development) or a **Neon branch** (used by preview/production; Neon project
provisioning is deferred to FND-014).

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
container (`postgresql://postgres:postgres@localhost:5433/picksleagues`), so no
edits are needed. (Host port 5433 avoids colliding with a local Postgres on the
default 5432.)

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
