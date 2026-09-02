# Depth 15 — Ireland Rugby Squad Depth Consensus

> "The pub argument, given a scoreboard and a memory."

[![Deploy to Production](https://github.com/Redser06/depth-15/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/Redser06/depth-15/actions/workflows/deploy-production.yml)
[![CI & Preview Deploy](https://github.com/Redser06/depth-15/actions/workflows/preview.yml/badge.svg)](https://github.com/Redser06/depth-15/actions/workflows/preview.yml)

**Depth 15** is a phone-first private web application for maintaining **one shared, living consensus depth chart for the Ireland rugby squad**: for each of the fifteen specialized positions, a ranked ladder of every player in contention, each carrying an agreed quality rating (0–100).

- **Production Live URL:** [https://depth-15.web.app](https://depth-15.web.app) (and [https://depth-15.firebaseapp.com](https://depth-15.firebaseapp.com))
- **GitHub Repository:** [https://github.com/Redser06/depth-15](https://github.com/Redser06/depth-15)

---

## Key Features

1. **Broadcast Tactical Rugby Pitch Setup**
   - TV broadcast forward pack (3–2–3 scrum formation) and diagonal midfield stack with deep sweeper.
   - Interactive nodes with depth scores and tap-to-inspect contender ladders.

2. **Pro Analyst Visual Analytics & Drop-Off Cliffs**
   - Succession waterfall graph contrasting Starter (#1) vs Primary Backup (#2) vs Third Choice (#3).
   - Flags fragile cliff-edges where the backup gap is $\ge 8$ points.
   - Unit durability breakdowns across Front Row, Tight Five, Back Row, Halves, Midfield, and Back Three.

3. **Starter Uniqueness Constraint & Tactical Opportunity Costs**
   - Enforces the core rule: **A player cannot be #1 starter in 2 positions simultaneously**.
   - Automatically computes the opportunity cost of playing a star in one position versus another based on the replacement drop-off gap to the backup (e.g. Tadhg Beirne at 5 Lock vs 6 Blindside Flanker).

4. **Drag-to-Rank Ladder UX**
   - Drag and drop contender cards or use quick up/down steppers to rank order positions.
   - Dragging a contender to #1 dynamically reassigns the starting designation and re-evaluates conflicts.

5. **Streamlined Pub Rationale**
   - Zero-essay requirement for retirements/out players.
   - Quick 15-character minimum for rating challenges with one-tap quick reason chips.

6. **Automated CI/CD Pipeline (GitHub Actions)**
   - **Pull Request CI (`preview.yml`)**: Runs typechecks, 28 Vitest tests, builds, and provisions a 7-day Firebase preview channel with interactive PR comment.
   - **Production CD (`deploy-production.yml`)**: Automatically tests, builds, and deploys merges to `main` straight to `https://depth-15.web.app`.

---

## Technical Stack & Scripts

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide Icons + Canvas Confetti
- **Testing:** Vitest (28 tests across selection engine, consensus math, and tactical coordinates)
- **CI/CD:** GitHub Actions + Firebase Extended Hosting Action
- **Hosting:** Firebase Hosting Multi-site (`depth-15`)

```bash
# Development server
npm run dev

# Run Vitest test suite
npm test

# Typecheck and build
npm run typecheck
npm run build
```
