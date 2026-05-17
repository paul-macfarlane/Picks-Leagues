# Picks Leagues — MVP Technical Specification

## Overview

This document describes the architecture and technical decisions for the MVP of Picks Leagues, a web-based NFL pick'em and pools application. The MVP is web-only, prioritizing a clean API-first foundation so the backend can be reused without modification when a native mobile app is added post-MVP. The stack is serverless-first to eliminate infrastructure management overhead at early scale.

---

## MVP Scope

### In Scope

**Platform**
- Web application (browser)
- NFL regular season only (Weeks 1–18)
- Public and private league support
- League creation, joining, commissioner settings

**Game Modes**
Four NFL game modes ship in MVP:

| Mode | Rationale |
|---|---|
| NFL Elimination League | Most popular pool format; defines the app |
| Pick'em League | Season-long competitive format; core social feature |
| Weekly H2H Pick'em | One-week social mechanic; drives retention and word-of-mouth |
| App-Wide Pick'em Competition | App-level feature requiring no league setup; good for new user onboarding |

Both Straight Up (SU) and Against the Spread (ATS) pick types are supported in MVP. ESPN's unofficial endpoints expose game spreads and totals, so no additional data provider is required at launch.

**Build order within MVP.** The four game modes ship sequentially, with each in production before the next begins:

1. **Pick'em League** — first. Known committed users; immediate audience for testing and feedback. Initial launch uses Standard scoring, SU pick type, no money pick — the simplest configuration. Optional settings (Confidence scoring, ATS, money pick) layer on once the foundation is stable.
2. **NFL Elimination League** — second. Broad appeal, mature pool format, reuses much of the league/membership infrastructure built for Pick'em League.
3. **App-Wide Pick'em Competition** — third. Leverages slate and scoring logic already built; introduces app-level (non-league) leaderboards.
4. **Weekly H2H Pick'em** — last. Matchmaking and stranger-queue logic introduce complexity that doesn't exist in the league modes.

Each phase is independently shippable. Users can sign up and use whatever modes are live.

### Out of Scope — Post-MVP

**Game Modes**
- NFL Win Total Pool
- Franchise Pool
- March Madness Pool
- App-Wide Bracket Competition

**Platform & Infrastructure**
- Native mobile apps (iOS, Android)
- WebSocket real-time connections (polling covers MVP adequately)
- Email, web push, and SMS notifications (in-app only at launch)
- Advanced job orchestration platform (cron handlers suffice for MVP)
- Admin tooling beyond basic commissioner controls
- Social features (user profiles, activity feeds, following)
- Public league discovery and search

The architecture is intentionally designed so that post-MVP additions are additive — new game modes extend the scoring module and add routes; mobile adds a new client against the same API; infrastructure graduation replaces specific primitives without touching business logic.

---

## System Architecture

```
┌──────────────────────────────────────────┐
│           Browser (Web Client)           │
│   Vite + React SPA                       │
│   TanStack Router / TanStack Query       │
│   Better Auth client                     │
└──────────────────┬───────────────────────┘
                   │ HTTPS / REST
                   ▼
┌──────────────────────────────────────────┐
│              Hono API                    │
│              Vercel (Node.js)            │
│                                          │
│  • Better Auth middleware                │
│  • Zod request validation                │
│  • Drizzle ORM                           │
│  • Cron handler endpoints                │
│  • SportsProvider interface              │
│  • OpenAPI spec export                   │
│  • Scoring module (internal)             │
└──────┬──────────────────────┬────────────┘
       │                      │
       │                      │ Vercel Cron triggers
       ▼                      ▼
┌─────────────┐    ┌──────────────────────┐
│    Neon     │    │   Scheduled Sync     │
│  Postgres   │◄───│   & Resolution       │
│  (Drizzle)  │    │   (cron endpoints)   │
└─────────────┘    └──────────┬───────────┘
                              │
                   ┌──────────▼───────────┐
                   │  Sports Data Source  │
                   │  (ESPN, swappable)   │
                   └──────────────────────┘
```

### Architectural Principles

**API-first.** The backend exposes a REST API exclusively. No business logic lives in the web client or in any server-side rendering layer. The mobile app added post-MVP calls the identical API without changes.

**Serverless-first.** No long-running processes at MVP. The API runs as stateless serverless functions. Background work is handled by cron-triggered handlers. This eliminates infrastructure management at the cost of some timing precision and fan-out elegance — both acceptable tradeoffs at MVP scale.

**Server is the source of truth for timing.** Pick locking and pick visibility are both determined by comparing server time to `game.kickoff_time` at query time — no state is maintained for either. A pick is locked once `now() >= game.kickoff_time`. A pick becomes visible to other users (opponents, league members) under the same condition. The client never decides what is or isn't locked or visible; queries filter results accordingly.

**Scoring is isolated.** All scoring logic lives in an internal `scoring/` directory with no I/O dependencies — it imports nothing from `db`, no HTTP clients, no env vars. Pure functions take picks, game results, and league settings as inputs and return score deltas as output. This makes the rules exhaustively testable in isolation, even without a separate package boundary.

**External dependencies behind interfaces.** The sports data provider is consumed via a `SportsProvider` TypeScript interface. Swapping providers, or mocking data in tests, requires no changes elsewhere.

---

## Components

### Frontend — Vite + React SPA

The web client is a single-page application deployed as static files.

**Vite + React** was chosen over a meta-framework (Next.js, Remix) to enforce clean API separation. With SSR, the path of least resistance leads to business logic and data fetching drifting into the server-rendering layer — creating a web-only coupling that would have to be untangled before mobile is added. A pure SPA has no server runtime; everything goes through the API.

**TanStack Router** provides type-safe file-based routing with full TypeScript inference. **TanStack Query** manages server state, caching, and the polling strategy used in place of WebSockets — during game windows, active screens poll relevant endpoints every 15–30 seconds to reflect updated pick visibility, scores, and standings.

**Tailwind CSS + shadcn/ui** provides the component foundation. The goal is shipping a functional product, not designing a custom design system.

**Better Auth client SDK** handles login UI, session persistence, and JWT management. Users authenticate via social login (Google or Discord); the SDK provides the JWT that every API request includes.

The API client is a typed module generated from the OpenAPI spec exported by the Hono API. The web client imports typed functions rather than constructing raw fetch calls. When the mobile app is built, it uses the same generated client.

### API — Hono on Vercel

The API is a Hono application deployed to Vercel's Node.js serverless runtime.

**Hono** was chosen over Express for first-class TypeScript support, built-in Zod validation middleware, modern async error propagation, and meaningfully better performance. The API surface is Express-shaped enough that there is no real learning curve.

**Vercel** hosts both the API and the web SPA. Using one platform simplifies deployment, env management, and PR previews. The Node.js runtime works because Neon provides a serverless-safe Postgres driver — see the Database section for which driver and why.

The API is responsible for:
- Validating Better Auth JWTs on every authenticated request
- Validating request bodies against Zod schemas
- Reading and writing application state via Drizzle
- Enforcing pick submission rules — including the implicit "game has not yet kicked off" check, which is simply a comparison of `now()` to `game.kickoff_time`
- Calling scoring functions on demand for previews (e.g., "if my pick is right, my score becomes…")
- Exposing cron-triggered endpoints for scheduled work
- Exposing an OpenAPI spec for client generation (generated from route definitions via `hono-openapi` or `@hono/zod-openapi`)

The API **does not** call the sports data provider inline during user requests. All provider data is pre-synced into Postgres by cron jobs, so the API reads from local tables only. This keeps request latency predictable and the API isolated from provider outages.

### Internal Module: Scoring

Lives at `services/api/src/scoring/`. Pure functions, no I/O, no imports from elsewhere in the service.

Public interface is a set of functions, one per game mode:

```
resolveEliminationWeek(picks, results, settings) → outcomes[]
resolveH2HMatch(picksA, picksB, results, settings) → matchResult
resolvePickEmLeagueWeek(picks, results, settings) → scoreDeltas[]
resolveConfidenceWeek(picks, results, settings) → scoreDeltas[]
```

These functions encode every rule, edge case, and tiebreaker defined in the product spec. They are table-tested against every scenario: pushes, cancellations, re-picks, missed picks, revival rules, money picks, confidence weighting. No mocking, no fixtures, no test database — just input/output assertions.

The discipline of "no imports from outside this directory" is maintained by code review and a linter rule (eslint can enforce import boundaries). The benefit of a separate package boundary is real but not worth the monorepo overhead at MVP — promote to a package the day a second consumer (mobile, an admin CLI, a "what if" preview tool) needs it.

### Database — Neon (Serverless Postgres) + Drizzle

**Neon** provides hosted Postgres with serverless-safe drivers designed for short-lived function contexts and a branching feature that gives each pull request its own isolated database branch. Under the hood it is standard Postgres — there is no proprietary query language or lock-in.

**Driver choice (revised — see Revision log).** Neon ships two drivers: an HTTP driver and a WebSocket-pooled driver. We use the **WebSocket-pooled driver** (`drizzle-orm/neon-serverless` + `Pool` from `@neondatabase/serverless`), *not* the HTTP driver, because the HTTP driver does not support interactive transactions (`db.transaction()`) and transactional integrity is load-bearing for this app (see [code-standards.md](code-standards.md) § Database → Transactions). The WebSocket-pooled driver is still serverless-safe — it avoids the connection-exhaustion problems traditional pooling libraries hit in short-lived function contexts. Local development runs stock Postgres 17 in Docker via the `node-postgres` driver; the driver is selected automatically from the connection host, so switching targets is configuration-only.

**Drizzle** is the ORM layer. It was chosen for its TypeScript-native design (schemas are defined in TypeScript, not a separate DSL), its SQL-like query builder that stays out of the way for the complex leaderboard and standings queries this app requires, and its migration tooling. Unlike Prisma, Drizzle has no separate query engine binary and introduces no runtime overhead.

Key database design notes:
- All picks store their accepted spread at submission time (ATS leagues), so scoring is always deterministic against the historical line, not the current one.
- Leaderboard and standings rows are materialized by background work after game resolution, not computed at query time.
- All timestamps are stored in UTC.
- Game state (scheduled, in progress, final, cancelled, postponed) is tracked locally, synced from the provider on a schedule.
- No `is_locked` or `is_visible` column on picks — both are derived from `game.kickoff_time` at query time.
- Pick queries that return picks made by other users filter on `kickoff_time <= now()` so unstarted picks are never returned to opponents.

### Background Work — Vercel Cron + Idempotent Handlers

Background work runs as cron-triggered HTTP endpoints on the same Vercel deployment. No separate worker process, no managed job platform.

**Endpoint security.** All cron endpoints are protected — Vercel Cron sends a secret in the `Authorization` header that the handler verifies. Unauthenticated requests are rejected with 401. This prevents arbitrary external invocation of jobs that mutate state.

**Game window definition.** "Game window" is computed at runtime, not configured: a window is active any time the local `games` table contains a game with `status != FINAL` and `kickoff_time` within the next 4 hours or the last 4 hours. `sync-scores` checks this at the top of each run and adjusts its work accordingly.

**Scheduled sync** (recurring intervals, triggered by Vercel Cron):

| Endpoint | Frequency | Purpose |
|---|---|---|
| `/api/cron/sync-schedule` | Daily | Pull NFL schedule, upsert games and teams; refresh spreads for upcoming games |
| `/api/cron/sync-scores` | Every 2 min during game windows; every 30 min otherwise | Poll for live score updates and game status changes; trigger resolution for newly-final games |
| `/api/cron/send-pre-game-reminders` | Every 30 min | Write in-app notification rows for users with un-submitted picks for games kicking off within the next N hours. Note: in-app reminders only surface when the user opens the app — this becomes meaningfully more useful when email or push are added post-MVP. |
| `/api/cron/process-elimination-deadlines` | After the last game of each week | Auto-eliminate Elimination League players who never submitted a pick for the week (per the product spec's missed-pick rule). Other game modes do not require week-end processing — missed individual picks resolve as zero/push during normal game resolution. |

**Game resolution flow** (triggered inline within `sync-scores` when a game flips to FINAL):

```
sync-scores detects game FINAL
  → loads all picks for that game
  → calls scoring functions (resolveEliminationWeek, resolveH2HMatch, etc.)
  → writes outcomes and score deltas to DB in a transaction
  → updates standings for affected leagues
  → writes notification rows for affected users
```

**Why this works at MVP scale.** A single FINAL game's resolution touches at most a few hundred picks across all modes during MVP (small number of leagues, small membership). All of that fits well within Vercel's 60-second function timeout. Idempotency is guaranteed by writing outcomes against unique `(pick_id, game_id)` keys — a re-run of the same cron tick is a no-op for already-resolved games.

**The graduation signal.** When fan-out for game resolution starts approaching the function timeout — likely around hundreds of leagues with significant overlapping membership — work moves to a real job system (Inngest is the natural next step). At that point the cron handlers become thin wrappers that enqueue jobs instead of doing work inline. The scoring functions don't change.

### Notifications

**In-app notifications only at MVP.** A `notifications` table stores per-user notification records: `{ user_id, type, payload_json, read_at, created_at }`. The frontend queries this on app load and on a low-frequency interval, renders an inbox list, and shows an unread count badge. No external infrastructure required.

Notification rows are written by the same code paths that handle game resolution and week-end processing — when an elimination occurs, a week is won, or a pick deadline approaches, a notification row is inserted.

The notification dispatch is structured as a single function that today only writes the DB row. When email, web push, or native push are added post-MVP, they plug in as additional writers in that same function. No other code in the system needs to change.

### Sports Data — `SportsProvider` Interface, ESPN Implementation

The system consumes sports data exclusively through a `SportsProvider` TypeScript interface:

```
interface SportsProvider {
  fetchSchedule(season, week): Promise<Game[]>
  fetchGameStatus(gameId): Promise<GameStatus>
  fetchScores(gameIds): Promise<GameResult[]>
  fetchSpreads(gameIds): Promise<Spread[]>
}
```

The **MVP implementation uses ESPN's unofficial public endpoints**. These cover schedule, team metadata, scores, game status, and spread/total data at no cost. The known risks: no SLA, no formal redistribution rights, and the endpoints can change without warning. Accepted tradeoffs at MVP.

**On spread freshness**: ESPN updates its odds data periodically rather than in real-time. For pick submission purposes this is fine — the player accepts whatever spread is current when they submit, and that spread is stored on the pick row for deterministic scoring later. Worth verifying ESPN's update cadence early in development to ensure picks submitted close to kickoff reflect reasonable lines.

**The graduation signal**: ESPN's endpoints break unexpectedly, redistribution becomes a concern with real user volume, or post-MVP game modes (Win Total Pool, March Madness) require data ESPN doesn't expose reliably. The `SportsProvider` interface means swapping in The Odds API, SportsDataIO, or SportRadar is an isolated implementation change.

### Auth — Better Auth

**Better Auth** is an open-source, self-hosted authentication library that runs inside the Hono API as middleware. It stores users and sessions in the same Neon Postgres database (using Drizzle) and issues JWTs. For MVP the only enabled sign-in methods are Google and Discord OAuth — email magic link, password, and other providers can be added later if there's demand, but they aren't worth the auth surface area or the email-delivery dependency today.

Chosen over Clerk and WorkOS for two reasons: cost predictability — Better Auth has no per-user pricing because it isn't a SaaS, just a library — and avoiding a SaaS dependency for something as fundamental as auth. Operations are minimal: it's a few tables in your existing database and a route handler in your existing API.

Authentication is **JWT-based from day one**. Every API request includes a short-lived JWT in the `Authorization` header. This is the same pattern a React Native mobile client will use — no auth rework when mobile is added. Better Auth's `@better-auth/expo` plugin handles secure token storage, deep linking, and session management for React Native; it's newer than Clerk's mobile SDK and will likely require a bit more wiring when the mobile app is built, but the core protocol is standard JWT and fully supported.

Alternatives considered:
- **Clerk** — best-in-class DX (including mobile), but pricing escalates above 10K MAU
- **WorkOS AuthKit** — free up to 1M MAU, managed; strong alternative if self-hosting auth becomes a maintenance burden
- **Supabase Auth** — generous free tier (50K MAU), but pulls Supabase into the stack alongside Neon

---

## Project Structure

```
sports-app/
├── apps/
│   └── web/                  # Vite + React SPA
│       ├── src/
│       │   ├── routes/       # TanStack Router file-based routes
│       │   ├── components/
│       │   └── lib/
│       └── vite.config.ts
│
└── services/
    └── api/                  # Hono app + everything backend
        ├── src/
        │   ├── routes/       # Hono route handlers
        │   ├── cron/         # Cron-triggered endpoints
        │   ├── scoring/      # Pure scoring functions, no I/O
        │   ├── notifications/ # In-app notification dispatch (single writer; extensible to email/push later)
        │   ├── providers/    # SportsProvider interface + ESPN impl
        │   ├── db/           # Drizzle schema + migrations
        │   ├── auth/         # Better Auth setup
        │   └── lib/
        └── drizzle.config.ts
```

A monorepo is not strictly necessary at MVP — `apps/web` and `services/api` are independent and could each live in their own repo. The shape above keeps them together so OpenAPI client generation, shared TypeScript types, and unified PR review are easier. Promote to a `packages/` structure when a third consumer (mobile app) appears.

---

## Deployment Topology

| Component | Platform | Notes |
|---|---|---|
| Web SPA | Vercel | Same platform as API; one place for env vars and PR previews |
| API + cron handlers | Vercel (Node.js) | Serverless functions; cron schedules configured via `vercel.json` |
| Database | Neon | Serverless Postgres, branch per PR |
| Auth | Better Auth (self-hosted in API) | Runs inside the Hono service; no per-user pricing |
| Sports Data | ESPN unofficial API | Behind `SportsProvider` interface for swappability |

---

## Key Decisions Summary

| Decision | Choice | Rationale |
|---|---|---|
| Frontend framework | Vite + React SPA | Enforces API separation; patterns transfer directly to React Native |
| API framework | Hono | TypeScript-native, modern async, no Express baggage |
| ORM | Drizzle | Thin, SQL-like, excellent types, handles complex queries cleanly |
| Background work | Vercel Cron + idempotent handlers | Sufficient at MVP scale; zero added infrastructure |
| Auth | Better Auth | Self-hosted, no per-user pricing, JWT works for web and mobile |
| Real-time | TanStack Query polling | WebSockets unnecessary at MVP scale |
| Database | Neon | Serverless Postgres driver fits Vercel functions; portable; branching |
| Hosting | Vercel for API and web | One platform, one deploy pipeline, one env config |
| Sports data | ESPN (unofficial), behind interface | Free, sufficient for MVP; swappable when scale demands |
| Notifications | In-app only (DB-backed) | Sufficient for MVP; email/push add as additional dispatchers later |
| Scoring | Pure functions, internal module | Exhaustively testable; promote to package if a second consumer appears |

---

## Post-MVP Roadmap

### Priority 1 — Mobile App

React Native (Expo) consuming the identical Hono API. Auth works via Better Auth's `@better-auth/expo` plugin — the server side is unchanged, the mobile client gets the same JWTs the web client uses. Native push notifications added via Expo's EAS push service, plugged into the existing notification dispatch path as an additional writer alongside the in-app row. Promote `scoring/`, `api-client`, and shared types to `packages/` since a second consumer now exists.

### Priority 2 — Additional Game Modes

Win Total Pool, Franchise Pool, March Madness, App-Wide Bracket Competition. Each adds new Drizzle tables, new Hono routes, new scoring functions, and possibly new sports data needs (NCAA for March Madness, win totals data for the Win Total Pool). The rest of the system is unchanged.

### Priority 3 — Infrastructure Graduation

Triggered by concrete pain signals, not preemptively:

- **Game resolution timeouts** → Move from inline resolution to **Inngest** for fan-out and step functions. Existing scoring functions are reused as-is.
- **ESPN reliability or data gaps** → Swap `SportsProvider` implementation to SportsDataIO or SportRadar. Contracts and budget required.
- **WebSocket-level real-time becomes a feature** → Move API from Vercel serverless to long-running Node on Fly.io or Railway. Add WebSocket endpoint. Polling clients continue working unchanged during the transition.
- **Standings query performance under load** → Add Redis for hot leaderboard caching.

None of these touch business logic. The scoring module, data model, auth, and API routes remain stable across all of these graduations.

### Other Future Scope

- Email notifications (transactional via Resend or similar)
- Public league discovery and search
- User profiles and season history
- Commissioner tooling (manual overrides, announcements)
- Social features (activity feed, comments, weekly recap digests)
- Native and web push notifications
- Pick accuracy / season-long stats tracking

---

## Revision log

Deliberate deviations from the originally-specified architecture. Per
[code-standards.md](code-standards.md) § Documentation and spec sync, any code
that drifts from this spec updates the spec in the same PR and logs it here.

| Date | Ticket | Change |
| --- | --- | --- |
| 2026-05-17 | FND-004 | Database driver changed from the Neon HTTP driver to the Neon WebSocket-pooled driver (`drizzle-orm/neon-serverless`). Rationale: the HTTP driver does not support interactive `db.transaction()`, which is load-bearing for this app. Local development added: stock Postgres 17 in Docker via `node-postgres`, driver auto-selected by connection host. |
