# @picksleagues/web

Vite + React 19 + TanStack Router SPA for Picks Leagues.

## Development

```bash
pnpm dev        # start dev server at localhost:5173
pnpm build      # typecheck + production build
pnpm test       # run Vitest suite
pnpm typecheck  # TypeScript check (no emit)
pnpm lint       # ESLint check
```

## TanStack Query defaults

Configured in `src/lib/query-client.ts` via `createQueryClient()`.

| Option | Value | Rationale |
|---|---|---|
| `staleTime` | 30 000 ms (30 s) | Matches the upper bound of the "polling during game windows: 15–30 s" rule in code-standards. Routes that need faster refresh override this per-route. |
| `retry` (queries) | 2 | Tolerates transient network blips and Vercel serverless cold starts without masking real failures. |
| `retry` (mutations) | 0 | TanStack default — retrying non-idempotent writes is unsafe; left at zero. |
| `refetchOnWindowFocus` | true | TanStack default — returning to the tab after a halftime check should show fresh data. |

Per-route polling (scores, live standings) overrides the global `staleTime` as documented in
[docs/code-standards.md](../../docs/code-standards.md) §Frontend "Polling during game windows: 15–30 seconds. Configured per route."
