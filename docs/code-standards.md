# Code Standards

These are enforceable rules for code in this repo. Where possible they're enforced by tooling (TypeScript config, ESLint, Prettier, CI). Where not, they're enforced by review.

The [product vision](./product-vision.md) and [MVP spec](./picks-leagues-mvp-spec.md) are the higher authorities. These standards exist to serve them.

## TypeScript

- `strict: true` is required. Do not loosen it.
- `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`.
- No `any` without an explanatory comment on the same line. `unknown` is the default for genuinely-unknown shapes.
- No `as` casts to bypass type errors. If you need to cast, narrow with a type guard or fix the type.
- Prefer `type` for unions/aliases, `interface` for object shapes meant to be extended.
- All exported functions and route handlers have explicit return types. Inferred return types are fine for local helpers.

## File and directory naming

- TypeScript files: `kebab-case.ts` (e.g., `pick-resolution.ts`).
- React components: `PascalCase.tsx` (e.g., `PickCard.tsx`).
- Test files: same name as the file under test plus `.test.ts(x)`.
- Directories: `kebab-case`.

## Imports

- Order: external → internal alias (`@/`) → relative. **Sorted automatically by Prettier** via `@ianvs/prettier-plugin-sort-imports`. Don't hand-sort.
- Unused imports are caught by ESLint (`@typescript-eslint/no-unused-vars` as error). They must be removed manually or by ESLint `--fix` — Prettier sorts imports but does not remove them.
- Prefer named imports. Default imports only when a module exports a single default (e.g., React components).
- No circular imports. Refactor when one appears; don't add `// eslint-disable`.

## Comments

- Default to writing no comments. Well-named identifiers describe WHAT; comments are for non-obvious WHY.
- Acceptable: hidden constraints, subtle invariants, workarounds for specific bugs, behavior that would surprise a reader.
- Not acceptable: narration of what code does, references to tickets or PRs ("added for X flow", "see issue #123"), TODO comments without an owner or follow-up ticket.
- No multi-paragraph docstrings. One short line max.

## Error handling

- Validate at system boundaries only: HTTP request bodies (Zod), external API responses (Zod), URL params (Zod). Trust internal code and framework guarantees.
- Inside the system, throw typed errors. The HTTP layer is the only place that converts errors to status codes.
- No defensive `try/catch` around code that can't actually fail. No fallbacks for "what if the framework breaks" — let it crash and fix the framework usage.
- No silent failures. If you catch an error, either rethrow, log with full context, or convert to a typed result — but never swallow.

## Testing

**Tooling:** Vitest is the test runner everywhere (API and frontend). React Testing Library is the rendering/query helper inside Vitest for frontend component tests — they're complementary, not alternatives.

**MVP scope:** We test business logic exhaustively. We do **not** write integration tests that hit a real database for the API. Confidence in DB-touching code comes from the spine E2E tests + the architecture that keeps DB queries thin and dumb (see [Backend architecture](#backend-architecture-domain--repositories--routes)).

### Scoring module (`services/api/src/scoring/`)
- Exhaustively table-tested. Every rule, edge case, tiebreaker, push, cancellation, and re-pick scenario from `docs/game-types.md` has a test.
- Tests are pure input/output assertions. No mocks. No fixtures. No database. No HTTP.
- A scoring test failing means the rules table-tests need updating — there is no acceptable "flaky scoring test."

### Domain logic (`services/api/src/domain/`)
- Same rules as the scoring module: pure functions, no I/O, table-tested.
- Domain functions take their data as arguments (not a DB handle). The route handler does the loading.
- This is where business rules other than scoring live: pick submission validation, league join/leave rules, money pick designation logic, etc.

### Repositories (`services/api/src/repositories/`)
- Thin wrappers over Drizzle queries. No business rules.
- **Not tested in MVP.** They're so thin that tests would just re-assert the SQL. The spine E2E tests catch real query bugs.
- Post-MVP, add repository tests if a class of bugs starts slipping through.

### Sync jobs and cron handlers
- Test the handler's orchestration logic with a stubbed `SportsProvider` (the interface exists for this reason) and a stubbed clock. Don't hit ESPN. Don't hit a real DB.
- The DB-touching part of the handler is in a repository call — that's covered by the same "not tested in MVP" stance.
- Verify idempotency by asserting the orchestration decides "skip" on second invocation given the same input state.

### Frontend
- **Vitest + React Testing Library** for non-trivial interactive components (forms, pickers, the confidence ranker). Static display components don't need tests.
- E2E tests (Playwright) for the critical user journeys: signup, create league, submit picks, view standings. Spine only, not exhaustive. This is the layer that effectively covers the DB query layer too.

## Database (Drizzle + Neon)

- All schemas live in `services/api/src/db/schema/`.
- All timestamps are stored in UTC. Column type is `timestamp` (without timezone); convention documented in the schema file header.
- Query specific columns. No `select()` without arguments — be explicit about what the route returns.
- Migrations are generated, reviewed, and committed alongside the schema change. Never edit a migration that has run in production.
- Foreign keys always have `onDelete` specified explicitly. Don't accept the default.
- All picks store their **accepted spread at submission time**. Scoring reads from the stored spread, never the current one.
- No `is_locked` or `is_visible` columns on picks — both are derived from `game.kickoff_time` at query time.

### Transactions

The primary Drizzle client uses the Neon serverless **WebSocket pooled** driver
(`drizzle-orm/neon-serverless` + `Pool` from `@neondatabase/serverless`). This
is mandatory: the HTTP driver (`neon-http`) does not support interactive
transactions — `db.transaction(async (tx) => ...)` throws at runtime. Do not
"optimize" it back to `neon-http`.

Rules enforced by review (a future ESLint rule could automate the `db`-inside-
transaction check — flagged as a future tightening, out of scope now):

- Any operation performing **more than one write** that must succeed or fail
  together MUST run inside a single `db.transaction()`. No partial-write paths.
- Any **read-then-write where the write depends on the read for correctness**
  (check-then-act, invariant enforcement, uniqueness/quota checks) MUST occur
  in one transaction so the read is consistent with the write. A check outside
  the transaction is a race, not a check.
- The transaction callback receives a `tx` handle. Every query inside that unit
  of work MUST use `tx`, never the outer `db`. Capturing `db` inside the
  callback silently escapes the transaction and is a correctness bug.
- Repository functions accept an optional executor parameter (typed as the `tx`
  handle or the shared `db`, defaulting to `db`) so a domain-orchestrated unit
  of work can compose multiple repository calls in one transaction. The
  transaction boundary is **owned by the orchestration layer** (the route
  handler) — opened around a sequence of repository calls, never opened or
  hidden inside a single repository function. Repositories stay dumb; they
  thread the executor through.
- Keep transactions short. Do **not** perform external/network I/O inside a
  transaction (ESPN/`SportsProvider` calls, HTTP, queueing). Load external data
  first; then open the transaction for the DB writes.
- Do not swallow a transaction rollback error — rethrow per § Error handling.
- Prefer the smallest viable isolation level. Drizzle's default (read committed)
  is correct for most cases; escalate only when you can demonstrate why you need
  it and document the reason inline.
- Do not nest `db.transaction()` calls. The `neon-serverless` driver does
  implement nesting via Postgres SAVEPOINTs, but the rollback scope of an inner
  transaction is subtle and easy to get wrong (an inner rollback does not undo
  the outer one). Keep the transaction boundary at a single level owned by the
  orchestration layer; thread the `tx` handle down instead of opening a new one.

## Backend architecture: domain → repositories → routes

Business logic is **separated from database queries** so it can be tested without a DB. Three layers:

```
services/api/src/
├── routes/         # Hono handlers — thin orchestrators
├── domain/         # Pure business logic — takes data, returns decisions
├── repositories/   # Drizzle query wrappers — thin, no rules
├── scoring/        # Pure scoring functions (existing pattern, same shape as domain)
└── ...
```

**Route handlers are orchestrators.** Their job:
1. Validate input (Zod).
2. Authenticate + authorize.
3. Load data via repositories.
4. Call the relevant domain (or scoring) function with the loaded data.
5. Persist the result via repositories.
6. Return the HTTP response.

A route handler that contains an `if` statement encoding a business rule is wrong — that rule belongs in `domain/`.

**Domain functions are pure.** They take everything they need as arguments. They return decisions, computed state, or typed errors. They never import from `repositories/`, `db/`, `providers/`, or anything I/O.

**Repositories are dumb.** Each function is `(args) → Promise<rows>` or `(args) → Promise<void>`. No business decisions inside. If you find yourself writing logic in a repo, push it back into a domain function.

This is the same "functional core, imperative shell" pattern the scoring module already follows. Scoring stays where it is — `domain/` houses everything else (pick submission rules, league lifecycle rules, money pick designation, etc.).

## Scoring + domain module isolation

- The `scoring/` and `domain/` modules import nothing from `db/`, `repositories/`, `routes/`, `cron/`, `providers/`, `notifications/`, or any HTTP/env machinery.
- Enforced by ESLint `import/no-restricted-paths`.
- If a function needs data, the caller passes it in. No exceptions.

## Sync jobs

- Recurring syncs (every-N-minutes) **query** reference data, they do not upsert it. Setup/admin paths own reference data creation. If a team or game is missing during a sync, that's a bug to investigate, not a row to insert.
- Daily syncs (`sync-schedule`) are the exception — they own the schedule/team upserts.
- All cron handlers are idempotent. A re-run on the same tick is a no-op for already-resolved state.
- All cron handlers verify the cron secret in the `Authorization` header. Reject anything else with 401.

## Auth and authorization

- All authenticated routes use Better Auth middleware. Don't roll your own session check.
- **JWT-based auth from day one.** Better Auth's `jwt()` plugin issues JWTs regardless of sign-in method (Google OAuth and Discord OAuth in MVP; future providers like magic link or password would issue the same token shape) — verified via the Better Auth docs. Web and (post-MVP) mobile clients use the same token shape, so no auth rework when mobile is added.
- Authorization (can this user do this action?) is a separate check from authentication. Always check league membership / commissioner status before mutations — the check lives in `domain/`, called by the route.

## Server time is the source of truth

- All time-based decisions (pick locked? pick visible? deadline passed?) compare server `clock.now()` against `game.kickoff_time` or another DB timestamp.
- All `now()` reads in the API go through a single `clock.now()` helper (so the simulator can swap in a fake clock).
- Never trust a client timestamp for these decisions.
- The client may use its local clock for display only — it never makes decisions.

## Frontend

- All API calls go through the generated typed client. No raw `fetch` in feature code.
- Server state lives in TanStack Query. No `useState` for fetched data; no manual fetch-then-setState patterns.
- Routes are TanStack Router file-based routes. Loaders use TanStack Query.
- Polling during game windows: 15–30 seconds. Configured per route, not globally.
- Functional components only. Hooks at the top, ordered: state → derived → effects → handlers.
- Props are typed explicitly. No `React.FC` (no implicit children).

## shadcn/ui

- All UI primitives come from shadcn/ui (see [UI design standards](./ui-design-standards.md)). Don't add other component libraries without explicit discussion.
- shadcn components are copied into the repo and modifiable. Modify in place; don't wrap unnecessarily.
- Custom components compose shadcn primitives. Don't reach for raw HTML controls when a shadcn primitive exists.

## Linting and formatting

**Prettier handles formatting and import organization.** Plugins:
- `@ianvs/prettier-plugin-sort-imports` — sorts imports per the order above.
- `prettier-plugin-tailwindcss` — sorts Tailwind class names consistently.

Prettier defaults are not overridden to settle bikeshed arguments.

**ESLint focuses on correctness, not style.** Rules in play:
- `@typescript-eslint` recommended.
- `@typescript-eslint/no-unused-vars` (with `argsIgnorePattern: "^_"`) — see [Dead code](#dead-code-and-dry).
- `import/no-restricted-paths` — enforces scoring + domain isolation.
- `react-hooks/rules-of-hooks` + `react-hooks/exhaustive-deps`.
- `no-floating-promises`, `no-misused-promises`.

`pnpm lint` and `pnpm format:check` run in CI and block merge.

## Dead code and DRY

**No unused code.**
- `@typescript-eslint/no-unused-vars` is an error, not a warning. Unused imports and variables are caught here (Prettier's sort-imports plugin only sorts; ESLint enforcement via `--fix` or manual removal is required).
- No commented-out code in commits. If you might need it later, that's what `git log` is for.
- No exported symbols with zero callers. CI runs `knip` (or `ts-prune`) to surface dead exports; new dead exports block merge.
- No empty stub files "for later."

**DRY for business logic.** Domain functions and scoring helpers must not be duplicated. If you find yourself writing the same rule check in two places, extract it into a single domain function and call it from both.

DRY does **not** apply to:
- Repository functions — slight query duplication is fine; premature abstraction over Drizzle queries hurts readability.
- UI markup — three similar JSX blocks are usually better than a configurable mega-component.
- Test fixtures — explicit per-test setup beats clever shared fixtures.

The rule of thumb: **deduplicate behavior, tolerate duplicated shape.**

## Documentation and spec sync

The authoritative docs (`docs/picks-leagues-mvp-spec.md`, `docs/game-types.md`,
`docs/product-vision.md`, `docs/ui-design-standards.md`, and this file) are the
source of truth for intent. Code that contradicts an authoritative doc is
either a bug or a deliberate decision — never a tolerated mismatch.

- When an implementation **deliberately drifts** from an authoritative doc,
  update that doc **in the same PR** as the code change. A PR that contradicts
  a spec without updating the spec does not pass review.
- Fix the stale prose in place so the doc is **internally accurate** — do not
  leave a statement that still asserts the old decision sitting next to the new
  one. The doc states the new decision plus a one-line rationale; the deep
  reasoning can live in the plan/PR.
- Also add a dated one-line entry to that doc's **Revision log** so the drift
  is discoverable without re-reading the whole document.
- This applies to every authoritative doc, not just the MVP spec.

## Git workflow

- One commit per logical change. Don't bundle unrelated fixes into one commit "while you're in there."
- Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`. Scope is the epic or module (e.g., `feat(pickem): add weekly standings query`).
- One PR per ticket (small scope) or per epic (medium/large scope), per the process definition.
- Squash on merge to keep `main` history readable. Branch names: `<initials>/<ticket-id>-<short-desc>` (e.g., `pm/pkm-014-weekly-standings`).
- Never `--no-verify`. Never `git push --force` to `main`. If a hook fails, fix the underlying issue.
