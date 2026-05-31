# Backlog

The source of truth for what gets built and in what order.

## How it's organized

- One file per **epic**, prefixed with its priority order (`01-foundation.md`, `02-sports-data-and-sync.md`, etc.).
- Within an epic, tickets are listed in dependency order. Tickets without dependencies on each other can be done in parallel.
- Each ticket has an id (e.g., `FND-003`), a title, a description, acceptance criteria, dependencies, and a status.

## Status values

- `TODO` — not started
- `IN_PROGRESS` — work has begun, branch exists
- `IN_REVIEW` — PR open
- `DONE` — merged
- `BLOCKED` — has a blocker; the blocker is noted in the ticket
- `MOVED` — relocated to another epic; the ticket's `Status:` line notes where

## Priority order (epic-level)

| # | Epic | Why this priority |
|---|---|---|
| 01 | [Foundation](./01-foundation.md) | Nothing else can start without it |
| 02 | [Sports data & sync (incl. simulator)](./02-sports-data-and-sync.md) | All game modes depend on this. The simulator must precede picks/scoring — it is the only way to test those in the off-season |
| 03 | [League primitives](./03-league-primitives.md) | Reused across Pick'em, Elimination, and H2H modes |
| 04 | [Pick'em League — MVP config](./04-pickem-league-mvp.md) | First game mode per the MVP spec build order. Standard scoring, SU, no money pick — simplest config |
| 05 | [Pick'em League — optional settings](./05-pickem-league-optional.md) | Layer on Confidence, ATS, money pick once foundation is stable |
| 06 | [Elimination League](./06-elimination-league.md) | Second per build order. Broad appeal, reuses league infrastructure |
| 07 | [App-Wide Pick'em](./07-app-wide-pickem.md) | Third per build order. Reuses slate + scoring; introduces app-level leaderboards |
| 08 | [Weekly H2H Pick'em](./08-weekly-h2h.md) | Last per build order. Matchmaking adds complexity that doesn't exist in league modes |
| 09 | [Cross-cutting polish](./09-cross-cutting.md) | Observability, performance, a11y audit, brand pages — partially done throughout, audited at the end |

## How tickets get worked

See [process-definition.md](../../process-definition.md) for the development workflow variants (small-scope, medium-scope, large-scope tasks; varying levels of human involvement).

## Conventions

- A ticket is **sized for ~1 day of agent work**. If it grows past that, split it.
- Every ticket lists its **dependencies** as ticket ids. Empty list = ready to start.
- Acceptance criteria are **testable**. "Looks good" is not a criterion.
- UI tickets always require loading, empty, and error states per the [UI design standards](../ui-design-standards.md).
- Backend tickets always require tests per the [code standards](../code-standards.md).

## Reference implementations (`legacy/`)

A working prior version of this app lives in the **`legacy/`** folder at the repo root. It is **gitignored** — local-only reference material, not part of the committed tree — so it's available when planning/implementing on a local checkout but never shipped or reviewed as part of a PR. (It's also excluded from lint and prettier; it is not this codebase.)

When a ticket has a real, proven precedent there, consult it before designing from scratch. Notably, the **season-replay simulator and the ESPN/sync pipeline** (epic 02) were built and proven in `legacy/`:

- `legacy/src/lib/simulator.ts` — `initializeSeason(year)`, `resetSeason`, `getSimulatorStatus` (SPT-010)
- `legacy/src/lib/sync/` — week-scoped sync handlers reused by both crons and the simulator (SPT-012)
- `legacy/src/lib/espn/` — ESPN client + per-resource fetchers (SPT-003–005)
- `legacy/src/components/admin/simulator-panel.tsx`, `legacy/src/actions/admin/simulator.ts` — admin simulator UI (SPT-013)
- `legacy/src/lib/db/schema/external.ts` — `external_*` bridge tables mapping ESPN ids → internal ids
- `legacy/docs/BACKGROUND_JOBS.md`, `legacy/docs/SYNC_ARCHITECTURE.md` — the written architecture

Treat it as a guide, not gospel: the legacy app was Next.js (server actions, `src/`); this one is a Hono + Drizzle monorepo (`services/api`, `apps/web`). Port the design, not the framework specifics.
