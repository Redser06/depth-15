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

  it('computes realistic overall index and identifies top strength and focus areas', () => {
    render(
      <SquadRadarView positions={POSITIONS} playersByPos={playersByPos} />
    );

    // Should display Overall Index
    expect(screen.getByText('Overall Index')).toBeTruthy();
    expect(screen.getByText('Top Strength')).toBeTruthy();
    expect(screen.getByText('Key Focus')).toBeTruthy();
  });
});
