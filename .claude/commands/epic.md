---
description: Run a full backlog epic through the planner → implementer → reviewer → tester → documenter pipeline, one ticket at a time, with a single PR at the end. If no epic is given, picks the next available epic.
argument-hint: [<epic-id>] [--autonomous]
---

# /epic — medium-scope workflow

Run an entire epic through the development pipeline. Planning happens upfront across all tickets in the epic; implementation, review, testing, and documentation happen ticket by ticket; one commit per ticket; one PR at the end. This is the medium-scope variant from `process-definition.md`.

## Arguments

- `$1` (optional) — epic identifier. Accepted forms:
  - Epic number (`01`, `04`, `09`)
  - Epic file name (`01-foundation.md`, `04-pickem-league-mvp.md`)
  - Epic short name (`foundation`, `pickem`, `polish`)
  - **If omitted, the next available epic is chosen** (see "Default epic selection" below).
- `$2` (optional, or `$1` if no epic given) — `--autonomous` to run end-to-end. Default is collaborative.

## Default epic selection (when no ID given)

1. Walk the backlog epic files in numerical order.
2. Pick the first epic that has at least one ticket with `**Status:** TODO`.
3. Skip epics whose own first eligible TODO ticket is blocked by an unfinished dependency in an earlier epic — surface those as "blocked" and recommend the user resume the earlier epic first.
4. If every epic is `DONE`, report it and stop.

After picking, **always** show the user what was selected (epic number, name, how many TODO tickets remain) before proceeding — even in autonomous mode.

## Pre-flight

1. **Resolve the epic file** under `docs/backlog/`. If `$1` is omitted, run default epic selection. If not found, stop and ask.

2. **List the tickets** in the file and their current Status. If any are already `IN_PROGRESS`, `IN_REVIEW`, or `DONE`, ask the user whether to:
   - Skip the in-progress ones and only do the TODOs
   - Resume from where things stopped
   - Stop

3. **Determine ticket order.** Use the explicit `Dependencies:` lines to build a DAG. Tickets with no unresolved deps go first; parallelize where possible **within the conversation context** (sequential agent invocations is the safe default — only attempt parallel agents if the tickets truly touch disjoint paths and you're confident).

4. **Clean working tree check.** `git status` — abort if dirty without user confirmation.

## Branch setup

5. Create a single epic branch: `git checkout -b pm/epic-<NN>-<short-name>` (e.g., `pm/epic-01-foundation`). All ticket commits land on this one branch.

## Phase 1 — Epic-level planning

6. Spawn the **planner** subagent **per ticket**, sequentially in dependency order. For each ticket:
   - Plan goes to `docs/plans/<ticket-id-lowercase>.md`
   - In collaborative mode, surface clarifying questions in batches (do all planning before any implementation, so the human sees the whole shape upfront)
   - In autonomous mode, plan all tickets, then proceed

7. **Collaborative mode:** present the user with the full set of plans (links + one-line summary per plan). Ask: "Approve all plans, or call out changes?" Loop on changes ticket by ticket.

8. Mark each approved plan's front Status as `APPROVED`.

## Phase 2 — Per-ticket implementation loop

For each ticket in dependency order:

9. Update ticket Status to `IN_PROGRESS`.

10. Spawn **implementer**. On blocker → surface (collab) or replan once (auto), then BLOCKED if still stuck.

11. Spawn **reviewer**. APPROVE → continue. REQUEST_CHANGES → fix loop (cap 2). BLOCK → stop epic.

12. Update Status to `IN_REVIEW`.

13. Spawn **tester**. PASS → continue. FAIL → fix loop. NEEDS_HUMAN (collab UI) → wait for human.

14. Spawn **documenter**. Status flips to `DONE`. Plan flips to `IMPLEMENTED`.

15. **Commit this ticket's work.** Use the pr-opener for the commit step only (the PR open step is deferred to the end). One commit per ticket, Conventional Commits scoped by the epic.

16. Move to the next ticket. Repeat 9–15.

## Phase 3 — Epic PR

17. Once every ticket in the epic is `DONE`:
    - Spawn **pr-opener** to push the branch and open one PR.
    - PR title: `<type>(<scope>): epic NN <short title>` (e.g., `feat(foundation): epic 01 monorepo + Hono + Drizzle + auth skeleton`).
    - PR body: list of tickets with their plan links, single Test plan section.

18. Update the epic's top-level `**Status:**` to `DONE` if all tickets are done.

19. Report the PR URL.

## Parallel implementation (cautious)

If two tickets truly touch disjoint paths (no overlapping files, no schema dependency), you may invoke their implementers in parallel as a single message with multiple Agent tool calls. **Default to sequential.** The cost of a wrong parallel call (merge conflicts within a single branch) is high; the cost of sequential is just elapsed time.

## Failure handling

- Single ticket failure mid-epic: stop the epic, leave that ticket `BLOCKED`, surface to user. Don't try to skip ahead — later tickets may depend on it.
- Reviewer keeps requesting changes after 2 cycles: escalate to user.
- Tester FAIL after 2 fix cycles: escalate.

## Output

- PR URL
- Per-ticket status summary
- Time spent (rough — phase counts, not wall clock)
- Any tickets that didn't complete and why
