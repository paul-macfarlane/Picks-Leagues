# Epic 08: Weekly H2H Pick'em

Last game mode per build order — matchmaking adds complexity that doesn't exist elsewhere.

**Status:** TODO

## Tickets

### H2H-001 — Schema: matches, picks, queue, recurring matchups
**Status:** TODO
**Description:** `h2h_matches` (user_a, user_b, week, pick_type, status, recurring_id?). `h2h_picks` (match, user, game, selected_team, money_pick, accepted_spread). `h2h_queue` (user, pick_type, week, joined_at). `h2h_recurring` (user pair, pick_type, active).
**Acceptance criteria:**
- Migrations run
- Self-matching prevented at DB level (CHECK constraint)
- Indexed for queue scans
**Dependencies:** LGE-001, SPT-001

---

### H2H-002 — Route: create friend match (invite)
**Status:** TODO
**Description:** Inviter sets pick_type. Invitee accepts or declines.
**Acceptance criteria:**
- Invite expires when the week's first game kicks off
- Self-invite rejected
- Integration tested
**Dependencies:** H2H-001

---

### H2H-003 — Routes: stranger queue join/leave
**Status:** TODO
**Description:** Separate queues by pick_type. Cannot queue for future weeks. Self-matching prevented.
**Acceptance criteria:**
- Queue entries scoped to (pick_type, current week)
- Leave-queue removes entry
- Integration tested
**Dependencies:** H2H-001

---

### H2H-004 — Matchmaking: pairing logic
**Status:** TODO
**Description:** Pair on join when possible (FCFS within queue, same pick_type). On week kickoff, cancel unmatched entries.
**Acceptance criteria:**
- Pairing prefers oldest queue entry
- Cancelled queue entries notify the user (no match found)
- Integration tested with simulator clock advance
**Dependencies:** H2H-003, SPT-011

---

### H2H-005 — Route: submit h2h picks
**Status:** TODO
**Description:** Batch of 5 picks + one money pick designation. All-or-nothing. Mid-week joiners can't pick already-kicked-off games.
**Acceptance criteria:**
- Partial submissions rejected
- Money pick must be one of the 5
- Re-submission requires spread re-acceptance on all unstarted picks (ATS)
- Integration tested
**Dependencies:** H2H-002, H2H-004

---

### H2H-006 — Pick visibility per-game by kickoff
**Status:** TODO
**Description:** Endpoint returns opponent's pick only for kicked-off games.
**Acceptance criteria:**
- Uses `clock.now()` for the kickoff check
- Integration tested with simulator
**Dependencies:** H2H-005

---

### H2H-007 — Scoring: resolveH2HMatch
**Status:** TODO
**Description:** Pure function. Tiebreaker by cumulative differential.
**Acceptance criteria:**
- Table tests: correct/incorrect/push/tie, money pick (correct/incorrect/push), cancelled-no-replacement
- Tiebreaker tests for SU and ATS
- No mocks, no fixtures, no DB
**Dependencies:** PKM-002 (pattern), H2H-001

---

### H2H-008 — Resolver registration + match result
**Status:** TODO
**Description:** Wire into the dispatcher. Match result written transactionally with notification dispatch.
**Acceptance criteria:**
- Idempotent on re-dispatch
- Result available to both players via API
- Integration tested
**Dependencies:** H2H-007, SPT-009

---

### H2H-009 — Recurring matchups
**Status:** TODO
**Description:** Auto-create next week's match per pair. Mutual pick_type change confirmation. Either side can end.
**Acceptance criteria:**
- Next-week match created at week boundary
- Pick-type change requires both players' confirmation
- Either player can end the recurring matchup at any time
**Dependencies:** H2H-008

---

### H2H-010 — Cancellation handling (game cancelled, re-pick)
**Status:** TODO
**Description:** Game cancelled: re-pick available. Money pick re-designation. Push fallback if no unstarted picks remain.
**Acceptance criteria:**
- Re-pick endpoint validates unstarted games
- Money pick can be re-designated to any unstarted pick
- Push fallback when no replacement available
**Dependencies:** H2H-007

---

### H2H-011 — Frontend: friend match creation
**Status:** TODO
**Description:** Invite a friend by username or shared link. Set pick_type.
**Acceptance criteria:**
- All four states
- Pending invites visible to both parties
**Dependencies:** H2H-002

---

### H2H-012 — Frontend: stranger queue
**Status:** TODO
**Description:** Queue join/leave UI. Cancelled-no-opponent state.
**Acceptance criteria:**
- All four states
- Live status while in queue (polling)
- Notification surfaces match found or queue cancelled
**Dependencies:** H2H-003

---

### H2H-013 — Frontend: pick submission UI
**Status:** TODO
**Description:** 5 picks + money pick designation in one batch. Spread re-acceptance prompt on changes.
**Acceptance criteria:**
- All four states; mobile-first
- All-or-nothing submit (clear validation feedback)
- Money pick designation accessible via keyboard
**Dependencies:** H2H-005

---

### H2H-014 — Frontend: live match view
**Status:** TODO
**Description:** Both players' picks revealed per kickoff. Running score. Polling during game window.
**Acceptance criteria:**
- All four states
- Polling 15–30s during game window
- Score animation discreet (no flashing)
**Dependencies:** H2H-006

---

### H2H-015 — Frontend: match history + record
**Status:** TODO
**Description:** Win/loss/tie ledger. Filter by friend / stranger / pick_type.
**Acceptance criteria:**
- All four states
- Pagination
- Mobile responsive
**Dependencies:** H2H-008
