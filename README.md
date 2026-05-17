# Picks Leagues

Free, ad-free NFL pick'em pools built for the people who play them. See [docs/product-vision.md](docs/product-vision.md) for the why.

## Prerequisites

- **Node:** version 24 (see `.nvmrc`). Use `nvm use` or `fnm use` to switch automatically.
- **pnpm:** installed via Corepack — run `corepack enable` once, then pnpm is managed by `packageManager` in `package.json`.

## Repo layout

```
apps/
  web/          # Vite + React SPA (FND-009+)
services/
  api/          # Hono API on Vercel Node serverless (FND-005+)
docs/           # Product vision, spec, standards, backlog
```

Both packages are intentionally empty stubs at this stage. Each is fleshed out by subsequent FND tickets (FND-002 through FND-016).

## Commands

```bash
# Install all workspace dependencies
pnpm install

# Build all packages
pnpm build          # alias for: pnpm -r build

# Start all dev servers in parallel
pnpm dev            # alias for: pnpm -r --parallel dev

# Run all tests
pnpm test           # alias for: pnpm -r test

# Lint all packages
pnpm lint           # alias for: pnpm -r lint

# Type-check all packages
pnpm typecheck      # alias for: pnpm -r typecheck
```

To run a command in a single package, use pnpm's `--filter` flag:

```bash
pnpm --filter @picksleagues/api build
pnpm --filter @picksleagues/web dev
```

## Authoritative docs

| Doc | Purpose |
|-----|---------|
| [docs/picks-leagues-mvp-spec.md](docs/picks-leagues-mvp-spec.md) | Architecture, tech stack, build order |
| [docs/game-types.md](docs/game-types.md) | All game-mode rules and edge cases |
| [docs/code-standards.md](docs/code-standards.md) | Enforceable rules for every line of code |
| [docs/ui-design-standards.md](docs/ui-design-standards.md) | shadcn, color tokens, mobile-first rules |
| [docs/backlog/](docs/backlog/) | 9 epics; one file per epic; per-ticket status lines |
| [process-definition.md](process-definition.md) | Development workflow and harness phases |
