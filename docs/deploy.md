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
1. Builds the web app (`pnpm --filter @picksleagues/web build`) and copies `apps/web/dist/` into `.vercel/output/static/`.
2. Runs esbuild to bundle `services/api/src/vercel-entry.ts` → `.vercel/output/functions/api.func/index.js`.
3. Writes `.vercel/output/functions/api.func/.vc-config.json` declaring the Node 22 runtime.
4. Writes `.vercel/output/config.json` with three routes: `/api/*` → function, filesystem precedence for static assets, SPA fallback to `index.html`.

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
| `DATABASE_URL` | required | required | Neon pooled connection string. A placeholder value is fine until FND-017 (Neon per-PR branch) and FND-014 (Better Auth) are wired. FND-017 will inject the per-PR branch URL automatically. |
| `VITE_API_BASE_URL` | leave unset | leave unset | Same-origin by default. Documented here for completeness; only set for explicit overrides (none used today). |

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

Both environments are same-origin from the browser's perspective, so CORS is not configured on the API — the middleware is absent intentionally. If FND-014 introduces a cross-origin client (mobile, third-party), a finite allowlist with `credentials: true` will be added then; never a wildcard.

## Future env-var consumers

These tickets will add additional environment variables:

- **FND-013** — `CRON_SECRET` (cron endpoint authorization)
- **FND-014** — `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
- **FND-017** — Neon per-PR branch wiring (injects `DATABASE_URL` automatically for each preview deploy)
