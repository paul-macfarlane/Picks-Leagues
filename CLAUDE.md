# Picks Leagues — Claude Code instructions

Web-based NFL pick'em pools. Free, ad-free, independent. See [docs/product-vision.md](docs/product-vision.md) for the why.

## Authoritative docs

Read these as needed — don't restate them here.

- **Product vision** — [docs/product-vision.md](docs/product-vision.md) — character ("Sunday afternoon with friends"), commitments (free, no ads, independent, built by someone who plays)
- **MVP spec** — [docs/picks-leagues-mvp-spec.md](docs/picks-leagues-mvp-spec.md) — architecture, tech stack, build order
- **Game types** — [docs/game-types.md](docs/game-types.md) — all game-mode rules and edge cases
- **Code standards** — [docs/code-standards.md](docs/code-standards.md) — enforceable rules for code
- **UI standards** — [docs/ui-design-standards.md](docs/ui-design-standards.md) — shadcn, color, mobile-first
- **Process definition** — [process-definition.md](process-definition.md) — the workflow this harness implements
- **Deploy runbook** — [docs/deploy.md](docs/deploy.md) — Vercel build output, env vars, deploy-time migrations, persistent staging preview
- **Backlog** — [docs/backlog/](docs/backlog/) — 9 epics; one file per epic; tickets have IDs and per-ticket `Status:` lines

## Tech stack at a glance

- **Frontend:** Vite + React + TypeScript SPA, TanStack Router (file-based), TanStack Query, Tailwind, shadcn/ui
- **Backend:** Hono on Vercel Node serverless, Drizzle + Neon Postgres, Better Auth (JWT plugin), Zod, OpenAPI → typed client
- **Sports data:** ESPN behind a `SportsProvider` interface (swappable)
- **Tests:** Vitest everywhere; React Testing Library inside Vitest for components; Playwright for spine E2E
- **Monorepo:** pnpm workspaces — `apps/web`, `services/api`

## Non-negotiables (load-bearing for the whole codebase)

- **Scoring + domain isolation.** `services/api/src/scoring/` and `services/api/src/domain/` import nothing from `db/`, `repositories/`, `routes/`, `cron/`, `providers/`. Enforced by ESLint `import/no-restricted-paths`.
- **Routes orchestrate, domain decides, repositories query.** Three-layer backend pattern (see code-standards.md). A route handler with an `if` encoding a business rule is wrong — that rule belongs in `domain/`.
- **Server time is the source of truth.** All time-based decisions go through `clock.now()`; never trust client timestamps.
- **Picks store the accepted spread at submission time.** Scoring reads the stored spread, never the current one.
- **No DB integration tests for MVP.** Domain logic gets exhaustive table-tests; DB-touching paths are covered by spine Playwright E2E tests.
- **Mobile is the primary device.** Design at 375px first; desktop falls out from there.

## Development workflow

Work happens through the process harness defined in `process-definition.md`. These skills orchestrate the planner → implementer → reviewer → tester → documenter → PR phases:

- **`/ticket <id> [--autonomous]`** — single ticket (small scope). Default: collaborative.
- **`/epic <id> [--autonomous]`** — full epic (medium scope). Default: collaborative.
- **`/multi-epic <id1,id2,...> [--autonomous]`** — multiple epics (large scope). Default: collaborative.

Default mode pauses for human input at clarifying-question time and after the implementer for human testing. `--autonomous` runs end-to-end and only stops for hard blockers.

Plans land in `docs/plans/<ticket-id>.md` and survive across sessions.

## Backlog and ticket status

Each ticket carries a `**Status:**` line: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `BLOCKED`, `MOVED`. Skills update this as work moves through phases.

To see what's in flight: `grep -rn "Status:\\*\\* IN_PROGRESS" docs/backlog/` (the SessionStart hook also surfaces this).

## Branch and commit conventions

- **`staging` is the integration branch; `main` is production.** Branch off an up-to-date `staging`, and target PRs at `staging` — never `main`. Releasing to production is a `staging` → `main` PR. See [docs/deploy.md](docs/deploy.md) § "Branching and release flow".
- Branch name: `pm/<ticket-id-lowercase>-<short-desc>` (e.g., `pm/fnd-001-monorepo-skeleton`)
- Conventional Commits scoped by epic: `feat(pickem): ...`, `fix(elimination): ...`, `chore(foundation): ...`
- One PR per ticket (small scope), per epic (medium), per multi-epic batch (large). Squash on merge.
- Never `--no-verify`. Never force-push to `main`. The pre-push hook will block direct pushes to `main`.

## Hooks (configured in `.claude/settings.json`)

- **Pre-commit:** runs `pnpm lint && pnpm typecheck` first; skipped gracefully if tooling isn't installed yet
- **Pre-push:** blocks `git push` that targets `main` directly
- **SessionStart:** surfaces any tickets with `Status: IN_PROGRESS` or `Status: BLOCKED`
