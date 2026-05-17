# Epic 02: Sports data & sync

Set up the `SportsProvider` interface, the ESPN implementation, the schedule + scores sync cron jobs, the **simulator**, and an **admin override UI** for when ESPN gets something wrong in production.

**The simulator must be complete before any pick-submission or scoring work begins.** It is the only way to test those modules in the off-season.

The admin override capability (SPT-014, SPT-015) is the operator escape hatch — informed by prior pool-running experience where ESPN occasionally reports wrong scores, misses status updates, or publishes bad spreads. Without it, every data error becomes a database surgery; with it, the commissioner-of-the-app fixes it from a form.

**Status:** TODO

## Tickets

### SPT-001 — Schema: teams, seasons, weeks, games, spreads
**Status:** TODO
**Description:** Drizzle schemas for `teams` (32 NFL teams), `seasons`, `weeks` (regular season weeks 1–18), `games` (with `kickoff_time`, `status`, `home_team_id`, `away_team_id`, `home_score`, `away_score`), `spreads` (current + history).
**Acceptance criteria:**
- Migration runs
- Game status enforced as enum (`scheduled`, `in_progress`, `final`, `cancelled`, `postponed`)
- All timestamps UTC; type-safe enums in TypeScript
- FKs explicit with `onDelete: 'restrict'` for protective relations
**Dependencies:** FND-004

---

### SPT-002 — SportsProvider interface
**Status:** TODO
**Description:** Define the `SportsProvider` interface in `services/api/src/providers/sports-provider.ts` per the MVP spec. Methods: `fetchSchedule`, `fetchGameStatus`, `fetchScores`, `fetchSpreads`. Define return types (`Game`, `GameStatus`, `GameResult`, `Spread`). No implementations yet.
**Acceptance criteria:**
- Interface exported and importable
- Type definitions cover every field downstream code needs
- A unit-test stub provider implementing the interface exists for later tests
**Dependencies:** SPT-001

---

### SPT-003 — ESPN provider: fetchSchedule
**Status:** TODO
**Description:** Implement `fetchSchedule(season, week)` against ESPN's unofficial endpoint. Parse the response into `Game[]`. Typed `ProviderError` on failures.
**Acceptance criteria:**
- Real ESPN endpoint returns parsed games for a known week
- Response shape matches `Game`
- Failures (timeout, 5xx, schema mismatch) throw `ProviderError`
**Dependencies:** SPT-002

---

### SPT-004 — ESPN provider: fetchGameStatus + fetchScores
**Status:** TODO
**Description:** Implement `fetchGameStatus(gameId)` and `fetchScores(gameIds)`. Status maps to the enum. Scores include home/away points.
**Acceptance criteria:**
- Real ESPN endpoint returns correctly mapped status and scores
- `fetchScores` does one request for the batch, not N requests
**Dependencies:** SPT-003

---

### SPT-005 — ESPN provider: fetchSpreads
**Status:** TODO
**Description:** Implement `fetchSpreads(gameIds)` returning the current spread per game. Document ESPN's observed update cadence in the provider file (verified against real traffic).
**Acceptance criteria:**
- Returns spreads for in-week games
- Returns `null` cleanly when a spread is not yet published
- A comment in the file records the observed update cadence
**Dependencies:** SPT-004

---

### SPT-006 — Cron: sync-schedule
**Status:** TODO
**Description:** `/api/cron/sync-schedule` endpoint. Runs daily. Calls `fetchSchedule` for the current and next week, upserts teams and games. Idempotent. Refreshes spreads for upcoming games.
**Acceptance criteria:**
- Manual invocation (with cron secret) populates the DB
- Re-running produces no net DB change
- Vercel cron schedule configured in `vercel.json`
**Dependencies:** SPT-005, FND-013

---

### SPT-007 — Game window helper
**Status:** TODO
**Description:** Pure function `isGameWindowActive(games, now)` returning true if any game has `status != final` and `kickoff_time` within ±4 hours of `now`. Lives in `services/api/src/lib/`.
**Acceptance criteria:**
- Unit-tested: window before kickoff, during game, after game, no upcoming games
- No I/O, no DB
**Dependencies:** SPT-001

---

### SPT-008 — Cron: sync-scores
**Status:** TODO
**Description:** `/api/cron/sync-scores` endpoint. Checks game window via SPT-007. Runs every 2 min during window, every 30 min otherwise (two cron entries, both calling the same handler). Updates scores and status. Detects FINAL transitions and calls the resolution dispatcher exactly once.
**Acceptance criteria:**
- During a window, runs full sync; outside window, runs a cheap check and exits
- FINAL transitions invoke the dispatcher exactly once per game (idempotent)
- Recurring syncs **query** reference data; never upsert teams or games (sync-schedule owns that)
- Re-runs don't double-dispatch
**Dependencies:** SPT-007, SPT-006

---

### SPT-009 — Game resolution dispatcher (skeleton)
**Status:** TODO
**Description:** Module `services/api/src/game-resolution/dispatcher.ts` exporting `resolveGame(gameId)`. For now: logs the resolution call and is empty. Game-mode resolvers register here as they're built (epic 04 onward).
**Acceptance criteria:**
- Called by sync-scores on FINAL transitions
- Logs a structured "game resolved" event with `game_id`
- Documented extension point (resolver registry) for later epics
**Dependencies:** SPT-008

---

### SPT-010 — Simulator provider: scripted data
**Status:** TODO
**Description:** A `SportsProvider` implementation returning scripted data from in-memory state. Swappable via env var `SPORTS_PROVIDER=simulator`. Exposes admin endpoints (auth-gated) for the rest of the simulator.
**Acceptance criteria:**
- `SPORTS_PROVIDER=simulator` makes the API use the simulator instead of ESPN
- Simulator can be loaded with a fixture: teams, a week of games, spreads
- All `SportsProvider` methods return data from in-memory state
**Dependencies:** SPT-002

---

### SPT-011 — Simulator: time-travel clock helper
**Status:** TODO
**Description:** A `clock.now()` helper that returns the real clock in normal mode and the simulator clock in simulator mode. Every time-based check in the API goes through this helper. Admin endpoint `POST /api/sim/clock` sets the simulator clock.
**Acceptance criteria:**
- All `now()` reads in the API go through `clock.now()`
- In simulator mode, helper returns the simulator clock
- Setting the clock to a value in the future causes a game's status to flip correctly when scores are updated
**Dependencies:** SPT-010

---

### SPT-012 — Simulator: admin endpoints for game control
**Status:** TODO
**Description:** Auth-gated admin endpoints to advance the simulator: set a game's status, set scores, mark cancelled/postponed. Used to drive end-to-end tests of pick locking, visibility, scoring, and notifications once those exist.
**Acceptance criteria:**
- `POST /api/sim/games/:id/score` updates score and triggers normal sync-scores flow
- `POST /api/sim/games/:id/status` flips status, triggering dispatcher when FINAL
- `POST /api/sim/games/:id/cancel` and `/postpone` work
- `docs/simulator.md` explains how to drive a full-week scenario
**Dependencies:** SPT-011, SPT-009

---

### SPT-013 — Simulator: full-season fixture loader
**Status:** TODO
**Description:** Script that loads a complete fake NFL regular season (teams, 18 weeks of games, plausible kickoff times) into the simulator. Default fixture for dev and E2E tests.
**Acceptance criteria:**
- `pnpm sim:load-season` populates the local DB with a full simulated season
- Kickoff times spread realistically (Thu, Sun early/late, Mon)
- Spreads populated for week 1
**Dependencies:** SPT-012

---

### SPT-014 — Admin sports-data overrides: schema, audit, API
**Status:** TODO
**Description:** Operator escape hatch for when ESPN data is wrong (incorrect score, wrong status, missing/incorrect spread, postponed game ESPN hasn't updated yet). Adds:
- `is_admin` boolean column on `users` (default false; toggled manually in DB for MVP, no self-serve admin promotion)
- `sports_overrides` audit table: `id, admin_user_id, entity_type` (`game` | `spread`), `entity_id, field, old_value, new_value, reason, created_at` — append-only
- Admin-auth middleware reading `is_admin`
- Routes:
  - `PATCH /api/admin/games/:id` — override `home_score`, `away_score`, `status`, `kickoff_time`, and the team IDs
  - `PATCH /api/admin/spreads/:id` (or `POST /api/admin/spreads` to insert a corrected one)
- Status flips to `final` via override go through the **same** game-resolution dispatcher as sync-scores (no parallel code path) — exactly once per game
- Every override writes the audit row in the same transaction as the update
**Acceptance criteria:**
- Non-admin users get 403 on admin routes
- Override changing a `final` game's score triggers re-resolution via the dispatcher (idempotent)
- Audit row written for every override; rows are immutable (no PATCH/DELETE routes)
- Migrations applied; `is_admin` defaults false so existing users are unaffected
**Dependencies:** SPT-009, FND-014

---

### SPT-015 — Admin UI: sports-data viewer + override forms
**Status:** TODO
**Description:** Admin-only pages under `/admin/sports` for viewing and overriding sports data:
- **Games list** for current and upcoming week — score, status, kickoff, spread; filter by week
- **Game detail** — shadcn Form to edit score, status, kickoff_time, home/away team; reason field required for every override
- **Spread editor** — view current spread, post a correction
- **Audit log** view — recent overrides with who/what/when/why
- Routes guarded: non-admins redirected; the admin link itself hidden from non-admin nav
**Acceptance criteria:**
- Admin can correct a wrong final score and the standings recompute (via dispatcher)
- Reason field is required; submitting without it shows a form error
- Audit log shows the override within seconds of submission
- All forms follow shadcn Form + react-hook-form + zod pattern per code standards
- Mobile + dark mode + four states (loading/empty/error/happy) verified per UI standards
**Dependencies:** SPT-014, FND-012, FND-015
