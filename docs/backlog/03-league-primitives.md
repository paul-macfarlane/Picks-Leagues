# Epic 03: League primitives

Leagues, memberships, invites, and commissioner settings. Reused across Pick'em, Elimination, and H2H modes.

**Status:** TODO

## Tickets

### LGE-001 — Schema: leagues, members, invites
**Status:** TODO
**Description:** Drizzle schemas for `leagues` (id, name, type, visibility, commissioner_id, status, settings_json, created_at, started_at), `league_members` (league_id, user_id, role, joined_at, removed_at), `league_invites` (league_id, code, expires_at, max_uses, uses).
**Acceptance criteria:**
- Migration runs
- `league.type` enum covers all four MVP modes
- `settings_json` typed as a discriminated union via Drizzle's `$type<>`
- Unique constraint: (league_id, user_id) for active memberships
**Dependencies:** FND-004

---

### LGE-002 — Route: create league
**Status:** TODO
**Description:** `POST /api/leagues`. Body: name, type, visibility, mode-specific settings. Validates against the mode's settings schema. Creator becomes commissioner + first member. Status starts as `draft`.
**Acceptance criteria:**
- Returns the created league
- Validates settings per mode
- Unauthenticated requests rejected
- Integration tested
**Dependencies:** LGE-001, FND-014

---

### LGE-003 — Route: list my leagues
**Status:** TODO
**Description:** `GET /api/leagues/me`. Returns leagues the authenticated user is a member of. Basic metadata only.
**Acceptance criteria:**
- Returns only the user's leagues
- Includes role per league
- Excludes `removed_at IS NOT NULL` memberships
- Integration tested
**Dependencies:** LGE-002

---

### LGE-004 — Route: get league details
**Status:** TODO
**Description:** `GET /api/leagues/:id`. Returns league info + member list. Settings included only for members.
**Acceptance criteria:**
- Members see full settings
- Non-members of public leagues see basic info only
- Non-members of private leagues get 404
- Integration tested
**Dependencies:** LGE-003

---

### LGE-005 — Route: update league settings (commissioner)
**Status:** TODO
**Description:** `PATCH /api/leagues/:id`. Commissioner-only. Pre-start: any setting can change. Post-start: only cosmetic fields (name).
**Acceptance criteria:**
- Non-commissioner gets 403
- Post-start non-cosmetic changes rejected with a clear error
- Integration tested
**Dependencies:** LGE-004

---

### LGE-006 — Routes: generate + redeem invite link
**Status:** TODO
**Description:** `POST /api/leagues/:id/invites` (commissioner) creates a code. `POST /api/leagues/join` (authenticated user) redeems a code. Enforces max uses + expiration + join-cutoff (no join after week 1 starts).
**Acceptance criteria:**
- Expired or fully-used codes return 410
- Joining after the first week starts returns 403 with a clear message
- Joining a league you're already in is a no-op (or returns 409)
- Integration tested
**Dependencies:** LGE-005

---

### LGE-007 — Routes: leave league + remove member
**Status:** TODO
**Description:** `DELETE /api/leagues/:id/members/me` (self-leave) and `DELETE /api/leagues/:id/members/:userId` (commissioner removes). Marks `removed_at`; doesn't hard-delete.
**Acceptance criteria:**
- Commissioner cannot leave without transferring commissionership (out of MVP scope — return 400)
- Removed members appear in historical standings but not active member lists
- Integration tested
**Dependencies:** LGE-006

---

### LGE-008 — Frontend: my leagues page
**Status:** TODO
**Description:** `/leagues` route. Lists user's leagues with type, status, member count. CTA to create or join.
**Acceptance criteria:**
- Loading: skeleton list
- Empty: helpful copy + Create / Join CTAs
- Error: retry action
- Happy: cards linking to each league
- Mobile responsive; dark mode parity
**Dependencies:** LGE-003, FND-015

---

### LGE-009 — Frontend: create league flow
**Status:** TODO
**Description:** Multi-step form (Dialog or page). Step 1: name + type + visibility. Step 2+: mode-specific settings with sensible defaults. Final step: review + create.
**Acceptance criteria:**
- All four states
- Inline validation errors
- Submitting creates the league and routes to its detail page
- Settings UI scoped to type (no irrelevant fields shown)
**Dependencies:** LGE-002, LGE-008

---

### LGE-010 — Frontend: league details page
**Status:** TODO
**Description:** `/leagues/:id` route. Header (name, type, status). Tabs: Standings (placeholder for now), Members, Settings (commissioner only).
**Acceptance criteria:**
- All four states
- Tab routing reflected in URL
- Non-members of public leagues see read-only view + Join CTA
- Mobile: tabs collapse to sheet or stack
**Dependencies:** LGE-004, LGE-008

---

### LGE-011 — Frontend: invite + join flow
**Status:** TODO
**Description:** Commissioner: generate invite, copy link, see active invites. Player: visit invite URL, sign-in if needed, accept invite.
**Acceptance criteria:**
- Invite URL works for new (sign-up → join) and existing (join directly) users
- Copy-to-clipboard works on mobile
- Errors (expired, full, league started) render clearly
**Dependencies:** LGE-006, LGE-010

---

### LGE-012 — Frontend: commissioner settings page
**Status:** TODO
**Description:** Settings tab. Form with all settings, pre-start; only name editable post-start. Confirm dialog before saving.
**Acceptance criteria:**
- All four states
- Disabled fields visually indicate why (lock icon + tooltip)
- Save triggers toast on success
**Dependencies:** LGE-005, LGE-010
