## Global League Rules

These apply to all game modes, not just Elimination leagues.

### Membership

- **League size:** 2 player minimum, 100 player maximum
- **Join cutoff:** Players cannot join once the first week of the league has started
- **Visibility:** Public (discoverable) or Private (invite-only) — configurable per league

### Settings & Commissioner Powers

- League settings are locked once the league begins. Only cosmetic fields (e.g., league name) can be edited after start.
- Eliminated players have the same pick visibility as active players — picks reveal at game kickoff for everyone.

# NFL

## Elimination League

Also known as a survivor or suicide pool. Each week, every member picks one team to win — either straight up or against the spread. Correct pick: you advance. Incorrect pick: you're eliminated. Last player standing wins.

### Core Rules

- One pick per week
- A team can only be picked once per season
- Picks can be made or changed up until the moment that specific game kicks off
- Picks become visible to other players once that game has started
- **Missed pick:** Player is auto-eliminated
- **Push / exact cover (Against the Spread) and Tie (Straight Up):** Resolution is configurable per league — see League Settings (default: player advances)
- **Everyone eliminated in the same week:** All affected players are revived and continue
- **Game cancelled or moved to a future week:** Pick is treated as a push — player survives and the team remains available for future use
- **Game postponed within the same week:** Pick resolves normally when the game is played

### Required League Settings

1. **Start Week** — must be a regular season week (Week 1–18)
2. **End Week** — must be a regular season week (Week 1–18) and on or after Start Week
3. **Pick Type** — Straight Up or Against the Spread
4. **Push / Tie Resolution** — How ATS pushes and SU ties are handled
   - Player advances _(default)_ — team is consumed (cannot be picked again)
   - Player is eliminated
5. **Tiebreaker** (when multiple players survive the End Week)
   - Split evenly _(default)_
   - Continue until one winner — same rules apply, including the revival rule if all remaining players are eliminated in the same extension week

### Optional League Settings

- **Lives / Strikes** — Commissioner can grant players more than one life (default: 1). A player is only eliminated after using all lives.
- **Buy-back** — Allow eliminated players to re-enter once, up to a commissioner-defined cutoff week.

## Weekly H2H Pick'em

In this game mode, you go head-to-head against a friend or a stranger in a one-week Pick'em competition. Each player picks 5 games from the current week — picks do not need to overlap with your opponent's picks. One of your picks is your **money pick**: worth +1 extra if correct, -1 if incorrect. Highest score at the end of the week wins.

### Core Rules

- **Match length:** 1 match = 1 regular season week (Weeks 1–18 only)
- **Pick count:** Each player makes exactly 5 picks per match
- **Money pick:** Required — one of your 5 picks must be designated as the money pick
- **Pick pool:** Players pick from any games in the current NFL week; players are not required to pick the same games as their opponent
- **Pick type:** Set at match creation — either Straight Up (SU) or Against the Spread (ATS) — and applies to all 5 picks. Cannot be mixed within a match.
- **Bye weeks:** Teams on bye are unavailable for selection that week
- **Eligibility:** Regular season only. Preseason and postseason are not eligible.

### Pick Submission & Locking

- **Submission:** All 5 picks must be submitted together as a batch, including money pick designation
- **Joining mid-week:** Players can join and submit picks after the week has started, but cannot pick games that have already kicked off
- **Per-game lock:** Each pick locks individually at its game's kickoff
- **Editing picks:** Picks for unstarted games can be changed up until that game's kickoff. To change any pick, the player must re-submit the batch and accept current odds on all unstarted games. Locked picks (kicked-off games) cannot be re-submitted or changed.
- **Money pick changes:** The money pick designation can be moved between unstarted games up until the designated game's kickoff
- **Odds locking rule:** When changing any pick, the player accepts the latest odds on ALL unstarted games. Players cannot selectively freeze some odds while taking new odds on others.
- **Pick visibility:** A player's picks become visible to their opponent on a per-game basis once each game kicks off

### Scoring

| Outcome        | Regular Pick                                            | Money Pick |
| -------------- | ------------------------------------------------------- | ---------- |
| Correct        | +1                                                      | +2         |
| Incorrect      | 0                                                       | -1         |
| Push (ATS)     | +0.5                                                    | +0.5       |
| Tie (SU)       | +0.5                                                    | +0.5       |
| Game cancelled | Treated as push (+0.5) until re-pick is made; see below |            |

### Game Cancellations & Re-picks

- **Cancelled game:** Player can re-pick any game that has not yet kicked off
- **Money pick on cancelled game:** Player can re-designate the money pick among any of their unstarted picks (not automatically inherited by the replacement pick)
- **No replacement available:** If no unstarted games remain when a cancellation occurs, the cancelled pick resolves as a push (+0.5)
- **Game postponed within same week:** Pick resolves normally when the game is played
- **Game moved to a different week:** Treated as a cancellation — re-pick available

### Tiebreaker

If both players have the same score at week's end, the winner is determined by **cumulative point differential** across all 5 picks (correct and incorrect):

- **Straight Up matches:** Sum of each picked team's actual margin of victory or defeat. Wins add positive margin; losses add negative margin.
- **Against the Spread matches:** Sum of each pick's margin vs. the spread. Covers add positive margin; non-covers add negative margin.
- **Money pick:** Treated equally to other picks in the differential calculation (no weighting)
- **Still tied:** Match ends in a tie. No further tiebreaker is applied.

### Match Creation & Matchmaking

- **Match types:** Friend match (direct invite) or Stranger match (matchmaking queue)
- **Friend matches:** Inviter sets the pick type (SU or ATS); invitee accepts or declines
- **Stranger matchmaking:**
  - Separate queues for SU and ATS — players are only matched within the same pick type
  - Matchmaking is first-come, first-served within the queue
  - Queue is current-week only — players cannot queue for future weeks
  - If no opponent is found before the first game of the week kicks off, the match is cancelled
- **Cancelled matches:** If a stranger match is cancelled due to no opponent being found, any picks the player submitted are discarded with no match record. The player's overall H2H record is unaffected (no win, no loss). Picks made in cancelled matches may still be tracked toward the player's overall pick accuracy/record stats if desired.
- **Recurring matchups:** Friends can opt into a recurring weekly H2H that auto-creates a new match each week of the season
  - Pick type (SU or ATS) carries over from the original match
  - Either player can propose a pick type change for future weeks; change requires mutual confirmation
  - Either player can end the recurring matchup at any time

### Edge Cases & Notes

- **Identical pick sets:** Allowed. If both players make the same 5 picks with the same money pick, the match will result in a tie (same score, same differential). Future enhancement: notify players when their opponent has locked identical picks.
- **Self-matching:** Players cannot compete against themselves
- **Missed picks:** Not possible under the all-at-once submission rule. A player either submits all 5 picks (for unstarted games) or has no active match.

## App-Wide Pick'em Competition

A weekly confidence pick competition open to all users. Players pick every game on the weekly slate and assign a unique confidence ranking to each. The higher your confidence on a correct pick, the more points you earn. Compete on the weekly leaderboard or build your standing across the full season.

### Competitions & Leaderboards

- **Straight Up (SU)** and **Against the Spread (ATS)** are fully separate competitions with separate slates, separate submissions, and separate leaderboards.
- A user may participate in both independently.
- Each competition runs two parallel leaderboards:
  - **Weekly leaderboard** — resets each week; reflects that week's confidence points only.
  - **Season leaderboard** — cumulative confidence points across all weeks; a running total for the entire regular season.
- One week of participation is sufficient to appear on the season leaderboard. Weeks a user does not submit count as zero points toward their season total.

### The Slate

- Each week, the competition slate is drawn from **Sunday and Monday games only**. Thursday Night games are excluded.
- If excluding Thursday games would result in a slate of fewer than **8 games**, the slate falls back to including Thursday games and the submission deadline shifts accordingly (see Deadlines below). This is expected to be rare.
- The slate is finalized and published when it is set for the week.

### Pick Format: Confidence Picks

- Players pick **every game on the slate** — there is no partial submission.
- For each game, the player selects a winner (SU) or a side against the spread (ATS).
- Players assign each game a unique **confidence rank** from **1 (least confident)** to **N (most confident)**, where N equals the number of games on the slate.
- Each rank may only be used once per submission. No two games can share a confidence value.

### Scoring

| Outcome                         | Points Earned                                      |
| ------------------------------- | -------------------------------------------------- |
| Correct                         | Full confidence value for that pick                |
| Incorrect                       | 0                                                  |
| Push (ATS) or Tie (SU)          | Half the confidence value (rounded to nearest 0.5) |
| Game cancelled, no re-pick made | Treated as a push — half confidence value          |

### Submission Deadline & Locking

- **Standard deadline:** All picks must be submitted before the first Sunday game of the week kicks off.
- **Thursday fallback weeks:** All picks must be submitted before the Thursday game kicks off.
- Individual picks lock at each game's kickoff. Picks for games that have already kicked off cannot be changed.
- Picks for unstarted games can be edited up until each game's kickoff, subject to the re-submission rules below.

### Editing Picks & Confidence Values

Players may edit their submission at any time before the deadline, with the following rules depending on what is being changed.

#### Changing Confidence Values Only (no pick changes)

- The player may re-arrange confidence values across any unstarted games freely.
- Existing spreads are preserved — the player does not need to accept new odds.
- Locked picks (games already kicked off) cannot have their confidence values changed.

#### Changing Actual Picks

- The player must accept the **most current spreads on all unstarted games** before the updated submission is accepted.
- Players cannot selectively freeze some spreads while accepting new ones on others.
- This rule applies in ATS only; SU picks carry no spread dependency.

### Missed Submissions

- If a player does not submit before the deadline, they receive **zero points** for that week.
- There is no auto-submission or default entry. A player must actively submit to participate.

### Game Cancellations

- If a game on the slate is cancelled after picks are locked, the pick is initially resolved as a **push** (half confidence value).
- The player may **re-pick** by substituting the cancelled game with any available unstarted game.

### Re-pick Rules

- By default, the new game inherits the **same confidence value** as the cancelled game.
- The player may re-arrange confidence values across their unstarted picks freely as part of re-picking.
- If the player changes any actual picks (not just confidence values), they must accept the latest spreads on all unstarted games (ATS only).
- If no unstarted games remain when the cancellation occurs, the push stands and no re-pick is available.

### Game Postponed Within the Same Week

- The pick resolves normally when the game is played. No re-pick is available.

### Game Moved to a Different Week

- Treated as a cancellation. Re-pick rules above apply.

### Tiebreakers

When two or more players finish a week with identical confidence point totals:

- **Straight Up:** Tiebreaker is the sum of each picked team's actual margin of victory or defeat across all picks. Correct picks contribute a positive margin; incorrect picks contribute a negative margin.
- **Against the Spread:** Tiebreaker is the sum of each pick's margin relative to the spread across all picks. Covers contribute a positive margin; non-covers contribute a negative margin.
- Push outcomes contribute **zero** to the tiebreaker differential.
- Confidence value has no weighting in the tiebreaker — all picks are treated equally.
- If players are still tied after the tiebreaker, they share the rank. No further tiebreaker is applied.

The same tiebreaker logic applies to the season leaderboard, using cumulative differential across all weeks of the season.

### Season Scope

- The competition runs across the **NFL regular season only (Weeks 1–18)**.
- Preseason and postseason weeks are not included.

## Pick'em League

A season-long league where members compete to build the best record picking games each week. Compete on the weekly in-league leaderboard or race to the top of the cumulative season standings.

### Core Rules

- Each week, every member submits a set number of picks from the current week's NFL slate (regular season only)
- Picks are made from any games in the current week; members are not required to pick the same games as one another
- Each pick locks individually at its game's kickoff; picks for unstarted games can be changed up until kickoff
- Picks become visible to other league members once that game has kicked off
- **Fewer games than picks-per-week:** If the week has fewer available games than the configured picks-per-week count, all members pick every available game that week. In confidence scoring weeks, confidence ranks are compressed accordingly (1 through the number of available games)
- **Missed picks:** Any unpicked slots for the week receive zero points — there is no auto-submission or default entry

### Standings

The league maintains two parallel standings:

- **Weekly leaderboard** — resets each week; reflects that week's points only
- **Season leaderboard** — cumulative points across all weeks of the league's duration; a running total from Start Week through End Week
  A member who submits no picks in a given week receives zero points for that week toward their season total. A single week of participation is sufficient to appear on the season leaderboard.

### Required League Settings

1. **Start Week** — must be a regular season week (Weeks 1–18)
2. **End Week** — must be a regular season week (Weeks 1–18) and on or after Start Week
3. **Pick Type** — Straight Up (SU) or Against the Spread (ATS)
4. **Picks Per Week** — number of picks each member makes each week (1–16; default: 5)
5. **Scoring Type**
   - **Standard** — flat points per outcome; see Scoring below
   - **Confidence** — picks ranked by confidence (1 = least confident, N = most confident); correct picks earn their full confidence value; see Scoring below
6. **Push / Tie Resolution** _(Standard scoring only)_ — how ATS pushes and SU ties are handled
   - Half point (+0.5) _(default)_
   - No credit (0)
   - Full credit (+1)

### Optional League Settings

- **Money Pick** — if enabled, each member designates one pick per week as their money pick; see Money Pick below

### Pick Submission & Locking

#### Standard Scoring

- Picks can be submitted individually or in a batch at any time before kickoff
- Each pick locks at its game's kickoff
- **SU leagues:** Picks can be added or changed freely at any time before kickoff — no spread dependency
- **ATS leagues:** When changing any pick, the member must accept the latest spreads on **all unstarted picks** before the change is saved. Members cannot selectively freeze some spreads while updating others

#### Confidence Scoring

- Picks and confidence rankings lock on a **per-game basis at each game's kickoff** — there is no hard submission deadline
- Members can submit picks, add new picks, or re-arrange confidence values across any unstarted picks at any time, including after some games have already kicked off
- Confidence values for games that have already kicked off cannot be changed
- **SU leagues:** Picks can be added or changed freely at any time before kickoff — no spread dependency
- **ATS leagues:** When changing any actual pick selection (not just re-ranking confidence values), the member must accept the latest spreads on **all unstarted picks** before the change is saved. Members cannot selectively freeze some spreads while updating others. Re-arranging confidence values only — without changing any pick selections — does not require accepting new spreads

#### Partially Submitted Weeks

Under both scoring types, a member who submits fewer than the picks-per-week count (e.g., submits 3 of 5 before all remaining games kick off) receives points only for picks submitted. Unpicked slots score zero.

### Scoring

#### Standard Scoring

| Outcome                    | Regular Pick                | Money Pick _(if enabled)_                                    |
| -------------------------- | --------------------------- | ------------------------------------------------------------ |
| Correct                    | +1                          | +2                                                           |
| Incorrect                  | 0                           | −1                                                           |
| Push (ATS) / Tie (SU)      | Per league Push/Tie setting | Per league Push/Tie setting (no money pick modifier applied) |
| Game cancelled, no re-pick | Treated as push             | Treated as push                                              |

#### Confidence Scoring

| Outcome                    | Regular Pick                                   | Money Pick _(if enabled)_                       |
| -------------------------- | ---------------------------------------------- | ----------------------------------------------- |
| Correct                    | Full confidence value                          | 2× confidence value                             |
| Incorrect                  | 0                                              | −(confidence value)                             |
| Push (ATS) / Tie (SU)      | Half confidence value (rounded to nearest 0.5) | Half confidence value (no doubling on push/tie) |
| Game cancelled, no re-pick | Treated as push                                | Treated as push                                 |

### Money Pick

When Money Pick is enabled for the league:

- Each member must designate exactly one of their picks for the week as their money pick
- The designation can be moved to any other unstarted pick up until that game's kickoff
- **Standard scoring:** the designated pick scores as +2 correct / −1 incorrect (see Scoring table above)
- **Confidence scoring:** the designated pick's confidence value is doubled if correct and negated if incorrect (see Scoring table above)
- **Undesignated money pick:** if a member's picks have all locked for the week but they never designated a money pick, they forfeit the money pick for that week — all picks score as regular picks. No penalty is applied
- **Game cancelled (money pick):** the money pick designation can be moved to any remaining unstarted pick. If no unstarted picks remain, the cancelled pick resolves as a push with no money pick modifier

### Game Cancellations & Re-picks

- **Cancelled game:** the pick is initially resolved as a push (see Scoring table for push value by scoring type)
- **Re-pick:** the member may substitute any available unstarted game for the cancelled pick
  - _Standard scoring (SU):_ no spreads need to be accepted for the replacement pick or any other unstarted picks
  - _Standard scoring (ATS):_ accepting the latest spread on the replacement pick is required, but not on other unstarted picks
  - _Confidence scoring:_ the replacement pick inherits the same confidence value as the cancelled pick by default; the member may re-arrange confidence values across their unstarted picks as part of the re-pick. If the re-pick changes an actual pick selection (ATS only), the member must accept the latest spreads on all unstarted picks
- **No replacement available:** if no unstarted games remain when the cancellation occurs, the push stands and no re-pick is available
- **Game postponed within the same week:** pick resolves normally when the game is played. No re-pick is available
- **Game moved to a different week:** treated as a cancellation — re-pick rules above apply

### Tiebreakers

#### Weekly Leaderboard

When two or more members finish a week with identical point totals:

- **Straight Up:** tiebreaker is the sum of each picked team's actual margin of victory or defeat across all picks. Wins contribute a positive margin; losses contribute a negative margin
- **Against the Spread:** tiebreaker is the sum of each pick's margin relative to the spread across all picks. Covers contribute a positive margin; non-covers contribute a negative margin
- Push and tie outcomes contribute **zero** to the tiebreaker differential
- Confidence value and money pick status have no weighting in the tiebreaker — all picks are treated equally
- **Still tied:** members share the rank. No further tiebreaker is applied

#### Season Leaderboard

The same tiebreaker logic applies to the season leaderboard, using cumulative differential across all weeks of the league's duration.

### Edge Cases & Notes

- **Identical pick sets:** Allowed. If multiple members submit identical picks (and identical confidence rankings in confidence mode), they will tie on both points and differential for that week
- **Season scope:** The league runs across the regular season weeks defined by Start Week and End Week. All regular season games — including Thursday Night games — are eligible for selection. Preseason and postseason weeks are not eligible

## NFL Win Total Pool

A season-long league where members predict whether NFL teams will finish Over or Under their projected regular-season win totals. Members submit all picks before the season begins, then watch their standings shift week by week as outcomes are clinched throughout the year.

### Core Rules

- Each member picks a commissioner-configured number of NFL teams and selects Over or Under the posted win total line for each
- For any pick, a member may optionally take an **Alt line** (an adjusted win total threshold) in exchange for a higher scoring multiplier
- Any pick — standard or Alt — may additionally be designated as a **Lock** for amplified reward and penalty
- All picks must be submitted before the first game kickoff of the league's Start Week and **cannot be changed thereafter**
- Picks become visible to all league members once the pick lock deadline passes (i.e., at the first kickoff of the Start Week)
- A team's pick resolves as soon as its outcome is mathematically certain — either by clinching or being eliminated from hitting the line — or at the conclusion of Week 18 if not yet resolved
- Standings update each week as picks resolve
- Regular season only (Weeks 1–18); postseason results are not counted toward win totals

### Win Total Lines

Win total lines for all 32 NFL teams are set and published by the app before the pick lock deadline. Lines are expressed in half-wins (e.g. 8.5) where possible to eliminate pushes on the main line, but whole-number lines may appear and are subject to push resolution (see League Settings).

### Pick Types

#### Standard Pick

A straight Over or Under on a team's posted main-line win total. No penalty for an incorrect pick.

| Outcome   | Points                             |
| --------- | ---------------------------------- |
| Correct   | +1                                 |
| Incorrect | 0                                  |
| Push      | Per league Push Resolution setting |

#### Alt Lines

A member may shift a team's win total threshold in one direction — Over higher, Under lower — in exchange for a scoring multiplier. Three tiers are available:

| Tier  | Line Adjustment | Multiplier |
| ----- | --------------- | ---------- |
| Alt 1 | ±1.5 wins       | 1.5×       |
| Alt 2 | ±3.0 wins       | 2×         |
| Alt 3 | ±4.5 wins       | 3×         |

**Example:** A team with a main line of 8.5 wins has the following available Alt lines:

| Direction | Alt 1     | Alt 2     | Alt 3     |
| --------- | --------- | --------- | --------- |
| Over      | 10.0 wins | 11.5 wins | 13.0 wins |
| Under     | 7.0 wins  | 5.5 wins  | 4.0 wins  |

**Scoring:** The multiplier applies to both the correct reward and, when combined with a Lock, the Lock penalty. Alt picks carry no incorrect penalty on their own — the harder threshold is the inherent risk.

| Outcome   | Alt 1 (1.5×)                | Alt 2 (2×)                  | Alt 3 (3×)                  |
| --------- | --------------------------- | --------------------------- | --------------------------- |
| Correct   | +1.5                        | +2                          | +3                          |
| Incorrect | 0                           | 0                           | 0                           |
| Push      | Push value × Alt multiplier | Push value × Alt multiplier | Push value × Alt multiplier |

**Tier availability:** Alt lines are bounded by the possible win range (0–17 wins). If a tier's adjusted line would fall outside this range, that tier is unavailable for that team. Example: a team with a main line of 15.5 wins cannot take Alt Over Tier 3 (would require 20 wins).

**Push on Alt lines:** Alt lines can land on whole numbers (e.g. Alt Over Tier 1 on an 8.5 line = 10.0 wins). If a team finishes exactly at a whole-number Alt line, it resolves as a push. Push value is multiplied by the Alt tier multiplier.

#### Locks

Any pick — standard or Alt — may be designated as a Lock. A Lock amplifies both the correct reward and the incorrect penalty for that pick.

- **Lock on standard pick:** correct and incorrect values use the league's configured Lock Scoring (see League Settings)
- **Lock on Alt pick:** the Lock Scoring values are multiplied by the Alt tier multiplier (multiplicative)
- **Push on a Locked pick:** push value is not modified by the Lock — the Alt multiplier still applies if the pick is also an Alt, but the Lock modifier is not applied to pushes

**Full scoring matrix (default Lock Scoring: +2 correct / −1 incorrect):**

| Pick Type       | Correct | Incorrect | Push             |
| --------------- | ------- | --------- | ---------------- |
| Standard        | +1      | 0         | Push value       |
| Alt 1 (1.5×)    | +1.5    | 0         | Push value × 1.5 |
| Alt 2 (2×)      | +2      | 0         | Push value × 2   |
| Alt 3 (3×)      | +3      | 0         | Push value × 3   |
| Lock (standard) | +2\*    | −1\*      | Push value       |
| Lock + Alt 1    | +3\*    | −1.5\*    | Push value × 1.5 |
| Lock + Alt 2    | +4\*    | −2\*      | Push value × 2   |
| Lock + Alt 3    | +6\*    | −3\*      | Push value × 3   |

_Default Lock Scoring values; configurable per league — see Required League Settings._

### Pick Submission & Locking

- All picks must be submitted before the first game kickoff of the league's Start Week
- The full submission — including all pick directions, Alt tier selections, and Lock designations — must be made before this deadline; no partial submissions or edits are permitted after the deadline passes
- A member who does not submit before the deadline has no picks for the league and scores zero
- Lock designations can be added, moved, or removed up until the deadline, subject to the league's Max Locks setting
- Alt line selections can be changed up until the deadline, subject to the league's Max Alt Picks setting

### Resolution

Picks resolve on a rolling basis throughout the regular season:

- **Over clinched:** the team has already secured more wins than the line (or Alt line) with games remaining
- **Under clinched:** the team can no longer reach the line (or Alt line) given remaining games
- **Season end:** any pick not yet resolved at the conclusion of Week 18 resolves at that point based on the team's final record

Standings are recalculated and updated each week as individual picks resolve.

### Standings

The league maintains a single standings view that updates weekly as picks resolve throughout the season. There is no separate weekly leaderboard — all scoring is cumulative from the single preseason submission through the end of Week 18.

A member who submits no picks scores zero for all slots.

### Required League Settings

1. **Start Week** — Week 1 or Week 2 only. Picks lock at the first game kickoff of the selected week.
2. **Teams Per Player** — number of teams each member picks (range: 1–32; default: 10). All members pick the same number of teams.
3. **Max Locks** — maximum number of picks a member may designate as Locks (range: 0–Teams Per Player; default: 3). Setting to 0 disables Locks for the league.
4. **Max Alt Picks** — maximum number of picks a member may take at an Alt line (range: 0–Teams Per Player; default: 5). Setting to 0 disables Alt lines for the league.
5. **Push Resolution** — how a pick resolves when a team's final win total lands exactly on a whole-number line:
   - Half point (+0.5) _(default)_
   - No credit (0)
   - Full credit (+1)
6. **Lock Scoring** — the correct reward and incorrect penalty applied to Locked picks (used as base values before any Alt multiplier):
   - Correct: configurable (default: +2)
   - Incorrect: configurable (default: −1)

### Tiebreaker

When two or more members finish with identical scores, the tiebreaker is the **sum of pick margins** across all picks:

- **Over picks:** team's actual final wins minus the picked line (positive if Over hit; negative if not)
- **Under picks:** picked line minus the team's actual final wins (positive if Under hit; negative if not)
- Alt line picks use the **Alt line** as the reference, not the main line
- Lock status has no weighting in the tiebreaker — all picks are treated equally
- Push outcomes contribute **zero** to the tiebreaker differential
- **Still tied:** members share the rank. No further tiebreaker is applied.

### Edge Cases & Notes

- **Fractional main lines (e.g. 8.5 wins):** Pushes are not possible on the main line itself. Alt lines derived from a fractional main line may land on whole numbers and can push (e.g. Alt Over Tier 1 on 8.5 = 10.0 wins).
- **Whole-number main lines (e.g. 9.0 wins):** Pushes are possible and resolve per the league's Push Resolution setting. Alt lines derived from a whole-number main line may be fractional (no push) or whole-number (push possible), depending on the tier.
- **Alt tier unavailable:** If a tier's adjusted line falls outside 0–17 wins, that tier is not selectable for that pick. The remaining tiers remain available.
- **Partial submissions:** Not applicable. A member either submits their full set of picks (up to Teams Per Player) before the deadline or does not. Unpicked slots score zero with no penalty.
- **Undesignated Locks:** A member is not required to use their full Lock or Alt allowance. Unused slots carry no penalty.
- **Identical pick sets:** Allowed. Members with identical picks (same teams, same pick directions, same Alt tiers, same Locks) will tie on both score and tiebreaker differential.
- **Team unavailable:** In the unlikely event a team's win total line is not published before the pick deadline, that team is unavailable for selection that week.

## Franchise Pool

A season-long league where members select a set of NFL teams and earn points based on those teams' performance across the regular season and, optionally, the playoffs. Unlike fantasy football, team selections are non-exclusive — multiple members can pick the same team. Members can amplify their selections through Locks, which multiply rewards for correct outcomes and introduce proportional penalties for incorrect ones.

### Core Rules

- Each member selects a commissioner-configured number of NFL teams before the pick deadline
- Multiple members may select the same team — picks are non-exclusive
- All picks must be submitted before the first game kickoff of the league's Start Week and cannot be changed thereafter
- Picks become visible to all league members once the pick deadline passes
- A member who does not submit before the deadline has no picks and scores zero
- Standings update on a rolling basis as regular season weeks complete and, if postseason scoring is enabled, as each playoff round completes
- Regular season only (Weeks 1–18) unless postseason scoring is enabled by the commissioner

### Pick Submission & Locking

- All team selections, Lock designations, and Lock Scoring multiplier choices must be submitted as a complete set before the pick deadline
- The pick deadline is the first game kickoff of the league's Start Week
- No partial submissions or edits are permitted after the deadline passes
- A member who does not submit before the deadline scores zero and has no picks for the league
- Members are not required to use their full Teams Per Player allotment or their full Lock allowance. Unused slots carry no penalty

### Scoring

All scoring categories are independently configurable per league. The categories are:

### Regular Season

| Category               | Default Points |
| ---------------------- | -------------- |
| Per regular season win | +1             |
| Division title         | +3             |
| Playoff berth          | +2             |

- **Regular season wins** accumulate weekly as games are played throughout Weeks 1–18
- **Division title** resolves at the conclusion of Week 18 based on final standings
- **Playoff berth** resolves when a team mathematically clinches a playoff spot, or at the conclusion of Week 18 if not yet resolved

### Postseason _(if enabled)_

Each playoff round has its own independently configurable points-per-win value:

| Round                   | Default Points Per Win |
| ----------------------- | ---------------------- |
| Wild Card               | +2                     |
| Divisional              | +3                     |
| Conference Championship | +4                     |
| Super Bowl              | +5                     |

- **Bye rule:** Teams that receive a first-round bye earn the Wild Card round win points automatically. They are not penalized for not playing in that round
- If postseason scoring is disabled, all scoring ends after Week 18. Division title and playoff berth bonuses still apply; playoff round points do not

### Locks

Any team/category combination may be designated as a Lock. A Lock applies a configurable multiplier to the correct reward for that category and introduces a proportional penalty for the inverse outcome. Lock multipliers range from 1× to a commissioner-configured maximum (default max: 3×).

### How Locks Work by Category Type

- **Binary categories** (Division Title, Playoff Berth) — the team either achieves the outcome or does not. The Lock multiplier is applied to the category's base point value for the correct reward and the incorrect penalty
- **Per-win categories** (Regular Season Wins, all Playoff Round Wins including Wild Card bye) — the Lock multiplier is applied per win for the correct reward and per loss for the incorrect penalty. A team that goes 10–7 on a locked Regular Season Wins pick earns points for 10 wins at the Lock correct value and incurs a penalty for 7 losses at the Lock incorrect value

### Lock Scoring

Lock Scoring is expressed as a multiplier on each category's base point value — both correct reward and incorrect penalty. Multipliers are set independently per Lock designation, up to the league's configured maximum.

**Default Lock Scoring (at 2× multiplier, using default category values):**

| Category                | Standard   | Locked (2×)              |
| ----------------------- | ---------- | ------------------------ |
| Regular Season Win      | +1 per win | +2 per win; −1 per loss  |
| Division Title          | +3 if won  | +6 if won; −3 if not     |
| Playoff Berth           | +2 if made | +4 if made; −2 if missed |
| Wild Card (incl. bye)   | +2 per win | +4 per win; −2 per loss  |
| Divisional              | +3 per win | +6 per win; −3 per loss  |
| Conference Championship | +4 per win | +8 per win; −4 per loss  |
| Super Bowl              | +5 per win | +10 per win; −5 per loss |

_All category point values are configurable per league. Lock values scale proportionally with the category's configured base value and the chosen multiplier._

- **Push on a Locked pick:** Pushes are not applicable to per-win categories. For binary categories, if a push scenario arises (see Edge Cases), the Lock modifier is not applied — the outcome resolves at the standard push value only
- **Unused Locks:** Members are not required to use their full Lock allotment. Unused Lock slots carry no penalty

### Standings

The league maintains a single cumulative standings view that updates as scoring events occur throughout the season. There is no separate weekly leaderboard — all scoring is cumulative from the pick deadline through the end of the league's scoring window.

- If postseason scoring is **disabled**, the league concludes at the end of Week 18
- If postseason scoring is **enabled**, the league concludes after the Super Bowl

### Required League Settings

1. **Start Week** — Week 1 or Week 2 only. Picks lock at the first game kickoff of the selected week.
2. **Teams Per Player** — number of teams each member selects (range: 1–32; default: 8). All members select the same number of teams.
3. **Include Postseason Scoring** — yes or no. If yes, playoff round scoring applies and the league extends through the Super Bowl. If no, scoring ends after Week 18.
4. **Regular Season Win Points** — points earned per regular season win (default: +1)
5. **Division Title Points** — points earned for a selected team winning their division (default: +3)
6. **Playoff Berth Points** — points earned for a selected team making the playoffs (default: +2)
7. **Playoff Round Points** _(if postseason enabled)_ — points per win, configured independently per round:
   - Wild Card (default: +2)
   - Divisional (default: +3)
   - Conference Championship (default: +4)
   - Super Bowl (default: +5)
8. **Max Locks** — maximum number of team/category Lock designations a member may make (range: 0–(Teams Per Player × number of enabled scoring categories); default: 3). Setting to 0 disables Locks for the league.
9. **Max Lock Multiplier** — maximum multiplier a member may apply to any single Lock designation (range: 1×–4×; default max: 3×). Applies per Lock, not as a cumulative cap.

### Tiebreaker

When two or more members finish with identical scores, the tiebreaker is the **sum of regular season wins** across all of their selected teams.

- Lock status has no weighting in the tiebreaker — all teams are treated equally
- **Still tied:** members share the rank. No further tiebreaker is applied.

### Edge Cases & Notes

- **Non-exclusive picks:** Multiple members selecting the same team is expected and allowed. All members who selected a team earn the same points for that team's outcomes.
- **Bye teams:** Earn Wild Card round win points automatically. No pick action required by the member.
- **Team misses playoffs:** No playoff round points are earned for that team. Division title and playoff berth bonuses (or penalties, if Locked) resolve independently based on those outcomes.
- **Postseason disabled:** Playoff round points are not available. Members are scored solely on regular season wins, division titles, and playoff berths.
- **Identical pick sets:** Allowed. Members with identical team selections and Lock designations will tie on both score and tiebreaker.
- **Unused pick slots:** A member is not required to fill all Teams Per Player slots before the deadline. Unpicked slots score zero with no penalty.
- **Push on binary categories:** Occurs only in extraordinary circumstances (e.g., a division title is vacated or voided). The Lock modifier is not applied to a push outcome — push resolves at the standard push value only. This is expected to be extremely rare.
- **Team unavailable:** In the unlikely event a team cannot be included before the pick deadline, that team is unavailable for selection and the commissioner is notified.
- **Postseason scope:** This is the only Franchise Pool game mode that extends beyond Week 18 when postseason scoring is enabled. All other scoring categories (wins, division title, playoff berth) are still determined by regular season results only.

---

# NCAA Basketball

## March Madness Pool

A bracket-based competition tied to the NCAA Men's Basketball Tournament. Members submit one or more brackets predicting the outcome of every Round of 64 game through the National Championship before the tournament's first round begins. Points are awarded for each correct prediction, with later rounds worth more. Compete within your pool's leaderboard from the Round of 64 through the Championship.

### Bracket Structure

The tournament field consists of 68 teams organized into four regions. The First Four (4 play-in games) reduce the field to 64 before the main bracket begins. Members do not pick First Four games — those results are known before the submission deadline, and the 64-team field is set by the time picks open.

Rounds members pick:

| Round        | Games |
| ------------ | ----- |
| Round of 64  | 32    |
| Round of 32  | 16    |
| Sweet 16     | 8     |
| Elite Eight  | 4     |
| Final Four   | 2     |
| Championship | 1     |

**Total picks per bracket: 63**

### Pick Submission & Locking

- Picks open once all First Four games have concluded and the 64-team field is fully set
- All picks must be submitted before the first Round of 64 game kicks off
- Picks cannot be changed after the deadline passes
- A member who does not submit a bracket before the deadline has no entry and scores zero for that bracket
- Multiple brackets are supported up to the pool's configured maximum; each bracket is tracked and scored independently
- Each bracket requires a **Championship Score Prediction** — a whole-number estimate of the combined total points scored in the Championship game, used as a tiebreaker

### Scoring

Points are awarded per correctly predicted game. The scoring model is set by the commissioner.

### Base Scoring Models

**Standard Doubling (default)**

| Round        | Points per correct pick |
| ------------ | ----------------------- |
| Round of 64  | 1                       |
| Round of 32  | 2                       |
| Sweet 16     | 4                       |
| Elite Eight  | 8                       |
| Final Four   | 16                      |
| Championship | 32                      |

**Custom**

The commissioner sets each round's point value independently. Any non-negative integer is valid.

### Upset Bonus _(optional)_

When enabled, members earn additional points for correctly predicting a lower seed defeating a higher seed (i.e., a numerically higher seed beats a numerically lower seed). Seeds are determined by the Selection Committee and carry through the entire tournament — upset bonus eligibility is based on the original tournament seeds of both teams in any given game, regardless of round.

The commissioner chooses the calculation model:

**Seed Differential**

Bonus = (winning seed − losing seed) × configurable multiplier

- Multiplier range: 0.5×–5× (default: 1×)
- Example: correctly picking a 12-seed over a 5-seed earns (12 − 5) × multiplier = 7 × multiplier bonus points

**Flat Per Upset**

A fixed bonus awarded for any correct upset pick, regardless of seed gap.

- Flat bonus value: configurable (default: 1 point)
- Any correct pick where the winning team's seed is numerically higher than the losing team's seed qualifies

The upset bonus stacks on top of the base round points. It applies only to correct predictions — an incorrect upset pick earns no base points and no bonus.

### Perfect Round Bonus _(optional)_

When enabled, a member earns a bonus for correctly predicting every game in a given round. The bonus is configured per round independently.

- A member must correctly pick all games within the round to earn the bonus; a single miss forfeits it for that round
- The bonus is additive on top of base points and any upset bonuses earned in that round

### Standings

Each pool maintains a single leaderboard that updates as games are played throughout the tournament. All scoring is cumulative from the Round of 64 through the Championship. There is no per-round leaderboard reset.

- Each bracket is listed as a separate entry; a member with multiple brackets appears once per bracket
- Brackets are labeled per member (e.g., "Bracket 1", "Bracket 2") and display the member's name
- Standings update after each game completes

### Game Cancellations & Vacated Teams

If a game is cancelled or a team is disqualified or vacated mid-tournament:

- The pick for that specific game resolves as a **push** — no points awarded, no penalty
- The vacated team's slot **auto-advances** through the bracket. All subsequent round picks involving that slot remain live and score normally at full base point value if correct
- No upset bonus is awarded for an auto-advance game (since no game is played)
- If the auto-advancing slot loses a future game, the pick simply misses; members who had picked the opponent score correctly as normal

### Tiebreaker

When two or more members (or brackets) finish with identical point totals:

- **Championship Score Prediction** — the member whose predicted total points is closest to the actual combined final score wins the tiebreaker. Over and under are treated equally; only the absolute difference from the actual score matters
- If two members are equidistant from the actual score (one over and one under by the same margin), they share the rank
- **Still tied:** members share the rank. No further tiebreaker is applied

The tiebreaker applies both across different members and between a single member's multiple brackets.

### Required League Settings

1. **Max Brackets Per Member** — maximum number of brackets each member may submit (range: 1–10; default: 5)
2. **Scoring Model** — Standard Doubling (default) or Custom (commissioner sets each round independently)
3. **Visibility** — Public (discoverable) or Private (invite-only)

### Optional League Settings

1. **Upset Bonus** — enabled or disabled (default: disabled). If enabled:
   - **Bonus Type** — Seed Differential or Flat Per Upset
   - If Seed Differential: **Multiplier** (default: 1×; range: 0.5×–5×)
   - If Flat Per Upset: **Bonus Value** (default: 1 point per upset)
2. **Perfect Round Bonus** — enabled or disabled (default: disabled). If enabled: **Bonus Per Round** — commissioner sets a point bonus independently for each round (any round may be set to 0 to opt that round out)

### Membership

- **League size:** 2 player minimum, 100 player maximum
- **Join cutoff:** Players cannot join once the Round of 64 has started
- **Visibility:** Public (discoverable) or Private (invite-only) — configurable per pool

### Edge Cases & Notes

- **Identical brackets:** Allowed. Two members with identical picks and the same Championship score prediction will tie on both score and tiebreaker and share rank.
- **Seedings carry through:** Upset bonus eligibility is always based on original Selection Committee seeds, not any re-seeding or bracket positioning. A 3-seed vs 1-seed Championship game is an eligible upset scenario.
- **Field not yet set:** Members cannot submit brackets before all First Four games are complete and the 64-team field is finalized.
- **Team listed in wrong region or seed error:** If the app publishes an incorrect seeding that is corrected before picks lock, brackets are wiped and members are notified to re-submit. After the pick deadline, seedings are frozen for scoring purposes.
- **Game postponed within the tournament:** The pick remains live and resolves normally when the game is played.
- **Automatic advancement and perfect round bonus:** A round containing at least one auto-advance game can still yield a perfect round bonus, provided all actual games in that round were correctly picked. Auto-advance slots are neutral — they neither count as a correct pick nor prevent the bonus.
- **Unused bracket slots:** A member is not required to use all of their Max Brackets Per Member allotment. Unused slots carry no penalty.
- **Season scope:** Covers the full NCAA Men's Basketball Tournament from the Round of 64 through the National Championship. The First Four, NIT, and other tournaments are not included.

---

## App-Wide Bracket Competition

A free-to-enter bracket competition open to all app users each year. Every user gets one bracket and competes on a single app-wide leaderboard. No commissioner, no pool settings — the rules are standardized across the entire competition.

### Core Rules

- One bracket per user
- All 63 games are picked (Round of 64 through Championship)
- First Four games are not picked — picks open once all First Four results are in and the 64-team field is set
- All picks must be submitted before the first Round of 64 game kicks off
- Picks cannot be changed after the deadline
- A user who does not submit before the deadline has no entry and scores zero
- Each bracket submission requires a **Championship Score Prediction** for tiebreaker purposes

### Scoring

Standard Doubling scoring applies to all users. No upset bonus, no perfect round bonus.

| Round        | Points per correct pick |
| ------------ | ----------------------- |
| Round of 64  | 1                       |
| Round of 32  | 2                       |
| Sweet 16     | 4                       |
| Elite Eight  | 8                       |
| Final Four   | 16                      |
| Championship | 32                      |

**Maximum possible score: 192 points**

### Leaderboards

The competition runs two parallel leaderboards:

- **Overall leaderboard** — cumulative points from Round of 64 through the Championship; the primary standings view
- **Round leaderboard** — points earned in the most recently completed round only; resets each round

One bracket submission is sufficient to appear on both leaderboards. Users who do not submit receive zero points and do not appear.

### Pick Submission & Locking

- Picks open once all First Four games have concluded
- Submission deadline: before the first Round of 64 game kicks off
- Picks lock on a per-game basis at each game's tipoff — picks for games that have not yet tipped off cannot be changed after the overall deadline, but a pick for a game that has already tipped off is locked and uneditable regardless
- No partial submissions — a bracket is only accepted when all 63 picks and a Championship Score Prediction are present

### Game Cancellations & Vacated Teams

Identical to March Madness Pool rules:

- The pick for the affected game resolves as a push — no points, no penalty
- The vacated team's slot auto-advances through the bracket
- Subsequent picks involving the auto-advanced slot score normally if correct; no upset bonus applies (no game played)

### Tiebreaker

When two or more users finish with identical point totals:

- **Championship Score Prediction** — the user whose predicted total is closest to the actual combined final score wins. Over and under are treated equally.
- If equidistant: users share the rank
- **Still tied:** users share the rank. No further tiebreaker is applied

### Edge Cases & Notes

- **One bracket only:** Users cannot submit multiple entries. The bracket competition is intentionally a single-entry format to keep competition straightforward.
- **No commissioner:** Settings are fixed app-wide. There are no configurable scoring or bonus options.
- **Seedings carry through:** Original Selection Committee seeds are used for all game pairings and scoring purposes throughout the tournament.
- **Season scope:** Covers the full NCAA Men's Basketball Tournament from the Round of 64 through the National Championship. First Four, NIT, and other tournaments are not included.

I also want the app to support march madness pools. These ones are pretty straight forward since this is a very common game type in sports apps.

Each pool has the following configurations

- Max brackets per member
- scoring configuration per round

Tie breaker will be the total points scored in the championship.

Brackets can be submitted up until the first round of 64 game. Games and teams before that can be picked of course.
