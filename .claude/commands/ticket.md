---
description: Run a single backlog ticket through the planner → implementer → reviewer → tester → documenter → PR pipeline. If no ticket ID is given, picks the next available TODO ticket.
argument-hint: [<ticket-id>] [--autonomous]
---

# /ticket — small-scope workflow

Run a single backlog ticket through the full development pipeline. This is the small-scope variant from `process-definition.md`.

## Arguments

- `$1` (optional) — ticket ID, e.g. `FND-001`, `PKM-007`. **If omitted, the next available TODO ticket is chosen** (see "Default ticket selection" below).
- `$2` (optional, or `$1` if no ticket ID given) — `--autonomous` to run end-to-end without human checkpoints. Default mode is collaborative.

## Default ticket selection (when no ID given)

Find the next-up ticket by these rules:

1. Walk the backlog epic files in numerical order (`01-foundation.md` first, then `02-...`, etc.).
2. Within each file, walk tickets in file order.
3. Pick the first ticket with `**Status:** TODO` whose `Dependencies:` are all `**Status:** DONE` (or `none`).
4. If no eligible ticket exists, report it: either everything is done, or every remaining TODO is blocked on a `BLOCKED` or `IN_PROGRESS` ticket. Surface the blocker tickets and stop.

After picking, **always** show the user what was selected (ID, title, epic, and the reason it's next up) before proceeding — even in autonomous mode. The user can override with `Ctrl-C` and call `/ticket <other-id>` if they want something else.

## Pre-flight

1. **Parse args.** If `$1` looks like a ticket ID (`<3-4 letters>-<3 digits>`), use it. If `$1` is `--autonomous` or absent, run default ticket selection. Set `MODE=collaborative` unless `--autonomous` is present.

2. **Locate the ticket.** `grep -rn "### ${TICKET_ID} —" docs/backlog/` to find the epic file. If zero matches, stop and ask the user. If multiple, stop — there's a duplicate ID bug to fix first.

3. **Read the ticket.** Confirm the current `**Status:**` is `TODO` (or `BLOCKED` — ask the user before resuming a blocked one). If it's `IN_PROGRESS`, `IN_REVIEW`, or `DONE`, stop and ask the user what they want — resuming, redoing, or canceling.

4. **Check dependencies.** Parse the ticket's `Dependencies:` line. For each, confirm Status is `DONE`. If any dep is not done, stop and ask the user whether to proceed anyway (sometimes the human has a reason; sometimes they want to switch to the dep first).

5. **Confirm a clean working tree.** `git status` — if there are uncommitted changes on the current branch, ask before proceeding.

## Branch setup

6. Create the branch: `git checkout -b pm/<ticket-id-lowercase>-<short-desc>`. Derive the short-desc from the ticket title (kebab-case, ~3-5 words).

7. Update the ticket's `**Status:**` to `IN_PROGRESS` in the epic file (Edit tool).

## Phase 1 — Planner

8. Spawn the **planner** subagent with:
   - Ticket ID
   - Epic file path
   - Mode (collaborative/autonomous)
   - Instruction: write `docs/plans/<ticket-id-lowercase>.md`

9. **Collaborative mode:** if the planner returns clarifying questions, relay them to the user. Pass the user's answers back to the planner (re-invoke with the answers in the prompt). Loop until the planner returns "plan ready."

10. **Show the plan to the user** (read the plan file aloud or quote key sections) and ask: "Approve this plan?" Wait for approval.
    - **Autonomous mode:** skip the approval step but still print the plan summary so it's in the conversation log.

11. Update the plan's front `**Status:**` from `PROPOSED` to `APPROVED` (Edit).

## Phase 2 — Implementer

12. Spawn the **implementer** subagent with:
    - Ticket ID
    - Plan path
    - Branch name
    - Instruction: execute the plan, run local checks as you go

13. If the implementer reports a blocker, surface it to the user (collaborative) or attempt one round of replan via the planner (autonomous). If still blocked after replan, update ticket Status to `BLOCKED`, leave a note, and stop.

## Phase 3 — Reviewer

14. Spawn the **reviewer** subagent with:
    - Ticket ID
    - Plan path
    - Branch name

15. Read the reviewer's verdict:
    - **APPROVE** → continue to Phase 4
    - **REQUEST_CHANGES** → spawn implementer again with the reviewer's must-fixes; then re-invoke reviewer. Cap at 2 fix cycles before escalating to the human.
    - **BLOCK** → stop, surface to user, update Status to `BLOCKED`

## Phase 4 — Tester

16. Update ticket Status to `IN_REVIEW`.

17. Spawn the **tester** subagent with:
    - Ticket ID
    - Plan path
    - Branch name
    - Mode

18. Read the tester's verdict:
    - **PASS** → continue to Phase 5
    - **FAIL** → spawn implementer with the failures, then re-test. Cap at 2 cycles.
    - **NEEDS_HUMAN** (collaborative UI tickets) → relay the dev server URL and test plan to the user. Wait for user to confirm "tested, looks good" or report bugs. If bugs, send back to implementer.

## Phase 5 — Documenter

19. Spawn the **documenter** subagent with:
    - Ticket ID
    - Plan path
    - Brief summary of what was implemented and any decisions made along the way (you have this from prior phase reports)

## Phase 6 — PR

20. Spawn the **pr-opener** subagent with:
    - Ticket ID
    - Plan path
    - Branch name
    - Documenter's summary

21. Report the PR URL to the user.

## Final

22. Confirm to the user:
    - Ticket Status is `DONE`
    - PR is open
    - Plan file is marked `IMPLEMENTED`

## Failure handling

If any phase fails irrecoverably, leave the ticket Status accurate to where things stopped (`IN_PROGRESS` or `BLOCKED`), commit nothing partial that hasn't been reviewed, and surface a clean handoff to the human.
