# 01 — Foundation epic

Stand up the repo, deployment, database, auth, and the API/web skeletons. Everything in this epic must be finished before we write game-mode rules or pick-entry logic.

## Tickets

### FND-001 — Monorepo skeleton
**Status:** DONE
**Description:** Set up a pnpm workspace with `apps/web` and `services/api`. Web uses Vite + React + TS; API uses Hono + Drizzle + Neon. Root has shared lint + typecheck + test scripts. Both CI-ready (no pre-commit hooks yet). First commit into a GitHub repo to prove the skeleton builds. Unblock all subsequent work.
**Acceptance criteria:**
- pnpm workspaces configure `apps/web` and `services/api`
- `apps/web` is a Vite + React + TypeScript build; `npm run dev` works
- `services/api` is a Hono server with Drizzle bootstrapped (no seed data); `npm run dev` works
- Root `package.json` has shared `lint`, `typecheck`, `test`, `build` scripts that run in all workspaces
- GitHub repo created; skeleton pushed
**Dependencies:** (none)

---

### FND-002 — Database migrations + seed
**Status:** DONE
**Description:** Stand up a fresh Neon (serverless Postgres) database. Create schema tables for users, picks, pools, matches, scores. Seed with stub data (a few test users, one or two pool configs, one week of fixtures) so the endpoint skeletons can return non-empty results immediately. Prove Drizzle migrations work end-to-end.
**Acceptance criteria:**
- `services/api/src/db/schema.ts` defines the tables in `game-types.md` schema + reference-data tables
- `services/api/src/db/migrations/` is populated and `drizzle-kit push:pg` succeeds against Neon
- Seed script in `scripts/seed.sh` creates stub data (users, pools, matches, fixtures, scores)
- `pnpm install && pnpm build` and `pnpm seed` succeeds on a fresh Neon database
**Dependencies:** FND-001

---

### FND-003 — User auth (Better Auth JWT)
**Status:** DONE
**Description:** Integrate Better Auth with JWT plugin. User signup/login (email + password, no OAuth yet). Issue a session JWT on login; store it in an httpOnly cookie. Protect API routes with middleware. Frontend can read session state and log in/out. Manual-testing friendly (no OAuth ceremony).
**Acceptance criteria:**
- `services/api/src/auth/` module set up with Better Auth + JWT config
- `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout` endpoints work
- Session JWT is httpOnly + secure + refreshes automatically
- API middleware wraps protected routes; unauthenticated requests → 401
- Frontend SPA can `POST /auth/signup`, `POST /auth/login` and store session
- Pre-commit hook runs `lint` + `typecheck`
**Dependencies:** FND-002

---

### FND-004 — API + web skeletons (endpoints, tRPC-style DX)
**Status:** DONE
**Description:** Set up Hono OpenAPI + Zod `@hono/zod-openapi` for type-safe endpoints. Auto-generate a typed Hono client (`services/api-client/src/client.ts`) so the web frontend gets request/response types and autocomplete. Define a dozen placeholder endpoints (no logic, just 200s + schema). Integrate the auto-gen into the build. This is the template for all future endpoints.
**Acceptance criteria:**
- `services/api/src/routes/` has 10+ placeholder endpoints (users, pools, picks, matches, fixtures, scores)
- Endpoints use `@hono/zod-openapi` for request validation + OpenAPI schema
- `pnpm generate-api-client` creates `services/api-client/src/client.ts` with full type safety
- Web imports and uses the typed client (one or two real HTTP calls)
- `pnpm build` succeeds; client types are checked
**Dependencies:** FND-003

---

### FND-005 — Vercel + GitHub deployment
**Status:** DONE
**Description:** Configure Vercel for web + API. Set up GitHub Actions to build and test on every PR. Prove a Vercel preview deploy works. All hand-rolled (no Vercel GitHub integration button; we control the GHA→Vercel push). Point `main` to the live Vercel project.
**Acceptance criteria:**
- `vercel.json` configures web + API as a monorepo build
- GitHub Actions workflow builds both apps, runs tests (lint + typecheck + vitest)
- Vercel preview deploy triggered by a PR; GH comment with preview URL shows up
- `main` is set as the default branch and points to Vercel live (production)
**Dependencies:** FND-004

---

### FND-006 — ESLint + Prettier + TS config (shared)
**Status:** DONE
**Description:** Root-level ESLint config (rules for pick'em-specific principles: scoring + domain isolation, three-layer routing, server-side time, etc.). Root prettier config (tabs, 100 line length, etc.). Shared `tsconfig.json` with per-app overrides. Hooks run pre-commit. All linted + formatted before commit.
**Acceptance criteria:**
- Root `.eslintrc.js` with rules enforcing pick'em principles (scoring/domain/repository separation, no CJS in web, etc.)
- `@typescript-eslint` + `eslint-plugin-react` + `eslint-plugin-import` configured
- Root `prettier.config.js` (100 columns, tabs, etc.)
- `pnpm lint` and `pnpm format` scripts work across the workspace
- Pre-commit hook runs both
**Dependencies:** FND-001

---

### FND-007 — vitest + React Testing Library (test suite)
**Status:** DONE
**Description:** Vitest configured in both `apps/web` and `services/api`. React Testing Library for component tests. A few example tests to set the pattern. Thi is the template for all future unit tests. Scoring domain gets exhaustive table-driven tests. No database mocks (DB tests are Playwright E2E only; see FND-015).
**Acceptance criteria:**
- `services/api/src/scoring/` has table-driven tests covering all game types + edge cases (tiebreakers, pushes, H2H, etc.)
- `apps/web/src/` has component and hook tests (e.g., session context, user input validation)
- `pnpm test` runs in both apps and passes; coverage shows scoring is >95%
**Dependencies:** FND-002, FND-006

---

### FND-008 — SPA router (TanStack Router + Outlets)
**Status:** DONE
**Description:** Replace Create React App static routes with TanStack Router. File-based, use the file path as a visual map of the route tree. Query client configured alongside (TanStack Query). SPA pages for Unauthenticated (login/signup), Authenticated (dashboard, pool list, live picks), Admin (pool config, etc.). A dummy "not found" page. Zero pick'em logic; just the page scaffolds and happy-path navigation.
**Acceptance criteria:**
- `apps/web/src/routes/` has TanStack Router file structure
- Routes: `/`, `/login`, `/signup`, `/dashboard`, `/pools/[poolId]`, `/admin`, `*` (404)
- TanStack Query configured and imported in at least one page component
- `pnpm dev` runs the SPA and links work (no 404s for real routes)
**Dependencies:** FND-003, FND-006

---

### FND-009 — UI library + theme (shadcn/ui, Tailwind)
**Status:** DONE
**Description:** Add shadcn/ui components (Button, Card, Input, Dialog, Table, Tabs, etc.). Tailwind for styling. Web app theme (light + dark mode toggle). Match the design system in `ui-design-standards.md` (375px mobile first). Demo page showing all components. No pick'em-specific UI yet; just the design tokens and a component gallery.
**Acceptance criteria:**
- shadcn/ui Button, Card, Input, Dialog, Table, Tabs, Select, Badge installed
- Tailwind + CSS module configured; mobile-first 375px + dark mode
- `apps/web/src/components/ui/` has all shadcn/ui components
- Demo page at `/demo` lists all components (snapshot for regression)
- Theme toggle works in both light and dark (localStorage)
**Dependencies:** FND-001, FND-006

---

### FND-010 — Session state (context + localStorage)
**Status:** DONE
**Description:** React Context for user session (logged-in user, pool list). TanStack Query persists session across navigations via sessionStorage. Unauthenticated routes show login/signup; authenticated routes show the dashboard. Session can be loaded from a cookie and hydrated on mount. Logout clears the session. No pick'em logic; just a template for managing user state.
**Acceptance criteria:**
- `apps/web/src/contexts/SessionContext.tsx` wraps the app
- TanStack Query caches the session across routes
- Unauthenticated routes redirect to `/login`
- Logout mutation clears session and redirects to `/login`
- Session survives a page reload if the JWT cookie is valid
**Dependencies:** FND-003, FND-008, FND-009

---

### FND-011 — Responsive layout + navigation
**Status:** DONE
**Description:** Header with title + nav menu. Footer with links. Sidebar nav. Responsive: hamburger on mobile (375px), sticky nav on desktop. Dark mode respects user preference. Layout wraps all authenticated pages. Page-transition animations (optional but nice). Mobile-first Tailwind.
**Acceptance criteria:**
- Header on all pages: Picks Leagues logo + hamburger menu
- Sidebar: pools, settings, admin (if user is admin)
- Mobile: hamburger menu that slides in
- Desktop: sidebar visible always (sticky)
- Dark mode toggle in header
- All pages styled to match `ui-design-standards.md`
**Dependencies:** FND-009, FND-010

---

### FND-012 — Pool + match seed data (ESPN API integration, read-only)
**Status:** DONE
**Description:** SportsProvider interface abstracts the sports data source. ESPN implementation reads fixtures for the current/next NFL week, caches them for 1 hour. API endpoint returns matches + lines. Bootstrap a pool with this seed data (pool creation picks a week, then populates matches from the provider). No picks logic yet; just data plumbing.
**Acceptance criteria:**
- `services/api/src/providers/SportsProvider.ts` (interface) + `src/providers/ESPNSportsProvider.ts` (impl)
- Caching: ESPN data cached for 1 hour
- `POST /pools` accepts `name`, `weekNumber`, `gameType`, `owner` and populates matches + lines from ESPN
- `GET /pools/[poolId]/matches` returns matches, spreads, scores (scores empty if pre-week)
- Seed script runs and creates a test pool from real ESPN data
**Dependencies:** FND-002, FND-004

---

### FND-013 — Env config (dev, staging, prod)
**Status:** DONE
**Description:** Env variables for database, auth, API URL, OAuth, etc. Use `VITE_` prefix for frontend vars (Vite will inline). `.env.local` is gitignored. GitHub Actions and Vercel have their own env var configs. No hardcoded URLs or secrets. Different config per environment (localhost:3000, staging, vercel-prod).
**Acceptance criteria:**
- `apps/web/.env.local`, `services/api/.env.local` (gitignored)
- Vite + Hono both read their env correctly
- GitHub Actions: env vars set in repo Secrets
- Vercel: env vars set in Vercel project settings
- `pnpm dev` runs with sensible local defaults (localhost:5173 + :3000)
**Dependencies:** FND-001, FND-005

---

### FND-014 — No CORS, same-origin everywhere
**Status:** DONE
**Description:** API has no CORS middleware. In dev, Vite proxy routes `/api` to the Node dev server (same origin, in the SPA's view). In production, both web + API are deployed to the same Vercel project (monorepo build), so they are same-origin on the user's DNS. No cross-origin fetch headers needed. Any third-party consumer would require a separate CORS+OAuth dance (out of scope for MVP).
**Acceptance criteria:**
- No `cors()` middleware in Hono
- Vite dev server proxies `/api/*` → `localhost:3000/api/*`
- Vercel build output has both web + API in one project (`.vercel/output/static/`, `.vercel/output/functions/`)
- Cookies work (sent automatically on same-origin fetch)
**Dependencies:** FND-004, FND-005

---

### FND-015 — Playwright E2E spine test
**Status:** DONE
**Description:** Playwright test suite. One happy-path E2E test per game mode (pick'em, H2H, survivor, etc.) — these are the "spine" tests that exercise the real flow end-to-end (signup → create pool → pick → scoring → tally). Database isolation per test (seed → test → rollback, or in-memory if simpler). No unit-test analogs for DB paths; spine tests are the sole DB coverage. This is the template for game-mode-specific tests.
**Acceptance criteria:**
- `services/api/tests/e2e/` has a Playwright config
- One happy-path spine test per game mode (4–5 tests)
- Each test provisions a fresh pool + matches, creates picks, advances the clock, and verifies final standings
- CI runs Playwright before merge
- No mock database; real Postgres (isolated per test or in-memory)
**Dependencies:** FND-012, FND-016

---

### FND-016 — CI pipeline (GitHub Actions gate on PR)
**Status:** DONE
**Description:** GitHub Actions workflow on every PR: `pnpm lint`, `pnpm typecheck`, `pnpm test` (vitest), `pnpm build` (both apps), `pnpm format:check`. Also, `api-client-check.yml`: generate the API client and verify it hasn't drifted from the committed version (if it has, the PR fails; implementer must re-run `pnpm generate-api-client` and commit the update). Workflow runs 5 jobs in parallel for speed. Pass the gate to merge. Failures block merge and the author must fix.
**Acceptance criteria:**
- `.github/workflows/ci.yml` runs 5 jobs in parallel: lint, typecheck, test, build, format:check
- `.github/workflows/api-client-check.yml` regenerates the client and diffs against the committed version
- Pre-push hook blocks `git push` to `main` directly (use a PR)
- Pre-push hook warning is clear: "Pushes to main must go through a PR (ci.yml gate)."
**Dependencies:** FND-006, FND-007, FND-004, FND-014

---

### FND-017 — API client stale check (commit to repo)
**Status:** DONE
**Description:** Generate the API client from OpenAPI schema on every build (`pnpm generate-api-client`). Commit the generated client to the repo so the git history is reviewable, diffs are visible, and changes to the API contract are auditable. `api-client-check.yml` verifies that the committed client matches the current schema on every PR.
**Acceptance criteria:**
- `pnpm generate-api-client` runs `openapi-generator-cli` and writes to `services/api-client/src/client.ts`
- Client is committed to the repo (in `.gitignore` it is NOT ignored)
- `pnpm build` calls `pnpm generate-api-client` as a pre-build step
- `api-client-check.yml` (FND-016) regenerates the client and fails the PR if it differs
**Dependencies:** FND-004, FND-016

---

### FND-018 — Dependabot dependency + security updates
**Status:** DONE
**Description:** Add `.github/dependabot.yml` so the repo gets automated PRs for security advisories and version bumps. Cover the npm ecosystem across the pnpm workspace (`apps/web`, `services/api`, root) and the `github-actions` ecosystem (keep workflow action versions current). Group non-security minor/patch bumps into a single weekly PR to keep noise low; security updates open immediately. Free on this public repo (unlimited Actions minutes). Once FND-016 exists, the CI pipeline validates each Dependabot PR before merge.
**Acceptance criteria:**
- `dependabot.yml` covers npm (all workspace manifests) + github-actions
- Security-advisory PRs open automatically; routine bumps are grouped weekly
- A test bump PR is created and passes CI (or, pre-FND-016, builds locally)
**Dependencies:** FND-001

---

### FND-019 — Drizzle migration drift check (CI gate)
**Status:** DONE
**Description:** CI gate that catches the common foot-gun of editing `src/db/schema/` without committing the matching migration. Runs `drizzle-kit generate` on every PR and fails if it produces a new (uncommitted) migration — exactly mirroring the existing `gen:api:check` staleness gate (FND-016/017). `drizzle-kit generate` reads schema files only (no DB connection), so the check needs no database. This keeps the committed migrations in `src/db/migrations/` always in sync with the schema source.
**Acceptance criteria:**
- `db:generate:check` script (api package + root passthrough) runs `drizzle-kit generate` and fails on an uncommitted migration diff, mirroring `gen:api:check`
- A dedicated `schema-drift-check.yml` workflow runs it on every PR (mirrors `api-client-check.yml`)
- Editing `schema.ts` without committing the generated migration fails the PR; a clean tree passes
- No live database required (the check is schema-source-only)
**Dependencies:** FND-002, FND-005
**Notes:** Originally scoped as a production cron that introspected the live Neon DB for drift and alerted via Discord/Slack/Sentry. Descoped 2026-05-29: for a solo, pre-users MVP where all schema changes go through committed migrations and FND-020 runs migrations on every deploy, the live-DB drift cron was low-value and false-positive-prone (information_schema ↔ Drizzle snapshot type-mapping). Kept only the cheap, high-value CI guard. Revisit live-DB drift detection when there are multiple contributors or real production data to protect.

---

### FND-020 — Production migration workflow
**Status:** DONE
**Description:** Database migrations must run before the API starts on Vercel (a pre-deployment hook). On deploy, the committed Drizzle migrations are applied to the live Neon database (via `pnpm --filter @picksleagues/api db:migrate`, run as the first step of `pnpm vercel:build`) before the API code goes live. This ensures the schema is always in sync with the running code. Fail the deployment if the migration fails (so a bad schema doesn't ship). This is the template for all future schema changes. (Original wording said `drizzle-kit push:pg`; superseded by the committed-migration approach to complement FND-019's drift check — see `docs/plans/fnd-020.md`.)
**Acceptance criteria:**
- Vercel build step runs `pnpm --filter @picksleagues/api db:migrate` (committed migrations) before API boot
- Migration succeeds or deployment fails (no partial deploys)
- Post-deploy, API can read and write the latest schema
**Dependencies:** FND-002, FND-005, FND-019

---

### FND-021 — Sports data simulator
**Status:** MOVED → epic 02 (SPT-010–013)
**Moved:** 2026-05-30. The simulator depends on the `SportsProvider` interface, the ESPN provider, and the sync cron pipeline — all of which live in epic 02 (Sports data & sync) — so it belongs there, not in Foundation.
**Redesigned:** The original offline/scripted, in-memory simulator was replaced with a **real-ESPN season-replay** design: re-enact a real past NFL season by pulling its archived schedule/scores/spreads from ESPN and replaying them week-by-week through the same sync pipeline the production crons use. One tool now covers both off-season testing of in-season flows **and** validation of the real ESPN integration. It is no longer offline. See **SPT-010 → SPT-013** in [02-sports-data-and-sync.md](02-sports-data-and-sync.md).
**Dependencies:** (see SPT-010–013)

---

### FND-022 — Per-PR preview environments (Neon branches + OAuth)
**Status:** DONE
**Description:** Make every PR's Vercel preview deploy a fully working, isolated environment — not just a static build. FND-005 proved a preview deploy renders; this makes it usable end-to-end. Each preview gets its own Neon database branch (forked from a baseline, migrated, cleaned up when the PR closes) so previews never touch production data and can be exercised destructively. OAuth must work on the dynamic preview URL: register the Google callback so sign-in completes on `*.vercel.app` previews and the session cookie is scoped where the SPA can see it (the same `:5173`-style scoping lesson from local dev — preview frontend and API are same-origin on one Vercel project, so `BETTER_AUTH_URL` must resolve to the preview's own origin). Wire per-preview env vars (preview `DATABASE_URL` → the PR's Neon branch, `BETTER_AUTH_URL` → the preview origin) into the existing hand-rolled GHA→Vercel deploy path. This unblocks reviewers testing real flows (sign-in, create league, picks) on a PR before merge, and is a prerequisite for richer preview-based smoke tests (POL-003).
**Acceptance criteria:**
- On PR open/update, a Neon branch is created (forked from a baseline branch) and migrations run against it
- The preview deploy's `DATABASE_URL` points at that PR's Neon branch; no preview ever reads/writes production data
- Neon branch is deleted when the PR is closed/merged (no orphaned branches)
- Google OAuth callback registered once for a single stable shared preview origin (Option B — see `docs/plans/fnd-022.md`); sign-in completes on the shared preview origin and the session cookie is visible to the SPA. (Original per-deploy-`*.vercel.app` OAuth wording was superseded by Option B: per-PR isolation is at the database layer, not the frontend origin — one shared stable preview origin is registered once in the OAuth consoles.)
- `BETTER_AUTH_URL` resolves to the single fixed shared preview origin on preview deploys; `VERCEL_URL` is a lower-priority runtime fallback for reaching a deploy at its raw per-deploy host
- Env-var provisioning runs through a GHA workflow (`preview-env.yml`) that sets a git-branch-scoped `DATABASE_URL` on the Vercel project before Vercel's Git integration builds the preview; no Vercel GitHub integration button click required
- Documented runbook: how a reviewer signs in via the shared preview origin and exercises a preview, and how branches are cleaned up automatically on PR close
**Dependencies:** FND-005, FND-020
**Notes:** Captures previously-discussed preview-environment work (per-PR Neon branches + OAuth redirect handling). See MEMORY: local OAuth `:5173` cookie-scoping lesson and "no CORS — same-origin everywhere" (preview frontend + API are one same-origin Vercel project). Prerequisite for POL-003 (production/preview smoke tests).
**Delivered as (2026-05-30, supersedes the per-PR acceptance criteria above):** the per-PR ephemeral-environment automation was descoped in favor of a **single persistent staging preview environment**. Rationale: Google/Discord forbid `*.vercel.app` wildcard OAuth redirect URIs and a Vercel domain binds to one branch at a time, so per-PR previews would require re-registering/reassigning the OAuth origin per PR; a long-lived staging origin avoids that, and one shared preview DB is acceptable at current team size. What shipped: the `resolveAuthBaseURL` origin-resolution code (`services/api/src/auth/`) + its tests, and a persistent-staging runbook in `docs/deploy.md` (a `staging` git branch bound to `staging.picksleagues.com`, one persistent Neon `staging` branch, Preview-scoped `DATABASE_URL`/`BETTER_AUTH_URL`, previews restricted to `staging` via a Hobby-plan Ignored Build Step). The `preview-env.yml` / `preview-cleanup.yml` GHA workflows were built then removed; per-PR isolation can be revisited under POL-003 if automated preview smoke tests need it. See `docs/plans/fnd-022.md`.

---
