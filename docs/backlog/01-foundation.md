# Epic 01: Foundation

Stand up the repo, deployment, database, auth, and the API/web skeletons. Everything else depends on this.

**Status:** TODO

## Tickets

### FND-001 — Monorepo skeleton with pnpm workspaces
**Status:** TODO
**Description:** Initialize pnpm workspace with `apps/web` and `services/api` subdirs (empty package.json each). Add `.editorconfig`, `.gitignore`, and update root `README.md` to link to docs.
**Acceptance criteria:**
- `pnpm install` succeeds at the repo root
- `pnpm -r build` runs (even with empty stubs)
- Root README documents how to install, build, dev, test
**Dependencies:** none

---

### FND-002 — TypeScript strict mode + shared config
**Status:** TODO
**Description:** Add a shared `tsconfig.base.json` at the repo root with `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`. Both packages extend it.
**Acceptance criteria:**
- Both packages compile under strict mode
- A test file using `any` triggers an ESLint warning
- Code standards referenced from root README
**Dependencies:** FND-001

---

### FND-003 — ESLint + Prettier with import boundaries
**Status:** TODO
**Description:** Configure ESLint with `@typescript-eslint` and `import/no-restricted-paths` (rule scaffolded; the scoring + domain boundary is enforced once those modules exist in later epics). Configure Prettier with `@ianvs/prettier-plugin-sort-imports` (sorts imports per code standards) and `prettier-plugin-tailwindcss` (sorts Tailwind class names). ESLint focuses on correctness, Prettier handles formatting and import order — see `docs/code-standards.md`.
**Acceptance criteria:**
- `pnpm lint` and `pnpm format:check` pass on the empty packages
- Saving a file with out-of-order imports causes Prettier to fix them
- `no-restricted-paths` is configured in a way that's easy to add new rules to later
**Dependencies:** FND-002

---

### FND-004 — Neon project + first Drizzle migration
**Status:** TODO
**Description:** Create a Neon project (dev branch). Configure `services/api/drizzle.config.ts`. Add the initial `users` schema (Better Auth requirement) and run the first migration. Document `DATABASE_URL` setup in `services/api/README.md`.
**Acceptance criteria:**
- `pnpm db:migrate` applies the migration to the local Neon branch
- `pnpm db:studio` opens Drizzle Studio successfully
- `.env.example` lists the required `DATABASE_URL`
**Dependencies:** FND-001

---

### FND-005 — Hono API skeleton with health endpoint
**Status:** TODO
**Description:** Stand up a Hono app in `services/api/src/index.ts`. Add `/api/health` returning `{ status: "ok", time: <iso> }`. Configure for the Vercel Node.js runtime via `services/api/api/index.ts` entry.
**Acceptance criteria:**
- `pnpm dev` in `services/api` serves the health endpoint locally
- `curl localhost:3000/api/health` returns JSON
- App structured to receive route modules under `src/routes/`
**Dependencies:** FND-004

---

### FND-006 — Zod request validation middleware
**Status:** TODO
**Description:** Wire up `@hono/zod-validator`. Add a sample protected echo route to verify behavior. Establish the convention of one Zod schema per route, colocated with the handler.
**Acceptance criteria:**
- Route with Zod body schema rejects invalid payloads with 400 + structured error
- Sample route demonstrates header, query, and body validation
- Convention documented in `services/api/README.md`
**Dependencies:** FND-005

---

### FND-007 — OpenAPI spec export
**Status:** TODO
**Description:** Configure `@hono/zod-openapi` (or `hono-openapi`). Export OpenAPI JSON at `/api/openapi.json`. The health and echo routes appear in the spec.
**Acceptance criteria:**
- `/api/openapi.json` returns a valid OpenAPI 3 doc
- Health and echo routes present with correct schemas
- README note explains how to regenerate the spec
**Dependencies:** FND-006

---

### FND-008 — Typed API client generation
**Status:** TODO
**Description:** Add a script that consumes the OpenAPI spec and emits a typed TypeScript client to `apps/web/src/lib/api-client/`. Use `openapi-typescript` or `orval`. Hook into web `pnpm dev` and CI.
**Acceptance criteria:**
- `pnpm gen:api` regenerates the client from the running API
- Client exposes typed functions for health and echo
- CI fails if the checked-in client is stale relative to the spec
**Dependencies:** FND-007

---

### FND-009 — Vite + React + TanStack Router skeleton
**Status:** TODO
**Description:** Initialize `apps/web` as a Vite + React 18 + TypeScript app. Configure TanStack Router with file-based routing (`apps/web/src/routes/`). Add a single `/` route showing "Hello Picks Leagues."
**Acceptance criteria:**
- `pnpm dev` opens the app at `localhost:5173`
- TanStack Router devtools available in dev
- File-based route generation works
**Dependencies:** FND-001

---

### FND-010 — Tailwind + shadcn install with theme
**Status:** TODO
**Description:** Install Tailwind and shadcn/ui. Configure stone base + amber accent per UI design standards. Add light/dark theme provider with system-preference default. Install a starter shadcn set: Button, Card, Input, Label, Form, Dialog, Sonner (toast), Skeleton, Sheet, Table, Badge.
**Acceptance criteria:**
- `/` renders a Button using shadcn primitives
- Theme toggle works (system / light / dark)
- Colors match the standards (stone base, amber primary)
- Inter font loads
**Dependencies:** FND-009

---

### FND-011 — TanStack Query setup
**Status:** TODO
**Description:** Install TanStack Query and Query Devtools. Configure a QueryClient at the app root. Add a demo query against `/api/health` using the generated client.
**Acceptance criteria:**
- `/` successfully fetches and displays the API health response via TanStack Query
- Query devtools available in dev
- Default query options documented (stale time, retry policy)
**Dependencies:** FND-008, FND-010

---

### FND-012 — Vercel deployment config
**Status:** TODO
**Description:** Add `vercel.json` configuring the web SPA build and the API serverless function. Confirm both deploy to a single Vercel project. Document required env vars in `docs/deploy.md`.
**Acceptance criteria:**
- A preview deploy succeeds end-to-end (web + API)
- Deployed API health endpoint responds
- Deployed web app fetches the deployed API successfully
**Dependencies:** FND-005, FND-009

---

### FND-013 — Cron secret middleware
**Status:** TODO
**Description:** Add middleware that verifies the `Authorization` header against `CRON_SECRET` for routes under `/api/cron/*`. Reject anything else with 401. No cron routes exist yet — this just establishes the guard for epic 02.
**Acceptance criteria:**
- Unauthenticated request to a sample `/api/cron/ping` returns 401
- Authenticated request (correct secret) returns 200
- Secret read from env, with a startup check that fails fast if missing
**Dependencies:** FND-005

---

### FND-014 — Better Auth setup (Google + Discord OAuth)
**Status:** TODO
**Description:** Install Better Auth in `services/api`. Configure Google and Discord OAuth providers. No email magic link, no Resend integration in MVP — keeping the auth surface minimal until there's a reason to expand it. Auth tables generated via Drizzle.
**Acceptance criteria:**
- `POST /api/auth/sign-in/social` with `provider: "google"` initiates Google flow
- `POST /api/auth/sign-in/social` with `provider: "discord"` initiates Discord flow
- Authenticated routes have access to `c.get('user')` via middleware
- Sample `/api/me` route returns the current user
- `.env.example` lists `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
**Dependencies:** FND-005, FND-004

---

### FND-015 — Auth UI in the web app
**Status:** TODO
**Description:** Build sign-in page using Better Auth client SDK and shadcn primitives. Two OAuth buttons (Google, Discord). Build sign-out flow. Add an `<AuthGuard>` for protected routes.
**Acceptance criteria:**
- Unauthenticated users hitting a protected route are redirected to `/sign-in`
- Sign-in via Google works end-to-end
- Sign-in via Discord works end-to-end
- Sign-out clears session and returns to `/sign-in`
- All four states (loading, empty/initial, error, happy) implemented
**Dependencies:** FND-014, FND-011

---

### FND-016 — CI pipeline (typecheck, lint, test, build)
**Status:** TODO
**Description:** GitHub Actions workflow that runs on every PR: typecheck both packages, lint, run unit tests, build both packages. Vercel handles preview deploys via its own GitHub integration.
**Acceptance criteria:**
- PR opens → CI runs all four jobs in parallel
- Failures block merge (branch protection rule set)
- CI completes in under 5 minutes on a no-change PR
**Dependencies:** FND-003, FND-005, FND-009

---

### FND-017 — Neon per-PR branch on preview deploys
**Status:** TODO
**Description:** Wire Neon's GitHub integration so each PR gets a fresh Postgres branch. Migrations run against the branch on every push. Vercel preview deploys point to the branch via env var.
**Acceptance criteria:**
- Opening a PR creates a Neon branch with the latest schema
- Closing the PR removes the branch
- Preview deploy uses the PR's branch, not main
**Dependencies:** FND-012, FND-004
