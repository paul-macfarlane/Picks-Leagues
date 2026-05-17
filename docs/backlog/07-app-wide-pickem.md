# Epic 07: App-Wide Pick'em Competition

Third game mode per build order. App-level (not league-scoped). Confidence picks; weekly + season leaderboards; SU and ATS as **separate competitions**.

**Status:** TODO

## Tickets

### AWP-001 — Schema: slates + app-wide confidence picks
**Status:** TODO
**Description:** `app_slates` (week_id, pick_type, game_ids). `app_picks` (user, slate, game, selected_team, confidence_rank, accepted_spread).
**Acceptance criteria:**
- Migrations run
- Unique constraint: one slate per (week, pick_type)
- Unique rank per (user, slate)
**Dependencies:** SPT-001

---

### AWP-002 — Slate generation: Sun/Mon games (Thu fallback if <8)
**Status:** TODO
**Description:** Job runs when the schedule is set for the week. Sunday + Monday games only. If fewer than 8, fall back to including Thursday games and shift submission deadline.
**Acceptance criteria:**
- Idempotent (re-running doesn't change a published slate)
- Thursday fallback correctly toggles deadline
- Both SU and ATS slates produced
**Dependencies:** AWP-001, SPT-006

---

### AWP-003 — Routes: get current slate + my picks
**Status:** TODO
**Description:** `GET /api/app-pickem/slates/current?pickType=SU|ATS`. `GET /api/app-pickem/picks/me?pickType=SU|ATS`.
**Acceptance criteria:**
- Returns the current week's published slate
- My-picks returns this week's submission or empty
- Integration tested
**Dependencies:** AWP-002

---

### AWP-004 — Route: submit slate picks
**Status:** TODO
**Description:** All-game submission with unique confidence ranks. Re-submission rules: rank-only vs pick changes; spread re-acceptance for ATS.
**Acceptance criteria:**
- Partial submissions rejected
- Duplicate ranks rejected
- Rank-only PATCH allowed without spread re-acceptance
- Pick-change requires latest spreads on all unstarted picks (ATS)
- Integration tested with simulator clock
**Dependencies:** AWP-003, SPT-011

---

### AWP-005 — Scoring: confidence + cancellation re-pick
**Status:** TODO
**Description:** Pure function. Cancellation re-pick rules per `game-types.md`.
**Acceptance criteria:**
- Table tests including cancellation/re-pick scenarios
- Inherited-confidence on re-pick handled
- No-unstarted-games fallback: push (half confidence value)
**Dependencies:** AWP-001

---

### AWP-006 — Resolver registration + standings materialization
**Status:** TODO
**Description:** Wire into the dispatcher. Weekly + season standings tables for SU and ATS.
**Acceptance criteria:**
- Idempotent on re-dispatch
- Standings update transactionally with scoring
- Integration tested
**Dependencies:** AWP-005, SPT-009

---

### AWP-007 — Routes: weekly + season leaderboards
**Status:** TODO
**Description:** Paginated leaderboards for SU and ATS, weekly and season.
**Acceptance criteria:**
- Tiebreaker column included
- Pagination works
- Integration tested
**Dependencies:** AWP-006

---

### AWP-008 — Frontend: slate view + confidence picker
**Status:** TODO
**Description:** Two competitions visible separately (toggle or two routes). Confidence picker per Epic 05's accessible pattern.
**Acceptance criteria:**
- All four states; mobile-first
- Keyboard-rankable confidence
- Re-acceptance prompt when changing picks (ATS)
**Dependencies:** AWP-004

---

### AWP-009 — Frontend: leaderboards
**Status:** TODO
**Description:** Weekly + season toggle, SU + ATS toggle. Current user highlighted.
**Acceptance criteria:**
- All four states
- Tabular-nums for score columns
- Mobile: condensed columns
**Dependencies:** AWP-007
