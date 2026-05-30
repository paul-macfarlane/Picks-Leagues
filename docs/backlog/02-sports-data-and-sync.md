# Epic 02: Sports data & sync

Set up the `SportsProvider` interface, the ESPN implementation, the schedule + scores sync cron jobs, the **season-replay simulator**, and an **admin override UI** for when ESPN gets something wrong in production.

**The simulator must be complete before any pick-submission or scoring work begins.** It is the only way to exercise those modules in the off-season.

The simulator works by **re-enacting a real past NFL season** (e.g. 2024): it pulls the archived schedule, scores, and spreads from the real ESPN provider and replays them week-by-week through the **same sync pipeline the production crons use**. This means one tool gives us both off-season testing of in-season user flows (picks, locking, scoring, standings) **and** continuous validation of the real ESPN integration — there is no separate scripted/fake data path. Past-season data is served by ESPN's public API, so the simulator needs network access (it is not offline). **Hitting the real ESPN API is acceptable everywhere it's needed — including local dev and CI/E2E tests** (past seasons are static, so replays are deterministic enough). If ESPN ever stops exposing historical seasons we'll add a snapshot/record-replay path then, not before. (Originally scoped as a scripted, offline, in-memory `SportsProvider` in FND-021 + SPT-010–013; replaced 2026-05-30 with this real-ESPN replay design, which is what was actually built and proven in a prior project.)

> **Reference implementation:** the simulator, ESPN client, and sync pipeline were built and proven in the gitignored **`legacy/`** folder (local-only; see the backlog [README](README.md#reference-implementations-legacy)). Key files: `legacy/src/lib/simulator.ts`, `legacy/src/lib/sync/`, `legacy/src/lib/espn/`, `legacy/src/components/admin/simulator-panel.tsx`, `legacy/src/lib/db/schema/external.ts`. The legacy app was Next.js; port the design to this Hono + Drizzle monorepo, not the framework specifics.

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

### SPT-010 — Simulator: past-season initializer
**Status:** TODO
**Description:** `services/api/src/simulator/` module with `initializeSeason(year)`: fetch an entire **real, archived** past NFL season from the ESPN provider (SPT-003) and persist it — all weeks, the 32 teams, and every game — with each game in `scheduled` status and **no scores yet**, so the full schedule is visible up front. Reuses the `sync-schedule` upsert path (SPT-006) rather than a parallel code path; sync-schedule owns reference-data creation. Auth-gated (admin only). No fake/scripted data and no `SPORTS_PROVIDER` swap — this is the real ESPN provider pointed at a past year. Mirrors the prior project's `initializeSeason(year)`.
**Acceptance criteria:**
- `initializeSeason(year)` populates seasons, weeks, teams, and games for a known past season (e.g. 2024) from real ESPN data
- Every game is created with status `scheduled` and null scores; the full week-by-week schedule is present after init
- Creation goes through the same upsert path as `sync-schedule` (no duplicate write logic); re-running is idempotent
- Admin-gated; a non-admin call is rejected
- Teardown: `resetSeason(seasonId)` cascade-deletes the season and all dependent rows
**Dependencies:** SPT-006

---

### SPT-011 — Simulator: time-travel clock
**Status:** TODO
**Description:** A `clock.now()` helper that returns the real clock normally and the **simulator clock** in simulator mode. Every time-based check in the API goes through it (already a project non-negotiable). Admin endpoint `POST /api/sim/clock` sets the simulator clock. For replay this positions "now" at a chosen point inside the past season's real timeline (e.g. "Sunday 1pm ET of week 7, 2024") so pick-lock times, game windows, and pick visibility resolve authentically against the historical kickoff times — this is what makes off-season testing of in-season flows possible.
**Acceptance criteria:**
- All `now()` reads in the API go through `clock.now()`
- In simulator mode, `clock.now()` returns the simulator clock; in normal mode, the real clock
- `POST /api/sim/clock` (admin-gated) sets the simulator clock to an arbitrary timestamp within a replayed season
- With the clock set before a week's `pickLockTime`, picks are open; set after it, picks are locked — verified against a replayed week's real kickoff times
**Dependencies:** SPT-010

---

### SPT-012 — Simulator: week-by-week replay driver
**Status:** TODO
**Description:** Drive a replayed season forward one week at a time by calling the **same sync handlers the production crons use** (SPT-006 schedule/spreads, SPT-008 scores) with an explicit `weekId` instead of the auto-detected current week. Pulls the real archived ESPN scores, status, and spreads for that week, flips finished games to `final`, and invokes the game-resolution dispatcher (SPT-009) exactly once per game. This is the core of the simulator: replaying a real past season is the same code path that runs live on Sundays, which is exactly why it validates the ESPN integration end-to-end. Auth-gated admin endpoints.
**Acceptance criteria:**
- `POST /api/sim/seasons/:id/weeks/:weekId/sync-scores` runs the real sync-scores flow for just that week and updates scores/status from archived ESPN data
- `POST /api/sim/seasons/:id/weeks/:weekId/sync-spreads` refreshes that week's spreads via the sync-schedule path
- `FINAL` transitions invoke the dispatcher (SPT-009) exactly once per game; re-running a week is idempotent (no double-dispatch)
- Replaying weeks 1→N of a real past season reproduces that season's real outcomes
- `docs/simulator.md` documents how to drive a full-season replay
**Dependencies:** SPT-011, SPT-008, SPT-009

---

### SPT-013 — Simulator: admin UI
**Status:** TODO
**Description:** Admin-only page (e.g. `/admin/sim`) to drive the replay without curl: pick a year and initialize a season, view a week-by-week status table (game count, finals count, spreads available), trigger per-week "Sync Scores" / "Sync Spreads", set the simulator clock, and reset/teardown a season. Reuses the real sync pipeline behind the buttons — no fake data. Mirrors the prior project's simulator panel. Follows the shadcn + react-hook-form + zod + four-states UI standards.
**Acceptance criteria:**
- Admin can initialize a past season by year and see the full week-by-week schedule populate
- Per-week buttons trigger the real score/spread sync (SPT-012) and the table reflects updated finals/scores
- A control sets the simulator clock (SPT-011) and the UI reflects the active simulated time
- Reset button cascade-deletes a season with a confirmation dialog
- Non-admins are redirected; the simulator link is hidden from non-admin nav
- Mobile + dark mode + four states (loading/empty/error/happy) verified per UI standards
**Dependencies:** SPT-012, FND-009

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
