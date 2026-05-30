# Deployment Guide

This document covers how to set up and operate the Vercel deployment for Picks Leagues.

## Vercel project setup

One Vercel project hosts both the SPA and the API serverless function.

Steps:

1. Create a new Vercel project and link it to the GitHub repository.
2. Set **Root Directory** to `.` (the repo root). Do not set it to a subdirectory.
3. Leave **Build Command**, **Output Directory**, and **Install Command** at their defaults — Vercel reads `buildCommand` and `installCommand` from `vercel.json`. The build writes `.vercel/output/` directly (Build Output API), so no `outputDirectory` is needed.

### Build pipeline

`pnpm vercel:build` runs `scripts/build-vercel-output.sh`, which writes Vercel's
[Build Output API](https://vercel.com/docs/build-output-api/v3) format directly
to `.vercel/output/`:

```
.vercel/output/
├── config.json                    # routes + spec version
├── static/                        # SPA static files (from apps/web/dist)
└── functions/
    └── api.func/
        ├── .vc-config.json        # function runtime config
        └── index.js               # bundled function
```

The script:
1. Runs `pnpm --filter @picksleagues/api db:migrate` to apply all pending committed migrations against the deploy's `DATABASE_URL` (see [Database migrations on deploy](#database-migrations-on-deploy) below).
2. Builds the web app (`pnpm --filter @picksleagues/web build`) and copies `apps/web/dist/` into `.vercel/output/static/`.
3. Runs esbuild to bundle `services/api/src/vercel-entry.ts` → `.vercel/output/functions/api.func/index.js`.
4. Writes `.vercel/output/functions/api.func/.vc-config.json` declaring the Node 22 runtime.
5. Writes `.vercel/output/config.json` with three routes: `/api/*` → function, filesystem precedence for static assets, SPA fallback to `index.html`.

### Database migrations on deploy

Migrations run as the **first** step of `pnpm vercel:build` (step 1 above). This means:

- **No partial deploys.** The script runs under `set -euo pipefail`. A failed migration exits non-zero, Vercel marks the build failed, and the current deployment keeps serving traffic. The new API bundle is never published.
- **Production and preview each migrate their own `DATABASE_URL`.** Vercel injects the correct connection string for the target environment, so production and preview databases are migrated independently. Each PR preview gets its own isolated Neon branch via `preview-env.yml` (see [Per-PR preview environments](#per-pr-preview-environments)).
- **Template for every schema change.** Edit the schema → run `pnpm --filter @picksleagues/api db:generate` to commit the migration (required by FND-019's CI drift check) → merge to trigger a deploy, which auto-applies the migration before the new function goes live. See `services/api/src/db/migrate.ts` for the runner and `services/api/README.md` § "Migration hygiene" for the hygiene rules.
- **`DATABASE_URL` must be set.** If `DATABASE_URL` is absent for any Vercel environment that builds, `db:migrate` exits with a clear error message and the build fails. This is intentional — a deploy without a database target is broken and should not ship.

When `.vercel/output/` is present after a build, Vercel reads it as the canonical
deploy manifest — no auto-detection is involved. This is why the switch was made:
Vercel's file-system auto-detection did not reliably pick up the bundled function
file (`api/[[...slug]].js`) that CI/CD builds produced from git source, even
though local `vercel --prod` worked (the bundle was already on disk). The Build
Output API eliminates that ambiguity.

Bundling instead of deploying TypeScript source is necessary because Vercel's
`@vercel/node` builder hard-codes `moduleResolution: nodenext` (for Node ESM
alignment) and our codebase uses `moduleResolution: bundler`. The two are
incompatible — nodenext requires `.js` extensions on relative imports, which
our code intentionally omits. Pre-bundling with esbuild skips Vercel's TypeScript
compilation entirely and produces a portable `.js` file with no external
dependencies.

The entry point uses `getRequestListener` from `@hono/node-server` to bridge Vercel's Node.js `IncomingMessage`/`ServerResponse` runtime into Hono's Fetch API handler — Vercel's generic Node functions receive a Node `IncomingMessage`, not a Fetch `Request`.

The repo is public. Preview deploy URLs are visible to anyone who has the link — fine for development but worth noting as a long-term decision (revisit if the app handles sensitive data before launch).

## Environment variables

Set these in the Vercel project under **Settings → Environment Variables**. Vercel lets you scope each variable to **Preview**, **Production**, and/or **Development** environments separately.

| Variable | Preview | Production | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | per-PR Neon branch URL injected by `preview-env.yml` | required | Neon pooled connection string. Each preview PR gets its own isolated branch via the `preview-env.yml` workflow; production uses the project's main database. |
| `VITE_API_BASE_URL` | leave unset | leave unset | Same-origin by default. Documented here for completeness; only set for explicit overrides (none used today). |
| `BETTER_AUTH_SECRET` | required | required | JWT signing + cookie session secret. Generate with `openssl rand -base64 32`. Must be at least 32 chars. |
| `BETTER_AUTH_URL` | single fixed shared-preview-origin value (set once in Vercel dashboard) | required | Canonical app origin for OAuth callback URLs and cookie scoping. **Local dev: `http://localhost:5173`** (the frontend origin — OAuth round-trips through the Vite proxy so the session cookie is scoped to the origin the SPA runs on; using `:3000` would set the cookie on the API port and the SPA wouldn't see it). For Preview, set to the stable shared preview origin registered in the OAuth consoles (see [Per-PR preview environments](#per-pr-preview-environments)). At runtime, `VERCEL_URL` (Vercel's per-deploy host without scheme) is a lower-priority fallback for non-OAuth verification; `BETTER_AUTH_URL` always wins when set. |
| `GOOGLE_CLIENT_ID` | required for OAuth | required for OAuth | Google OAuth app client ID. Required for end-to-end sign-in via Google; API boots without it (Google provider is silently omitted). |
| `GOOGLE_CLIENT_SECRET` | required for OAuth | required for OAuth | Google OAuth app client secret. |
| `DISCORD_CLIENT_ID` | required for OAuth | required for OAuth | Discord OAuth app client ID. Required for end-to-end sign-in via Discord; API boots without it (Discord provider is silently omitted). |
| `DISCORD_CLIENT_SECRET` | required for OAuth | required for OAuth | Discord OAuth app client secret. |

Important: `VITE_*` variables are baked into the SPA bundle at **build time**, not read at runtime. Changing a `VITE_*` variable requires a redeploy to take effect. All other variables are read at runtime per serverless function invocation.

### How to set env vars in Vercel

1. Open your project in the Vercel dashboard.
2. Navigate to **Settings → Environment Variables**.
3. Add each variable, selecting the appropriate environment scope (Preview / Production / Development).
4. For sensitive values (secrets, connection strings), never commit them to the repo. Only `.env.example` files belong in version control.

## Deploy workflow

1. Push a branch and open a pull request.
2. Vercel automatically builds a preview deploy and posts the URL as a PR check.
3. Open the preview URL and verify the home page loads and the "API status: OK" card shows the server timestamp.
4. Merge the PR — Vercel deploys to production automatically.

## Verification on a fresh preview

Run these checks after each deploy to confirm the full web → API path is working.

1. API health endpoint responds:
   ```
   curl https://<preview>.vercel.app/api/health
   ```
   Expected: `{ "status": "ok", "time": "<iso8601-utc>" }`

2. OpenAPI spec is available:
   ```
   curl https://<preview>.vercel.app/api/openapi.json
   ```
   Expected: a valid OpenAPI 3.0 JSON document.

3. Web → API loop works: visit `https://<preview>.vercel.app/` in a browser. The home page should render and the "API status: OK" card should show a recent UTC timestamp. If the card shows an error, the web-to-API path is broken.

## Local vs deployed parity

`pnpm dev` runs the Vite dev server at `:5173` and the API at `:3000`. The Vite dev server proxies `/api/*` requests to `:3000`, so the web app uses relative URLs (`/api/health`) in both environments:

- **Locally:** Vite proxy forwards `/api/*` to the API dev server at `:3000`.
- **Deployed:** Vercel routes `/api/*` directly to the serverless function at `.vercel/output/functions/api.func/index.js` (bundled from `services/api/src/vercel-entry.ts` by `pnpm vercel:build`).

Both environments are same-origin from the browser's perspective for every route — including Better Auth's `/api/auth/*`. The web app always hits the API via a relative URL, which the Vite proxy resolves locally and Vercel resolves on the same deployed domain. No CORS middleware is wired on the API. If a cross-origin consumer ever appears (e.g., a native mobile client hitting prod directly, or a third-party embed), CORS will be added then with a finite allowlist and `credentials: true` — never wildcard.

## Per-PR preview environments

Every open pull request gets its own isolated Neon database branch, so reviewers can sign in, create leagues, and make picks without ever touching production data. The workflow is:

1. **PR opened or updated (`preview-env.yml`)** — creates (or reuses) a Neon branch named `preview/pr-<number>` forked from a dedicated `preview-baseline` branch, then sets a git-branch-scoped `DATABASE_URL` env var on the Vercel project via the Vercel REST API. When Vercel's Git integration builds the preview deploy it injects this `DATABASE_URL`, and FND-020's migrate step runs against the PR's isolated branch before the new bundle goes live.

2. **PR merged or closed (`preview-cleanup.yml`)** — deletes the Neon branch and the branch-scoped Vercel `DATABASE_URL` env var. No orphaned branches accumulate.

### Auth on preview deploys (Option B — shared preview origin)

Google OAuth requires exact-match redirect URIs; Vercel's per-PR preview URLs are random and change with every push, so they cannot be pre-registered. The solution is one stable shared preview origin registered once:

- Pick a stable preview hostname (e.g. a Vercel alias like `picks-leagues-preview.vercel.app`). **This hostname must be confirmed by the human and registered in the OAuth consoles before live verification.**
- Register `<stable-preview-origin>/api/auth/callback/google` and `.../callback/discord` once in the Google Cloud console and Discord developer portal.
- Set `BETTER_AUTH_URL` for the **Preview** environment in the Vercel dashboard to that stable origin. This is set once; `preview-env.yml` does NOT push a per-branch `BETTER_AUTH_URL`.
- Per-PR isolation is at the **database layer** (each PR's Neon branch), not at the frontend origin. OAuth sign-in is exercised one PR at a time through the shared preview origin.

### `BETTER_AUTH_URL` runtime precedence

`resolveAuthBaseURL` (in `services/api/src/auth/resolve-auth-base-url.ts`) applies this precedence:

1. `deps.baseURL` (explicit override, used in tests)
2. `process.env["BETTER_AUTH_URL"]` — wins when set, including the fixed shared-preview-origin on preview deploys
3. `https://${process.env["VERCEL_URL"]}` — Vercel injects `VERCEL_URL` (host without scheme) into every function at runtime; used as a fallback for reaching a deploy at its raw per-deploy host for non-OAuth verification
4. Throws with a clear error — local dev and production must have `BETTER_AUTH_URL` set explicitly

### Reviewer runbook

How to exercise a PR preview end-to-end:

1. Wait for the `preview-env.yml` workflow to succeed and Vercel's preview build to complete. **Note:** if a brand-new PR's first preview build races ahead of `preview-env.yml` (build starts before the branch-scoped `DATABASE_URL` is set), re-trigger the Vercel build once `preview-env.yml` has finished.
2. Open the **shared preview origin** (e.g. `https://picks-leagues-preview.vercel.app`) — not the raw per-PR `*.vercel.app` URL. OAuth callbacks are registered for the shared origin only.
3. Sign in with Google or Discord. The session cookie is scoped to the shared preview origin.
4. Create a league, submit picks, check standings. All writes land in the PR's Neon branch — not production.
5. When the PR is merged or closed, `preview-cleanup.yml` deletes the Neon branch and the branch-scoped env var automatically.

### Re-enabling Vercel previews (tracked post-merge step)

Vercel preview deploys are currently temporarily disabled. Before the preview environment system is live, re-enable them:

1. Vercel → Project → Settings → Git: confirm the GitHub repo is connected and preview deployments are enabled for PRs.
2. Settings → Git → Ignored Build Step: set to "Automatic" (clear any custom skip command).
3. Open a throwaway PR and confirm a preview build is triggered and `preview-env.yml` runs first.

### Required secrets (provisioned post-merge)

Add these as GitHub repository secrets before the workflows can run:

| Secret | Required | Where to find it |
| --- | --- | --- |
| `NEON_API_KEY` | yes | Neon dashboard → Account settings → API keys |
| `NEON_PROJECT_ID` | yes | Neon dashboard → Project settings |
| `NEON_PARENT_BRANCH` | yes | Name of the Neon branch to fork previews from (create a dedicated `preview-baseline` branch — do not fork from `main`/production) |
| `NEON_DB_ROLE` | yes | The Neon DB role name used to mint the connection string (the `username` input to `neondatabase/create-branch-action@v5`; typically the role shown in Neon console → Branch → Connection details) |
| `NEON_DB_NAME` | no | The Neon database name; defaults to `neondb` if unset. Set only if the project's database has a different name. |
| `VERCEL_TOKEN` | yes | Vercel dashboard → Account settings → Tokens |
| `VERCEL_ORG_ID` | yes | Vercel dashboard → Team settings → General (Team ID) |
| `VERCEL_PROJECT_ID` | yes | Vercel dashboard → Project settings → General (Project ID) |

Also set in the Vercel dashboard for the **Preview** environment:
- `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` — shared across all previews
- `BETTER_AUTH_URL` — the stable shared preview origin (set once; not per-PR)
