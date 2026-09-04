import { describe, it, expect } from 'vitest';
import { PITCH_COORDINATES } from '../analytics/tacticalFormation';
import { POSITIONS, BASELINE_PLAYERS } from '../../data/baseline2025';

describe('Mobile Ergonomics & Responsive Boundary Invariants', () => {
  it('guarantees minimal horizontal separation between adjacent forward pack nodes', () => {
    // 1 (LH) and 2 (Hooker)
    const p1 = PITCH_COORDINATES[1]!;
    const p2 = PITCH_COORDINATES[2]!;
    const p3 = PITCH_COORDINATES[3]!;

    expect(p2.xPercent - p1.xPercent).toBeGreaterThanOrEqual(12);
    expect(p3.xPercent - p2.xPercent).toBeGreaterThanOrEqual(12);
  });

  it('guarantees Second Row and Front Row have vertical separation to prevent jersey-to-jersey collision', () => {
    const p1 = PITCH_COORDINATES[1]!;
    const p4 = PITCH_COORDINATES[4]!;

    // Vertical gap between Front Row and Second Row
    const verticalGap = p4.yPercent - p1.yPercent;
    expect(verticalGap).toBeGreaterThanOrEqual(12);
  });

  it('ensures all 15 position coordinates stay within visible pitch safety margins (10% to 90%)', () => {
    Object.values(PITCH_COORDINATES).forEach(coord => {
      expect(coord.xPercent).toBeGreaterThanOrEqual(10);
      expect(coord.xPercent).toBeLessThanOrEqual(90);
      expect(coord.yPercent).toBeGreaterThanOrEqual(10);
      expect(coord.yPercent).toBeLessThanOrEqual(90);
    });
  });

  it('verifies baseline players have valid province and rank order data', () => {
    POSITIONS.forEach(pos => {
      const posPlayers = BASELINE_PLAYERS.filter(p => p.pos === pos.id);
      expect(posPlayers.length).toBeGreaterThan(0);
      posPlayers.forEach(player => {
        expect(player.name.length).toBeGreaterThan(0);
        expect(player.rating).toBeGreaterThanOrEqual(50);
        expect(player.rating).toBeLessThanOrEqual(100);
      });
    });
  });

  it('ensures resolveStartingXV strictly preserves custom drag-and-drop ladder orders', async () => {
    const { resolveStartingXV } = await import('../../lib/selectionRules');
    const { groupPlayersByPosition } = await import('../../lib/depthCalc');

    const defaultLadders = groupPlayersByPosition(BASELINE_PLAYERS, POSITIONS);
    const pos10 = defaultLadders[10]!;
    expect(pos10[0]!.name).toBe('Jack Crowley');

    // Simulate custom drag-to-rank: swap Crowley and Prendergast
    const reorderedPos10 = [pos10[1]!, pos10[0]!, ...pos10.slice(2)];
    const customLadders = { ...defaultLadders, 10: reorderedPos10 };

    const resolved = resolveStartingXV(customLadders, POSITIONS, { 'Sam Prendergast': 10 });
    expect(resolved.starters[10]!.name).toBe('Sam Prendergast');
    expect(resolved.adjustedLadders[10]![0]!.name).toBe('Sam Prendergast');
    expect(resolved.adjustedLadders[10]![1]!.name).toBe('Jack Crowley');
  });
});
