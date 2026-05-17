# Epic 06: Elimination League

Second game mode per build order. Reuses league infrastructure from Epic 03 and slate/visibility patterns from Epic 04.

**Status:** TODO

## Tickets

### ELM-001 — Schema: elimination picks, status, used teams
**Status:** TODO
**Description:** `elimination_picks` (user, league, week, team_id, accepted_spread), `elimination_status` (lives remaining, eliminated_week, buy_back_used). Unique (user_id, league_id, team_id) enforces team-once-per-season.
**Acceptance criteria:**
- Migrations run
- Constraint prevents re-use of a team
- Indexed for fast week + league queries
**Dependencies:** LGE-001, SPT-001

---

### ELM-002 — Settings: required + optional
**Status:** TODO
**Description:** Required: Start Week, End Week, Pick Type, Push/Tie Resolution, Tiebreaker. Optional: Lives/Strikes, Buy-back.
**Acceptance criteria:**
- Settings stored and validated per the elimination type
- Default values match `game-types.md`
**Dependencies:** LGE-002, ELM-001

---

### ELM-003 — Route: submit elimination pick
**Status:** TODO
**Description:** One pick per week, team unused, game unstarted. Re-pick allowed before kickoff. No changes after kickoff.
**Acceptance criteria:**
- Used-team submission rejected
- Kicked-off-game submission rejected
- Re-pick before kickoff replaces the pick
- Integration tested with simulator
**Dependencies:** ELM-002, SPT-011

---

### ELM-004 — Scoring: resolveEliminationWeek
**Status:** TODO
**Description:** Pure function. Inputs: picks, results, settings. Output: outcomes (`advance` / `eliminated` / `push`).
**Acceptance criteria:**
- Table tests for SU/ATS, push/tie behaviors, missed picks, cancellations, moved-to-future-week
- No mocks, no fixtures, no DB
**Dependencies:** PKM-002 (pattern), ELM-001

---

### ELM-005 — Cron: process-elimination-deadlines
**Status:** TODO
**Description:** Runs after the last game of each week. Auto-eliminates players with no submitted pick.
**Acceptance criteria:**
- Drivable via simulator
- Idempotent
- Integration tested
**Dependencies:** ELM-004, SPT-008

---

### ELM-006 — Revival rule: all eliminated same week
**Status:** TODO
**Description:** After processing a week, if everyone was eliminated that week, revive them.
**Acceptance criteria:**
- Integration tested via simulator scenario
- Revival is transactional with elimination
**Dependencies:** ELM-005

---

### ELM-007 — Lives, strikes, buy-back logic
**Status:** TODO
**Description:** Lives decrement instead of immediate elimination. Buy-back endpoint with commissioner-defined cutoff week.
**Acceptance criteria:**
- Multi-life players eliminate only after all lives used
- Buy-back accepts at most one per player per season
- Buy-back after cutoff rejected
**Dependencies:** ELM-005

---

### ELM-008 — Tiebreaker: continue-until-winner mode
**Status:** TODO
**Description:** Extension weeks when multiple players survive past End Week. Revival rule applies in extension weeks too.
**Acceptance criteria:**
- Extension weeks generated correctly
- Final-survivor case ends the league
- Integration tested
**Dependencies:** ELM-005

---

### ELM-009 — Frontend: elimination pick UI
**Status:** TODO
**Description:** Shows available teams (used teams disabled with tooltip). One-pick-per-week constraint enforced in UI.
**Acceptance criteria:**
- All four states; mobile-first
- Used teams show tooltip explaining why disabled
- Pick lock indicator on kicked-off games
**Dependencies:** ELM-003

---

### ELM-010 — Frontend: standings + eliminated indicator
**Status:** TODO
**Description:** Active vs eliminated grouping. Lives remaining shown when relevant. Used-teams chip per member.
**Acceptance criteria:**
- All four states
- Eliminated state visible with text + icon (not color alone)
- Mobile responsive
**Dependencies:** ELM-005, ELM-007

---

### ELM-011 — Frontend: pick history
**Status:** TODO
**Description:** Per-week pick + outcome.
**Acceptance criteria:**
- All four states
- Outcome icons + text per UI standards
**Dependencies:** ELM-003
