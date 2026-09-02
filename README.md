# Depth 15 — Ireland Rugby Squad Depth Consensus

> "The pub argument, given a scoreboard and a memory."

[![Deploy to Production](https://github.com/Redser06/depth-15/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/Redser06/depth-15/actions/workflows/deploy-production.yml)
[![CI & Preview Deploy](https://github.com/Redser06/depth-15/actions/workflows/preview.yml/badge.svg)](https://github.com/Redser06/depth-15/actions/workflows/preview.yml)

**Depth 15** is a phone-first private web application for maintaining **one shared, living consensus depth chart for the Ireland rugby squad**: for each of the fifteen specialized positions, a ranked ladder of every player in contention, each carrying an agreed quality rating (0–100).

- **Production Live URL:** [https://depth-15.web.app](https://depth-15.web.app) (and [https://depth-15.firebaseapp.com](https://depth-15.firebaseapp.com))
- **GitHub Repository:** [https://github.com/Redser06/depth-15](https://github.com/Redser06/depth-15)

---

## Key Features

1. **Overall Team Analysis Radar Graph**
   - Interactive 7-axis SVG Spider / Radar chart mapping the squad's holistic profile:
     1. Props & Scrum Anchor (1 & 3)
     2. Hooking & Lineout Throw (2)
     3. Second Row Engine & Aerial (4 & 5)
     4. Back Row Breakdown & Collision (6, 7 & 8)
     5. Half-Back Tactical Direction (9 & 10)
     6. Midfield Defence & Blitz Channel (12 & 13)
     7. Back Three Aerial & Strike (11, 14 & 15)
   - Balanced unit scoring: 60% Starter Class + 40% Succession Depth Resilience.
   - Concentric benchmark rings at 50, 70, 80 (International), 90 (World Class), and 100.
   - **Honest Data Integrity**: Zero fabricated sentinel values (`50`, `0`). Any unit with absent active contenders renders a hollow `"No data"` vertex and is excluded from the Overall Index with the exact measured denominator disclosed (e.g. `6/7 measured units`).
   - **Mobile Layout**: Responsive viewBox margins (`-45 -20 610 520`) preventing outer spoke label collisions on mobile screens.
   - Tap any vertex or unit card to inspect starters, backups, depth ratings, and tactical commentary.

2. **Vacated Shirts Visibly Surfaced Across All UI Views**
   - When tactical starter assignments or injuries leave a shirt without an active starter, the system flags `unresolvedPositions`.
   - Surfaced with amber alert borders and explicit banners across:
     - **Main Grid (`PositionCard`)**: `⚠ Shirt Vacant: No eligible starter — all contenders assigned elsewhere`.
     - **Pub Mode (`PubModeView`)**: Warning card above the ladder prompting tactical reassignment.
     - **Conflict Banner (`SelectionConflictBanner`)**: Top-level alert highlighting vacant position numbers.
     - **Tactical Pitch (`RugbyPitchView`)**: Amber-ringed pulsating node with `⚠ VACANT` plaque.

3. **Dissent Transparency on Resolved Debates**
   - A passed proposal with outvoted dissent no longer hides the argument behind a flat majority score.
   - If consensus has variance (`stdDev > 3` or spread range $\ge 5$), the resolved card renders an explicit dissent banner:
     `Passed with dissent — range 51–90 (stdDev ±16.5) · 1 challenge vote(s) recorded`.
   - Shows typed actions (`Retired`, `Ladder Reordered`) instead of bare or sentinel numbers.

4. **Card-Matches-Maths Integration Verified**
   - Integration tests render resolved `ProposalCard` instances from `evaluateProposal` outputs and assert 100% equivalence between display copy and computed values, preventing UI drift.

5. **Broadcast Tactical Rugby Pitch Setup**
   - TV broadcast forward pack (3–2–3 scrum formation) and diagonal midfield stack with deep sweeper.
   - Interactive nodes with depth scores and tap-to-inspect contender ladders.

6. **Pro Analyst Drop-Off Cliffs & Unit Durability**
   - Succession waterfall graph contrasting Starter (#1) vs Primary Backup (#2) vs Third Choice (#3).
   - Flags fragile cliff-edges where the backup gap is $\ge 8$ points.

7. **Starter Uniqueness Constraint & Tactical Opportunity Costs**
   - Enforces the core rule: **A player cannot be #1 starter in 2 positions simultaneously**.
   - Automatically computes the opportunity cost of playing a star in one position versus another based on the replacement drop-off gap to the backup (e.g. Tadhg Beirne at 5 Lock vs 6 Blindside Flanker).

8. **Touch-First Drag-to-Rank Ladder UX & Mobile Ergonomics**
   - Native mobile touch drag (`@dnd-kit` with `TouchSensor` [100ms activation delay, 5px tolerance] & `PointerSensor`) alongside one-tap precision up/down stepper arrows (`touch-manipulation`, expanded touch targets).
   - Zero horizontal overflow (`scrollWidth === clientWidth`) across 360px–390px mobile viewports (iPhone SE/14/15, Galaxy S-series).
   - Tactical broadcast pitch with calibrated mobile vertical aspect ratio (`paddingBottom: '142%'`) and responsive plaques ensuring zero node overlap.

9. **Consensus Mathematics & Typed Domain Effects**
   - Strict 1:1 mathematical vote aggregation (exactly one entry per voter, zero double-counting, zero phantom votes).
   - Passed proposals apply verified state mutations (retirements set status to `retired` and purge starter assignments; re-rates update spread; additions insert contenders).

10. **Automated CI/CD Pipeline (GitHub Actions)**
    - **Pull Request CI (`preview.yml`)**: Runs typechecks, 47 Vitest tests, builds, and provisions a 7-day Firebase preview channel.
    - **Production CD (`deploy-production.yml`)**: Automatically tests, builds, and deploys merges to `main` straight to `https://depth-15.web.app`.

---

## Technical Stack & Scripts

- **Architecture:** 100% Firebase Hosting + Client-Consensus State Engine
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide Icons + Canvas Confetti
- **Gestures:** `@dnd-kit/core` & `@dnd-kit/sortable` (Touch & Pointer Sensors)
- **Testing:** Vitest + React Testing Library + JSDOM (47 tests: selection engine, 1:1 consensus math, adversarial probes, vacated ladders, honest radar data-integrity probe, card-matches-maths integration, mobile ergonomics & boundary invariants)
- **CI/CD:** GitHub Actions + Firebase Extended Hosting Action
- **Hosting:** Firebase Hosting Multi-site (`depth-15`)

```bash
# Development server
npm run dev

# Run Vitest test suite (47 tests)
npm test

# Typecheck and build
npm run typecheck
npm run build
```
