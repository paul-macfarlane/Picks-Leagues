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
- **Production and preview each migrate their own `DATABASE_URL`.** Vercel injects the correct connection string for the target environment, so production and the persistent staging preview are migrated independently against their own Neon branches (see [Preview environment (persistent staging)](#preview-environment-persistent-staging)).
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
| `DATABASE_URL` | persistent staging Neon branch (scoped to the `staging` branch) | required | Neon pooled connection string. The persistent staging preview points at a long-lived `staging` Neon branch; production uses the project's main database. See [Preview environment (persistent staging)](#preview-environment-persistent-staging). |
| `VITE_API_BASE_URL` | leave unset | leave unset | Same-origin by default. Documented here for completeness; only set for explicit overrides (none used today). |
| `BETTER_AUTH_SECRET` | required | required | JWT signing + cookie session secret. Generate with `openssl rand -base64 32`. Must be at least 32 chars. |
| `BETTER_AUTH_URL` | stable staging origin, scoped to the `staging` branch (set once in Vercel dashboard) | required | Canonical app origin for OAuth callback URLs and cookie scoping. **Local dev: `http://localhost:5173`** (the frontend origin — OAuth round-trips through the Vite proxy so the session cookie is scoped to the origin the SPA runs on; using `:3000` would set the cookie on the API port and the SPA wouldn't see it). For Preview, set to the stable staging origin registered in the OAuth consoles (see [Preview environment (persistent staging)](#preview-environment-persistent-staging)). At runtime, `VERCEL_URL` (Vercel's per-deploy host without scheme) is a lower-priority fallback for non-OAuth verification; `BETTER_AUTH_URL` always wins when set. |
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

## Preview environment (persistent staging)

Signed-in preview testing runs through a single, long-lived **staging** environment rather than an ephemeral per-PR one. One persistent Neon branch and one stable subdomain are set up once; you preview by pushing to the `staging` git branch. This keeps OAuth working without re-registering redirect URIs or reassigning the domain for every PR.

> **Why not per-PR previews?** Google and Discord require exact-match OAuth redirect URIs and forbid `*.vercel.app` wildcards, and a Vercel domain binds to one branch at a time — so per-PR previews would mean re-registering or reassigning the origin for every PR. A single persistent staging origin avoids that entirely. The trade-off is one shared preview database instead of an isolated branch per PR, which is fine for a small team testing one change at a time. (An earlier FND-022 design automated per-PR Neon branches via two GitHub Actions workflows; it was descoped in favor of this simpler model — see `docs/plans/fnd-022.md`. Only the `resolveAuthBaseURL` auth code from that work remains.)

### One-time setup

1. **Git branch.** Create a long-lived branch and push it: `git branch staging && git push -u origin staging`. You preview by pushing here; never delete it.

2. **Neon `staging` branch.** In the Neon console → **Create new branch**:
   - **Name:** `staging`
   - **Parent branch:** `production` (a Neon branch is copy-on-write and isolated — writing to it never affects production).
   - **Auto-delete:** **disabled / Never** — the default "After 1 day" would delete your persistent environment.
   - **Branch type:** **Branch data and schema** (the default). Do *not* use "Branch schema only": it copies table structures but not the Drizzle `__drizzle_migrations` tracking rows, so the deploy-time `db:migrate` step would try to re-apply migration `0000` against already-existing tables and fail.
   - Copy the branch's **pooled** connection string (host contains `-pooler`) for the next step.

3. **Vercel env vars** (Settings → Environment Variables), each scoped to **Preview** + Git branch `staging`:
   - `DATABASE_URL` → the staging Neon pooled connection string
   - `BETTER_AUTH_URL` → the stable staging origin: `https://staging.picksleagues.com`
   - Ensure `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` exist for Preview (these can be Preview-wide).

4. **Stable subdomain** (Settings → Domains): add `staging.picksleagues.com` and assign it to Git branch `staging`. If DNS is managed at GoDaddy, add the `CNAME` Vercel shows (host `staging` → `cname.vercel-dns.com`).

5. **OAuth consoles** (once): register `https://staging.picksleagues.com/api/auth/callback/google` in the Google Cloud console and `https://staging.picksleagues.com/api/auth/callback/discord` in the Discord developer portal. Auth is mounted at `/api/auth/*` (`services/api/src/app.ts`).

6. **Enable preview deploys, but only for `staging`.** Previews had been limited to the production branch only; re-enable them, then restrict them so *only* the `staging` branch builds a preview (not every PR/feature branch):
   - Keep the **Preview** environment's **Branch Tracking** toggle **Enabled** (Settings → Environments → Preview). On the Hobby plan the per-branch Branch Tracking *filter* ("Branch is …") is a Pro/Enterprise feature and is not available — so leave the tracking on and restrict via the Ignored Build Step below instead.
   - Project → **Settings → Build and Deployment** (or **Settings → Git** in some UI versions) → **Ignored Build Step** → set a custom command:
     ```bash
     if [ "$VERCEL_GIT_COMMIT_REF" = "main" ] || [ "$VERCEL_GIT_COMMIT_REF" = "staging" ]; then exit 1; else exit 0; fi
     ```
     This runs before every build. **Exit code is inverted: `exit 1` proceeds with the build, `exit 0` cancels it.** The command builds `main` (production) and `staging`, and cancels every other branch. `main` **must** stay in the condition — this step also gates production, so omitting it would stop prod deploys. `$VERCEL_GIT_COMMIT_REF` is the branch name Vercel injects at build time.
   - Verify: push a throwaway feature branch → its deployment shows **"Canceled"** (no build); push to `staging` → it **builds** and serves at `staging.picksleagues.com`; a push to `main` still deploys to production. (GitHub Actions CI still runs on all PRs — it's independent of Vercel deploys.)

### Day-to-day workflow

1. Merge or push the change you want to preview into the `staging` branch.
2. Vercel builds a preview deploy for `staging`; FND-020's migrate hook applies any new committed migrations to the staging Neon branch before the bundle goes live.
3. Open `https://staging.picksleagues.com` and sign in. The origin never changes, so OAuth always works.
4. Iterate by pushing to `staging` again. To reset the environment, branch a fresh Neon `staging` from production and repoint `DATABASE_URL`.

### `BETTER_AUTH_URL` runtime precedence

`resolveAuthBaseURL` (in `services/api/src/auth/resolve-auth-base-url.ts`) applies this precedence:

1. `deps.baseURL` (explicit override, used in tests)
2. `process.env["BETTER_AUTH_URL"]` — wins when set, including the fixed staging origin on preview deploys
3. `https://${process.env["VERCEL_URL"]}` — Vercel injects `VERCEL_URL` (host without scheme) into every function at runtime; a fallback for reaching a deploy at its raw per-deploy host for non-OAuth verification
4. Throws with a clear error — local dev and production must have `BETTER_AUTH_URL` set explicitly
