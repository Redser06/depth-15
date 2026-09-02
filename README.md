# Depth 15 — Ireland Rugby Squad Depth Consensus

> "The pub argument, given a scoreboard and a memory."

**Depth 15** is a phone-first private web application for maintaining **one shared, living consensus depth chart for the Ireland rugby squad**: for each of the fifteen specialized positions, a ranked ladder of every player in contention, each carrying an agreed quality rating (0–100).

Every rating is the visible output of a proposal debated in the open with recorded rationales, quorum checks, and a median-of-counter-values consensus engine.

---

## Key Features

1. **Bright Irish Rugby Aesthetic (Default)**
   - Crisp light canvas (`#F8FAF8`), high-contrast slate typography, with authentic Irish rugby accents: muted heritage greens (`#0D6938`), shamrock emerald (`#16A34A`), deep navy (`#0F1E36`), and amber.
   - Dedicated Dark Mode toggle available for dim pub environments.

2. **Full 15-Position Depth Chart**
   - Pack / Forwards (1 to 8) and Backs Division (9 to 15).
   - Weighted decay Depth Score across ranked contenders (1 to 7 players) with Depth Bands (Elite, Excellent, Strong, Solid, Thin, Vulnerable).
   - Uncapped players flagged with `*`.
   - Secondary position cover ratings.

3. **Consensus Spread & Contested Ratings**
   - Visual error-bar track showing min, median, and max ratings.
   - Disputed ratings flagged with hatched amber stripes and dispute counters.

4. **📱 Pub Mode (Phone-First View)**
   - Glanceable, one-position-at-a-time screen with large tap targets.
   - Quick 1–15 stepper/swipe controls.
   - 3-tap challenge and proposal trigger.

5. **Propose-and-Challenge Engine**
   - Proposal types: Re-rate, Add player, Retire/archive.
   - **Mandatory Rationale**: Minimum 140 characters enforced. "No naked numbers."
   - **Median-of-Counters Resolution**: The consensus rating is the median of all submitted support and challenge values (including the proposer's), not a single individual's opinion.
   - Quorum requirement: 50% active members.

6. **Season 2026–27 Re-Base Window (4 Structured Gates)**
   - **Gate 1 — Attrition**: Review active pool for retirement, injury, or overseas ineligibility.
   - **Gate 2 — Entry**: Intake candidates across 4 streams (Newly capped, U20/Emerging, Provincial breakthroughs, Exiles).
   - **Gate 3 — Re-rate**: 15-position sweep; unchallenged ratings roll over automatically.
   - **Gate 4 — Sign-off**: Snapshots immutable version `2026-27.0` and unlocks in-season debate.

7. **Snapshot History & Diff Engine**
   - Includes immutable **2025 Baseline** dataset (80 primary + 34 secondary entries).
   - Side-by-side diff comparing any two versions.

8. **Dual-Door Access Model**
   - Group Code (e.g. `IRE-2627-9F3K`) gives instant read-only access (pub-ready in 10 seconds).
   - Participant identity switcher (Conor [Owner], Ronan, Declan, Brian, Fiona, Eoin, Table Guest).
   - Production PostgreSQL migration and RLS policies included in `supabase/migrations/`.

---

## Getting Started

### Local Development
```bash
npm install
npm run dev
```

### Run Tests
```bash
npm test
```

### Type Check & Production Build
```bash
npm run typecheck
npm run build
```

---

## Technical Stack
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide Icons + Canvas Confetti
- **Testing:** Vitest
- **Database Schema:** PostgreSQL + Row-Level Security (Supabase-ready)
