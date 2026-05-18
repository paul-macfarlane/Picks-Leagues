# Picks Leagues

Free, ad-free, independent NFL pick'em pools. See [docs/product-vision.md](docs/product-vision.md) for the why.

## Docs

- [Product vision](docs/product-vision.md)
- [MVP spec](docs/picks-leagues-mvp-spec.md)
- [Game types](docs/game-types.md)
- [Code standards](docs/code-standards.md)
- [UI design standards](docs/ui-design-standards.md)
- [Backlog](docs/backlog/)

## Database

The API uses Postgres via Drizzle ORM. Local development runs Postgres 17 in
Docker (`docker compose up -d`); preview/production use Neon (Neon provisioning
deferred to FND-005/FND-014). The driver is chosen automatically from the
connection host. See [services/api/README.md](services/api/README.md) for the
full setup and generate/migrate/studio workflow.

## Getting started

**Install**

```sh
pnpm install
```

**Build**

```sh
pnpm -r build
```

**Generate the typed API client**

```sh
pnpm gen:api
```

Runs the API in-process, fetches the OpenAPI spec, and emits
`apps/web/src/lib/api-client/openapi.json` and `types.gen.ts`.
Run this after any route schema change, then commit the generated files.

**Dev**

```sh
pnpm dev
```

**Test**

```sh
pnpm -r test
```

**Lint**

```sh
pnpm lint
```

Auto-fix lint violations (formatting violations are handled by `format`, not this):

```sh
pnpm lint:fix
```

**Format**

Check formatting (run in CI):

```sh
pnpm format:check
```

Auto-format the codebase (run locally before committing):

```sh
pnpm format
```
