# UI Design Standards

These standards translate the [product vision](./product-vision.md) — "casual surface, precise engine," "Sunday afternoon with friends, not spreadsheet at the office" — into concrete UI rules.

## Foundation

### Component library: shadcn/ui

**shadcn/ui is the component library for this project.** All UI primitives come from shadcn. Tailwind CSS is the styling layer.

Why shadcn (and not Material UI, Mantine, Chakra, etc.):
- Components are copied into the repo, not imported from a package. We own them, can modify them, and don't ship a dependency runtime.
- Designed to compose with Tailwind, which the MVP spec already commits to.
- Default styling is clean and unfussy, which matches the brand character.
- Excellent accessibility defaults out of the box (Radix primitives underneath).

Don't add a second component library. Don't import raw Radix when a shadcn wrapper exists — use the wrapper for consistency.

### Color

**All colors are referenced via our own CSS variables, not raw Tailwind palette names.** This means changing the visual identity is a one-file edit (the var definitions), not a sweep through every component.

shadcn already establishes a set of CSS vars (`--background`, `--foreground`, `--primary`, `--destructive`, etc.). We **extend** that set with our domain-semantic vars and map them into the Tailwind theme so we get utility classes like `text-success`, `bg-push`, `border-warning`.

**Don't write `text-stone-500` or `bg-amber-500` in feature components.** Reference a semantic var: `text-muted-foreground`, `bg-primary`, `text-success`, etc.

**Base palette (initial values for our vars): Stone.** Warm neutrals — pure gray reads corporate; stone reads inviting.

**Accent (initial value of `--primary`): Amber-500.** Captures the autumn-Sunday character of the NFL season and visually separates the product from competitors (ESPN red, Yahoo purple, sportsbook neon).

**Semantic var set we add on top of shadcn's defaults:**

| Var | Initial light | Initial dark | Use |
|---|---|---|---|
| `--success` / `--success-foreground` | `emerald-600` / white | `emerald-400` / `stone-950` | Correct pick, win |
| `--error` / `--error-foreground` | `red-600` / white | `red-400` / `stone-950` | Incorrect pick, eliminated, error message |
| `--push` / `--push-foreground` | `stone-500` / white | `stone-400` / `stone-950` | Push, tie, neutral outcome |
| `--warning` / `--warning-foreground` | `amber-600` / white | `amber-400` / `stone-950` | Deadline approaching, attention-needed |

Defined in `apps/web/src/styles/globals.css` under `:root` (light) and `.dark` (dark). Mapped into the Tailwind theme via `tailwind.config.ts`.

**Dark mode is required from day one.** Configured via the standard shadcn theme provider with system-preference default. Every var has both a light and a dark value. Light-only screens are not "done." Verify both themes for every UI ticket.

### Typography

- **Font:** Inter, loaded via `@fontsource/inter`. System fallback stack.
- **Scale:** Tailwind defaults (`text-xs` through `text-5xl`). Don't introduce custom sizes.
- **Weights:** 400 (body), 500 (emphasis, labels), 600 (headings, buttons), 700 (rare — large numbers in standings).
- **Line height:** `leading-relaxed` for body copy, `leading-tight` for headings.
- **Numbers in standings / scores / spreads:** use `tabular-nums` so columns align.

### Spacing

- Tailwind's default 4px scale. Don't introduce custom values.
- Card padding: `p-4` mobile, `p-6` desktop.
- Form field spacing: `space-y-4`.
- Section spacing: `space-y-8` for major sections, `space-y-12` for top-level page sections.

### Radius and elevation

- Default radius: `rounded-lg` (`--radius: 0.5rem`). Don't go sharper or rounder without reason.
- Use shadow sparingly. `shadow-sm` for cards, `shadow-lg` for floating UI (popovers, dialogs). Don't stack shadows for drama.

## Visual character

Translating "Sunday afternoon with friends, not spreadsheet at the office":

- **Generous whitespace.** Crowded UIs feel like work. Empty space communicates calm.
- **Information density matches user intent.** A pick submission screen can be sparse and focused. A standings page is allowed to be dense because that's what the user came for.
- **No decorative chrome.** No gradient backgrounds, no border ornaments, no flashing badges. Stone + amber is enough.
- **No clip-art, no mascots, no emoji-as-illustration.** Lucide icons (shadcn's default) only.
- **No oversized empty-state illustrations.** A short helpful line of copy + a CTA is enough.
- **Real numbers, not "+1" gamification pills.** Standings should look like standings, not a game show.

## Mobile is the primary device

This product is used on phones. Sunday tailgates, couches, halftime checks, bathroom breaks at work. Desktop is the secondary surface — it gets a usable experience, but every screen is designed for the phone first and the desktop layout falls out from there.

What this means in practice:

- **Design at 375px first.** If a layout only makes sense at 1280px, it's wrong. Start mobile, then add breakpoint-prefixed utilities to widen for larger screens.
- **Bottom tab bar** for the 4–5 top-level destinations on mobile (My Leagues, App-Wide, H2H, Notifications, Profile). Desktop uses a slimmer top nav.
- **Sticky header on mobile** with current league context and the pick-submission CTA when relevant.
- **No hover-dependent interactions.** Anything important must work on tap. Hover is a desktop bonus, not a requirement.
- **Touch targets ≥ 44×44px.** No tiny icons that need a stylus to hit.
- **Bottom-anchored primary actions** on mobile forms — thumb reach matters.
- **Avoid layout shift on mobile.** Reserve space for async content (skeletons sized to match) so the page doesn't jump as data loads.
- **Performance.** Aim for Lighthouse mobile performance ≥ 90 at MVP launch. Code-split route bundles. Lazy-load below-the-fold widgets. Compress and serve appropriately sized images.
- **Test on real devices**, not just Chrome devtools. The audit ticket in epic 09 requires a real-device check.

### Layout sizing

- **Max content width:** `max-w-5xl` for content pages, `max-w-2xl` for forms.
- **No left sidebar nav on mobile.** Hamburger only when the bottom tab bar can't cover the destinations.

## Component patterns

| Pattern | Use |
|---|---|
| `Card` | League summary, match summary, leaderboard groupings |
| `Table` | Standings, leaderboards, pick history |
| `Form` (shadcn Form + react-hook-form + zod) | All forms. No exceptions. |
| `Dialog` | Confirmations, league creation, invite flow |
| `Sheet` | Mobile filter/settings panels |
| `Toast` (Sonner) | Async success/failure feedback (pick submitted, settings saved) |
| `Skeleton` | Loading state for content with known shape |
| Spinner (within Button) | Loading state for in-button actions |
| `Badge` | Status tags (eliminated, locked, money pick). Use sparingly. |

## States to design for

Every screen designs for **four states**, not just the happy path:

1. **Loading** — Skeleton for shaped content; spinner for in-button actions; never a blank screen.
2. **Empty** — Helpful copy + a clear CTA. ("No leagues yet. Create one or join with an invite.")
3. **Error** — Clear message, no stack traces shown, a retry action when retryable.
4. **Happy path** — The screen as intended.

Acceptance criteria for any UI ticket must include all four states or explicitly note which don't apply.

## Accessibility

- **WCAG 2.1 AA** is the minimum bar. AAA where shadcn defaults provide it.
- All interactive elements are keyboard-reachable and have visible focus indicators (`focus-visible:ring-2 focus-visible:ring-amber-500`).
- **Color is never the only signal.** Correct/incorrect picks show an icon + text label, not just a green/red color.
- **Color contrast:** 4.5:1 for text, 3:1 for UI elements and large text. Verify in both themes.
- **Touch targets:** 44×44px minimum on mobile. shadcn buttons hit this at `size="default"`.
- **Forms always have labels** (visible or `sr-only`). Error messages associate with their fields via `aria-describedby` (shadcn `FormMessage` handles this).
- All informational images/icons have alt text or `aria-label`. Decorative icons have `aria-hidden="true"`.
- Any interaction that uses drag (e.g., confidence ranking) must also be operable via keyboard.

## Copy and voice

This is the surface the player sees, so it gets the same care as the visual design.

- **Conversational.** "Make your picks" beats "Submit pick selections."
- **Direct.** "You're eliminated" beats "Unfortunately, your pick was incorrect and you have been removed from active competition."
- **No corporate hedging.** Don't apologize for things that don't warrant apology. Don't say "Please" in every sentence.
- **Light humor in empty states and loading screens is welcome.** Not jokes — just personality. ("Nothing here yet. The season hasn't started.")
- **No sports-betting jargon.** "Pick the spread" not "lay the points." "Your pick is locked" not "your wager is graded."
- **Numbers are first-class.** "5 picks remaining" beats "You still have picks to make." Show the number.

## Responsiveness checklist for every screen

- 375px (iPhone SE) — no horizontal scroll, all CTAs reachable with one thumb
- 414px (iPhone Pro Max) — no awkward gaps
- 768px (iPad portrait) — uses available width sensibly
- 1280px (desktop) — content doesn't stretch beyond `max-w-5xl`
- Dark mode parity verified
- Keyboard navigation verified
- No hover-dependent interactions
- Loading + empty + error states verified
