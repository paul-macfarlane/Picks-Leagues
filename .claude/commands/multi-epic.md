---
description: Run multiple backlog epics through the pipeline. Plans all epics upfront; implements epic by epic with one commit per ticket; opens one PR at the end.
argument-hint: <epic-ids-comma-separated> [--autonomous]
---

# /multi-epic — large-scope workflow

Run multiple epics through the development pipeline. Planning happens upfront across all epics so the human sees the whole shape before any code is written. Implementation is then epic by epic, ticket by ticket. One PR at the end covers everything. This is the large-scope variant from `process-definition.md`.

**Use sparingly.** Most work fits `/ticket` or `/epic`. Reach for `/multi-epic` only when a coherent capability spans multiple epics that should ship together (e.g., "the Pick'em League MVP" might cross epics 03, 04, 09).

**Epic IDs are always required for this command** — unlike `/ticket` and `/epic`, there's no "next available" default. The scope of a multi-epic run is too large to leave to inference; the human chooses what bundle ships together.

## Arguments

- `$1` — comma-separated epic identifiers (e.g., `01,02,03` or `foundation,sports,leagues`)
- `$2` (optional) — `--autonomous` to run end-to-end. Default is collaborative.

## Pre-flight

1. **Resolve each epic file**. If any are missing, stop.

2. **Collect all tickets across the epics**, in dependency order. Build the cross-epic DAG.

3. **Confirm scope with the user** (always, even in autonomous mode): print the list of epics and total ticket count, ask "proceed?" Reply with one bullet on what's about to happen. Autonomous mode skips later checkpoints but never the initial scope confirmation — a big mistake here costs hours.

4. **Clean working tree check.**

## Branch setup

5. Create a single multi-epic branch: `git checkout -b pm/multi-<epic-numbers-joined>-<short-summary>` (e.g., `pm/multi-01-02-03-mvp-foundation`).

## Phase 1 — All planning upfront

6. Spawn the **planner** subagent for every ticket across all epics, in dependency order. Sequentially.

7. **Collaborative mode:** present the human with a structured view — for each epic, list ticket plans and a one-line summary each. Ask for approval epic by epic (don't dump everything in one wall of text). Loop on changes per ticket.

8. Mark approved plans `APPROVED`.

## Phase 2 — Per-epic, per-ticket implementation loop

For each epic in order:
  For each ticket in that epic in dependency order:
  - Run the implement → review → test → document → commit pipeline (same as `/epic` phase 2)
  - One commit per ticket on the multi-epic branch

After every ticket in an epic completes, update that epic's top-level `**Status:**` to `DONE`.

## Phase 3 — Multi-epic PR

9. Once all tickets across all epics are `DONE`:
    - Spawn **pr-opener** to push and open one PR.
    - PR title: `feat: <short summary> (epics NN, NN, NN)` — keep under 70 chars; use abbreviations if needed.
    - PR body: organized by epic, with each ticket linked to its plan.

10. Report PR URL.

## Stricter checkpoints than /ticket or /epic

Because the blast radius is large:

- **Always** confirm scope upfront, even in autonomous mode.
- **Always** present plans grouped by epic, not as one giant list.
- **Cap fix cycles at 2 per phase**, then escalate — don't grind for an hour on one ticket.
- **First implementation failure** stops the whole flow for user input (autonomous mode included). The cost of grinding past a confused state is worse than the cost of a single human check-in.

## Parallel epics?

**Default: no.** Even if two epics seem disjoint, they share `main` and may share infrastructure (e.g., the cron dispatcher in epic 02 is consumed by every scoring epic). Sequential is the safe default.

If you really believe two epics are independent and want to parallelize, ask the human first.

## Output

- PR URL
- Per-epic, per-ticket status summary
- Anything that didn't complete and why
