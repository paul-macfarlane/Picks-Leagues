# Backlog

The source of truth for what gets built and in what order.

## How it's organized

- One file per **epic**, prefixed with its priority order (`01-foundation.md`, `02-sports-data-and-sync.md`, etc.).
- Within an epic, tickets are listed in dependency order. Tickets without dependencies on each other can be done in parallel.
- Each ticket has an id (e.g., `FND-003`), a title, a description, acceptance criteria, dependencies, and a status.

## Status values

- `TODO` — not started
- `IN PROGRESS` — work has begun, branch exists
- `IN REVIEW` — PR open
- `DONE` — merged
- `BLOCKED` — has a blocker; the blocker is noted in the ticket

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
