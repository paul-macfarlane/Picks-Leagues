# Epic 04: Pick'em League — MVP config

First playable game mode. **Standard scoring, Straight Up only, no money pick** — the simplest config. Optional settings (Confidence, ATS, money pick) layer on in epic 05.

**Status:** TODO

## Tickets

### PKM-001 — Schema: pick'em settings + picks
**Status:** TODO
**Description:** Settings schema (Start Week, End Week, Pick Type, Picks Per Week, Scoring Type, Push/Tie). `picks` table (id, user_id, league_id, week_id, game_id, selected_team_id, money_pick, accepted_spread, created_at). Unique (user_id, league_id, game_id).
**Acceptance criteria:**
- Settings stored on the league as discriminated `settings_json`
- `picks` migration runs
- Index on (league_id, week_id, user_id)
**Dependencies:** LGE-001, SPT-001

---

### PKM-002 — Scoring: resolvePickEmLeagueWeek (Standard SU)
**Status:** TODO
**Description:** Pure function in `services/api/src/scoring/pickem.ts`. Standard scoring, SU only. Inputs: picks, game results, league settings. Output: score deltas per user. Handles ties per the Push/Tie setting.
**Acceptance criteria:**
- Exhaustive table tests per `game-types.md` (correct, incorrect, tie under all three Push/Tie settings, cancelled-no-repick)
- Zero external imports (enforced by lint)
- No mocks, no fixtures, no DB
**Dependencies:** FND-003

---

### PKM-003 — Route: get current week slate
**Status:** TODO
**Description:** `GET /api/leagues/:id/slate?week=N`. Returns games for the week eligible for pick. Includes kickoff times, teams, current spreads (context only in SU MVP).
**Acceptance criteria:**
- Returns only regular season games
- Filters to the requested week
- Members only
- Integration tested
**Dependencies:** PKM-001

---

### PKM-004 — Route: submit picks
**Status:** TODO
**Description:** `POST /api/leagues/:id/picks`. Body: array of `{game_id, selected_team_id}`. Validates: game hasn't kicked off, team is in the game, count ≤ picks-per-week, user is a member. Upserts picks.
**Acceptance criteria:**
- Kicked-off games rejected with clear error
- Over-picks rejected
- Re-submissions update existing picks
- All time checks use `clock.now()`
- Integration tested incl. simulator clock advance
**Dependencies:** PKM-003, SPT-011

---

### PKM-005 — Route: get my picks for week
**Status:** TODO
**Description:** `GET /api/leagues/:id/picks/me?week=N`. Returns the user's own picks, regardless of game state.
**Acceptance criteria:**
- Returns all the user's picks for the week
- Includes pick outcome once games resolve
- Integration tested
**Dependencies:** PKM-004

---

### PKM-006 — Route: get league member picks (visibility)
**Status:** TODO
**Description:** `GET /api/leagues/:id/picks?week=N`. Returns picks for all members, **only for games where `kickoff_time ≤ clock.now()`**. Filtered server-side.
**Acceptance criteria:**
- Picks for unstarted games not returned to anyone other than the picker themselves
- Time check uses `clock.now()`
- Integration tested with simulator clock
**Dependencies:** PKM-005

---

### PKM-007 — Standings: materialization
**Status:** TODO
**Description:** `weekly_standings` and `season_standings` tables and a function that materializes them from picks + results. Called from the dispatcher.
**Acceptance criteria:**
- After a game resolves, standings update transactionally with scoring
- Re-running materialization is idempotent
- Integration tested
**Dependencies:** PKM-002, SPT-009

---

### PKM-008 — Game resolution: register pick'em resolver
**Status:** TODO
**Description:** Register a resolver in the dispatcher for pick'em leagues. On FINAL, the resolver loads relevant picks, calls scoring, writes outcomes + score deltas, refreshes standings, writes notifications. All in one transaction.
**Acceptance criteria:**
- Driven end-to-end via the simulator
- Idempotent on re-dispatch
- Integration tested
**Dependencies:** PKM-007, SPT-012

---

### PKM-009 — Notifications: schema + dispatcher
**Status:** TODO
**Description:** `notifications` table per the MVP spec. `notify(userIds, type, payload)` function in `services/api/src/notifications/`. Today only writes DB rows; extensible to other writers later. Types: `pick_reminder`, `game_resolved`, `week_completed`.
**Acceptance criteria:**
- Schema migration runs
- `notify` is the only function callers use
- Unit tested
**Dependencies:** FND-004

---

### PKM-010 — Cron: send-pre-game-reminders
**Status:** TODO
**Description:** `/api/cron/send-pre-game-reminders`. Every 30 min. For each league member with un-submitted picks for games kicking off in the next N hours, writes a `pick_reminder` notification.
**Acceptance criteria:**
- Idempotent (doesn't duplicate reminders within the window)
- Drivable via simulator clock
- Integration tested
**Dependencies:** PKM-009, PKM-004

---

### PKM-011 — Routes: weekly + season standings
**Status:** TODO
**Description:** `GET /api/leagues/:id/standings?week=N` (weekly) and `GET /api/leagues/:id/standings?season=true` (season). Reads from materialized tables.
**Acceptance criteria:**
- Returns ranked users with totals
- Tiebreaker column included
- Integration tested
**Dependencies:** PKM-007

---

### PKM-012 — Routes: notifications inbox + mark read
**Status:** TODO
**Description:** `GET /api/notifications` (paginated, unread first), `POST /api/notifications/read` (bulk mark read), `GET /api/notifications/unread-count`.
**Acceptance criteria:**
- Returns only the current user's notifications
- Mark-read updates `read_at`
- Integration tested
**Dependencies:** PKM-009

---

### PKM-013 — Frontend: weekly slate + pick submission
**Status:** TODO
**Description:** `/leagues/:id/picks` route. Shows the week's slate, lets the user select N picks, submit, and see locked picks. Mobile-first.
**Acceptance criteria:**
- All four states
- Visual lock indicator on kicked-off games
- Submit button disabled until N picks selected
- Toast on successful submission
- Keyboard nav and screen-reader friendly
**Dependencies:** PKM-004, PKM-003

---

### PKM-014 — Frontend: my picks view
**Status:** TODO
**Description:** `/leagues/:id/picks/me` route (or tab). Current week's picks + history. Outcome icons + colors per UI standards (icon + text, not color alone).
**Acceptance criteria:**
- All four states
- Week selector
- Push and tie indicators clear
- Mobile responsive
**Dependencies:** PKM-005, PKM-013

---

### PKM-015 — Frontend: league members' picks view
**Status:** TODO
**Description:** `/leagues/:id/picks/all` route (or tab). Grid of members × games for the week. Cells show picks only for kicked-off games.
**Acceptance criteria:**
- All four states
- Unstarted games show "—" or "locked" placeholder for other members
- Mobile: scrollable horizontally with sticky member column
**Dependencies:** PKM-006

---

### PKM-016 — Frontend: weekly + season leaderboards
**Status:** TODO
**Description:** Standings tab on the league page. Weekly + season toggle. Tabular-nums. Shows tiebreaker column.
**Acceptance criteria:**
- All four states
- Current user highlighted
- Week selector for weekly view
- Mobile: condensed columns
**Dependencies:** PKM-011

---

### PKM-017 — Frontend: notifications inbox
**Status:** TODO
**Description:** Inbox accessible from a header bell icon. Unread count badge. Click-through to the relevant league/pick.
**Acceptance criteria:**
- All four states
- Polling for unread count (low frequency)
- Mark-as-read on view
- Mobile: full-screen sheet, not a tiny popover
**Dependencies:** PKM-012
