# Epic 09: Cross-cutting polish

Observability, performance, accessibility, and brand surfaces. Some tickets get partially done during other epics; the audit-style tickets happen at the end.

**Status:** TODO

## Tickets

### POL-001 — Structured logging
**Status:** TODO
**Description:** `pino` (or similar) in the API. Request id propagated. User id when authenticated. Cron handlers log start/end with timing.
**Acceptance criteria:**
- Every request has a request id in logs
- Cron handlers log a structured `started` and `completed` event with duration
- Log levels are environment-configurable
**Dependencies:** FND-005

---

### POL-002 — Error tracking
**Status:** TODO
**Description:** Sentry (or alternative) in both web and API. PII scrubbing configured. Source maps uploaded.
**Acceptance criteria:**
- Frontend errors appear in Sentry with source-mapped stack traces
- API errors appear with request context
- PII (email, tokens) is scrubbed from payloads
**Dependencies:** FND-005, FND-009

---

### POL-003 — Production smoke tests
**Status:** TODO
**Description:** Playwright suite hitting a prod-like preview deploy. Critical user journeys: sign-in, create league, submit picks, view standings. Runs nightly + on demand.
**Acceptance criteria:**
- Suite runs in CI on a schedule
- Failures notify (email/Slack)
- Suite under 5 minutes
**Dependencies:** PKM-017

---

### POL-004 — Standings query performance audit
**Status:** TODO
**Description:** Profile under realistic load (~50 leagues × 30 members). Add indexes or denormalization where needed. Document the graduation signal that triggers Redis caching.
**Acceptance criteria:**
- Standings query p95 under 200ms at the load above
- Indexes documented in the schema files
- `docs/runbook.md` references the graduation signal
**Dependencies:** PKM-007

---

### POL-005 — Accessibility audit
**Status:** TODO
**Description:** Axe scan on every key page. Keyboard nav verified. Screen reader (VoiceOver) walkthrough of critical flows. Color contrast verified in both themes.
**Acceptance criteria:**
- Zero axe critical/serious violations on key pages
- All critical flows operable via keyboard only
- Both themes pass contrast checks
**Dependencies:** PKM-017

---

### POL-006 — Mobile responsiveness sweep
**Status:** TODO
**Description:** 375 / 414 / 768 / 1280 verified on every page. Touch targets ≥ 44px. Fix any horizontal scroll regressions.
**Acceptance criteria:**
- No horizontal scroll on any page at 375px
- All interactive elements meet 44×44 minimum
- Audit notes recorded in this ticket
**Dependencies:** PKM-017

---

### POL-007 — Empty / loading / error state sweep
**Status:** TODO
**Description:** Final pass against UI standards. Add any missing states.
**Acceptance criteria:**
- Every key page audited
- Gaps closed
- Spot-check log in this ticket
**Dependencies:** PKM-017

---

### POL-008 — Brand surfaces: landing, about, FAQ
**Status:** TODO
**Description:** One-page marketing landing for `/`. `/about` explaining the founder's story + commitments (free, no ads, independent, built by someone who plays). `/faq` covering common questions.
**Acceptance criteria:**
- All three pages live and responsive
- Voice matches the product vision (casual, direct, no corporate hedging)
- Accessible (a11y verified)
**Dependencies:** FND-015

---

### POL-009 — Terms of service + privacy policy
**Status:** TODO
**Description:** Drafted with legal review for MVP launch. Linked from footer and sign-in.
**Acceptance criteria:**
- Both pages published
- Footer links in place
- Sign-in surfaces the privacy link before consent
**Dependencies:** POL-008

---

### POL-010 — Production runbook
**Status:** TODO
**Description:** `docs/runbook.md`: how to roll back, how to drain a stuck cron, how to handle an ESPN outage, how to investigate a scoring discrepancy. On-call expectations.
**Acceptance criteria:**
- Runbook covers the listed scenarios
- Includes contact info / pager / on-call schedule (likely "founder is on call" for MVP)
- Referenced from root README
**Dependencies:** POL-001, POL-002
