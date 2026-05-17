# Epic 05: Pick'em League — optional settings

Layer Confidence scoring, ATS, and Money Pick onto the working Pick'em League. **Don't start until Epic 04 is in production.**

**Status:** TODO

## Tickets

### PKMO-001 — Confidence scoring: schema + settings
**Status:** TODO
**Description:** Add `confidence_rank` column to picks. Add `Confidence` as a Scoring Type option. Validate uniqueness of ranks per (user, league, week).
**Acceptance criteria:**
- Migration runs
- Settings UI accepts Confidence as a Scoring Type
- DB-level constraint enforces unique rank per user/week
**Dependencies:** PKM-001

---

### PKMO-002 — Scoring: Confidence variant
**Status:** TODO
**Description:** Extend `resolvePickEmLeagueWeek` for Confidence scoring. Pure function additions.
**Acceptance criteria:**
- Table tests per `game-types.md`: correct (full value), incorrect (0), push (half value)
- Fewer-games-than-picks-per-week compression handled (ranks 1–N where N = available games)
**Dependencies:** PKM-002, PKMO-001

---

### PKMO-003 — Routes: submit confidence picks + rank-only updates
**Status:** TODO
**Description:** Differentiate rank-only changes (no spread re-acceptance) from pick changes. Validate unique ranks.
**Acceptance criteria:**
- Rank-only PATCH does not require spread re-acceptance
- Pick-change submissions require spread re-acceptance (ATS leagues)
- Integration tested
**Dependencies:** PKMO-002, PKM-004

---

### PKMO-004 — Frontend: confidence ranking UI
**Status:** TODO
**Description:** Drag-to-rank or numeric picker. Visual representation of confidence weight.
**Acceptance criteria:**
- All four states
- Accessible — keyboard-rankable (not drag-only)
- Visual indicator of pending unsaved rank changes
- Mobile-first; touch-friendly
**Dependencies:** PKMO-003

---

### PKMO-005 — ATS: store accepted spread on pick + settings
**Status:** TODO
**Description:** Pick Type setting = ATS path. Spread stored at submission time. Spread re-acceptance flow on any pick change.
**Acceptance criteria:**
- Pick row records accepted spread at submission
- Pick change forces re-acceptance of latest spreads on all unstarted picks
- Selective freezing not permitted (rejected with clear error)
**Dependencies:** PKM-004

---

### PKMO-006 — Scoring: ATS resolution
**Status:** TODO
**Description:** Extend pick'em scoring for ATS + push rules.
**Acceptance criteria:**
- Table tests covering every Push setting (half, none, full)
- Tests against historical (stored) spreads, not current
**Dependencies:** PKM-002, PKMO-005

---

### PKMO-007 — Frontend: ATS pick selection
**Status:** TODO
**Description:** Show spread next to each team. Re-acceptance prompt when changing any pick.
**Acceptance criteria:**
- All four states
- Spread visible and clearly attached to the team it favors
- Re-acceptance prompt explains what's happening before the user confirms
**Dependencies:** PKMO-005, PKM-013

---

### PKMO-008 — Money Pick: settings + designation route
**Status:** TODO
**Description:** Optional setting on the league. One pick per week designated; designation can move pre-kickoff.
**Acceptance criteria:**
- Setting toggle works pre-start
- `PATCH /api/leagues/:id/picks/money` changes designation pre-kickoff only
- Integration tested
**Dependencies:** PKM-001

---

### PKMO-009 — Scoring: Money Pick modifiers
**Status:** TODO
**Description:** Standard and Confidence variants. Edge cases for undesignated, cancelled-with-no-replacement.
**Acceptance criteria:**
- Table tests for correct/incorrect/push under both scoring types
- Undesignated case: all picks score as regular (no penalty)
- Cancelled money pick with no unstarted picks: push (no money pick modifier)
**Dependencies:** PKMO-008, PKM-002, PKMO-002

---

### PKMO-010 — Frontend: Money Pick designation UI
**Status:** TODO
**Description:** Visual designation on selected pick. Re-designate before kickoff.
**Acceptance criteria:**
- All four states
- Designation is reachable and operable via keyboard
- Visual emphasis differentiates money pick from regular picks
**Dependencies:** PKMO-008, PKM-013
