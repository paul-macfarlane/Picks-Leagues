# Plans

One file per ticket: `<ticket-id-lowercase>.md` (e.g., `fnd-001.md`, `pkm-007.md`).

Plans are produced by the **planner** subagent, approved by the human (in collaborative mode) or auto-approved (in autonomous mode), executed by the **implementer**, and marked `IMPLEMENTED` by the **documenter** once the ticket lands.

## Lifecycle

| Plan Status | Set by | Means |
|---|---|---|
| `PROPOSED` | planner | Plan written, awaiting approval |
| `APPROVED` | skill (after user OK) | Implementer can start |
| `IMPLEMENTED` | documenter | Ticket landed; plan is now a historical record |

## Why we keep them

- They survive across sessions. If a ticket spans days, the next session reads the plan instead of re-deriving it.
- They're a paper trail. The plan + the diff = the full story of why the code looks the way it does.
- They make reviews faster. The reviewer compares the diff against the plan, not against a blank slate.

## What they aren't

- Not user-facing docs. Players never see these.
- Not exhaustive specs. They're concrete enough for the implementer; not so detailed that they re-derive the codebase.
- Not architectural decision records. ADRs would go elsewhere if we ever need them; plans are tactical.

## Format

See the **planner** subagent definition (`.claude/agents/planner.md`) for the canonical template.
