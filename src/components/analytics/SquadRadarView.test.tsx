import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SquadRadarView, SQUAD_TACTICAL_ASPECTS } from './SquadRadarView';
import { POSITIONS, BASELINE_PLAYERS } from '../../data/baseline2025';
import { PlayerEntry } from '../../types/depth';

describe('SquadRadarView — Team Strength Radar Graph', () => {
  const playersByPos: Record<number, PlayerEntry[]> = {};
  POSITIONS.forEach((pos) => {
    playersByPos[pos.id] = BASELINE_PLAYERS.filter((p) => p.pos === pos.id);
  });

  it('calculates and renders all 7 tactical aspects without NaN coordinates', () => {
    const { container } = render(
      <SquadRadarView positions={POSITIONS} playersByPos={playersByPos} />
    );

    // Header and title
    expect(screen.getByText('Squad Unit Strength Radar')).toBeTruthy();
    expect(screen.getByText('7 Core Tactical Dimensions')).toBeTruthy();

    // Check that all 7 aspects are represented
    SQUAD_TACTICAL_ASPECTS.forEach((aspect) => {
      expect(screen.getAllByText(aspect.shortName).length).toBeGreaterThan(0);
    });

    // Check polygon data points exist and have no NaN
    const polygon = container.querySelector('polygon[fill="url(#radarEmeraldGlow)"]');
    expect(polygon).toBeTruthy();
    const pointsAttr = polygon?.getAttribute('points');
    expect(pointsAttr).toBeTruthy();
    expect(pointsAttr).not.toContain('NaN');
    expect(pointsAttr?.split(' ').length).toBe(7);
  });

  it('computes realistic overall index and discloses measured denominator (All 7 Units)', () => {
    render(
      <SquadRadarView positions={POSITIONS} playersByPos={playersByPos} />
    );

    expect(screen.getByText('Overall Index')).toBeTruthy();
    expect(screen.getByText(/\/ 100 Rating \(All 7 Units\)/i)).toBeTruthy();
    expect(screen.getByText('Top Strength')).toBeTruthy();
    expect(screen.getByText('Key Focus')).toBeTruthy();
  });

  it('Adversarial Probe: Empty Hooker unit must NOT fabricate a 50, renders "— No data", and discloses "6/7 measured units"', () => {
    // Vacate position 2 (Hooker) completely
    const squadWithEmptyHooker: Record<number, PlayerEntry[]> = {
      ...playersByPos,
      2: [], // Empty!
    };

    const { container } = render(
      <SquadRadarView positions={POSITIONS} playersByPos={squadWithEmptyHooker} />
    );

    // 1. Spoke label must show "— No data", never "50/100"
    expect(screen.getByText('— No data')).toBeTruthy();

    // 2. Denominator disclosure: Must disclose 6/7 measured units in the headline
    expect(screen.getByText(/6\/7 measured units/i)).toBeTruthy();

    // 3. Disclosure alert banner must appear
    expect(screen.getByText(/Data Disclosure:/i)).toBeTruthy();

    // 4. The radar polygon must only connect the 6 measured units (not fabricating a 7th at 50)
    const polygon = container.querySelector('polygon[fill="url(#radarEmeraldGlow)"]');
    expect(polygon).toBeTruthy();
    const pointsAttr = polygon?.getAttribute('points');
    expect(pointsAttr?.split(' ').length).toBe(6);
    expect(pointsAttr).not.toContain('NaN');

    // 5. Hollow circle on spoke with dashed stroke must be present
    const hollowDashedCircle = container.querySelector('circle[stroke-dasharray="2,2"]');
    expect(hollowDashedCircle).toBeTruthy();
  });
});
