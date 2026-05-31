# Process definition — the development harness

This is the workflow the Claude Code harness implements for this repo. The three
skills (`/ticket`, `/epic`, `/multi-epic`) are the entry points; this file is the
conceptual overview they share. The skills themselves live in
[`.claude/commands/`](.claude/commands/) and are the authoritative, step-by-step
source — when this doc and a command file disagree, the command file wins.

## Why a harness

Work moves through a fixed pipeline of specialized subagents so that planning,
implementation, review, testing, and documentation each get a dedicated pass with
its own context. Plans are written to disk (`docs/plans/<ticket-id>.md`) so a unit
of work survives across sessions and is reviewable before any code is written.

## Scopes

Pick the entry point by how much work ships together. One PR per run, squashed on
merge.

| Skill | Scope | Unit of work | Branch | Commits | PR |
|---|---|---|---|---|---|
| [`/ticket <id>`](.claude/commands/ticket.md) | small | one backlog ticket | `pm/<ticket-id>-<desc>` | one | one |
| [`/epic <id>`](.claude/commands/epic.md) | medium | one full epic | `pm/epic-<NN>-<name>` | one per ticket | one |
| [`/multi-epic <ids>`](.claude/commands/multi-epic.md) | large | several epics that ship together | `pm/multi-<NN-NN>-<summary>` | one per ticket | one |

`/ticket` and `/epic` choose the next available work item if no id is given.
`/multi-epic` always requires explicit epic ids — the scope is too large to infer.
Use `/multi-epic` sparingly; most work fits `/ticket` or `/epic`.

## Modes

Both apply to every scope:

- **Collaborative (default).** Pauses for human input at clarifying-question time
  (planner) and after the implementer for human testing of UI work. Plans are
  approved by the human before implementation.
- **`--autonomous`.** Runs end-to-end, recording assumptions instead of asking, and
  only stops for hard blockers. `/multi-epic` still always confirms scope upfront,
  even autonomous — a wrong call there costs hours.

## The pipeline

Each phase is a subagent (defined in [`.claude/agents/`](.claude/agents/)). For
`/epic` and `/multi-epic`, planning happens upfront across all tickets so the human
sees the whole shape before any code is written; the implement→document loop then
runs ticket by ticket.

1. **planner** — reads the ticket, relevant docs, and existing code, then writes
   `docs/plans/<ticket-id>.md`. Collaborative: asks clarifying questions and loops
   until "plan ready," then the human approves. Autonomous: records choices in an
   "Assumptions" section.
2. **implementer** — executes the approved plan; writes/edits code and runs
   lint/typecheck/tests as it goes. On a blocker: surface (collaborative) or replan
   once (autonomous), then mark `BLOCKED` if still stuck.
3. **reviewer** — read-only; reviews the diff against code standards, UI standards,
   architecture, and the ticket's acceptance criteria. Verdict: `APPROVE`,
   `REQUEST_CHANGES` (fix loop, capped at 2 cycles), or `BLOCK`.
4. **tester** — runs the test suite, lint, and typecheck; for UI tickets verifies in
   a real browser via the dev server. Verdict: `PASS`, `FAIL` (fix loop, capped at
   2 cycles), or `NEEDS_HUMAN` (collaborative UI — relays the dev-server URL and
   test plan and waits).
5. **documenter** — flips the ticket `Status` to `DONE` and the plan to
   `IMPLEMENTED`, records implementation notes in the plan, and updates any docs the
   change affected (README, runbook, schema headers). Does not write new docs unless
   the ticket requires it.
6. **pr-opener** — commits (Conventional Commits, scoped by epic), pushes the
   branch, and opens the PR via `gh`. Never force-pushes; never targets `main`
   directly.

## Where state lives

- **Plans:** `docs/plans/<ticket-id>.md`. Plan status moves `PROPOSED` → `APPROVED`
  → `IMPLEMENTED`.
- **Ticket status:** the `**Status:**` line on each ticket in `docs/backlog/`. Values
  are `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `BLOCKED`, and `MOVED` (relocated to
  another epic; the line notes where). The SessionStart hook surfaces any
  `IN_PROGRESS` or `BLOCKED` tickets at the start of each session.

## Failure handling

If a phase fails irrecoverably, leave the ticket `Status` accurate to where things
stopped (`IN_PROGRESS` or `BLOCKED`), commit nothing partial that hasn't been
reviewed, and hand off cleanly to the human. Fix loops (reviewer/tester) cap at 2
cycles before escalating. In `/multi-epic`, the first implementation failure stops
the whole flow for human input, autonomous mode included.
