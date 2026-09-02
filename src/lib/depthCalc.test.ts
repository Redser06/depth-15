import { describe, it, expect } from 'vitest';
import { calculateDepthScore, getDepthBand, getRatingTier, WEIGHT_SETS } from './depthCalc';
import { PlayerEntry } from '../types/depth';

function makeMockPlayer(rating: number, id: string = 'p'): PlayerEntry {
  return {
    id,
    name: 'Test Player',
    pos: 10,
    rating,
    secondary: false,
    status: 'active',
    lastReviewed: '2025',
  };
}

describe('depthCalc', () => {
  it('has exact weight sets matching PRD section 1.1', () => {
    expect(WEIGHT_SETS[1]).toEqual([1.00]);
    expect(WEIGHT_SETS[2]).toEqual([0.65, 0.35]);
    expect(WEIGHT_SETS[3]).toEqual([0.50, 0.30, 0.20]);
    expect(WEIGHT_SETS[4]).toEqual([0.40, 0.28, 0.20, 0.12]);
    expect(WEIGHT_SETS[5]).toEqual([0.35, 0.25, 0.20, 0.13, 0.07]);
    expect(WEIGHT_SETS[6]).toEqual([0.32, 0.24, 0.18, 0.13, 0.08, 0.05]);
    expect(WEIGHT_SETS[7]).toEqual([0.30, 0.23, 0.17, 0.12, 0.08, 0.06, 0.04]);
  });

  it('calculates depth score with single player', () => {
    const players = [makeMockPlayer(90)];
    expect(calculateDepthScore(players)).toBe(90);
  });

  it('calculates depth score with 2 players (0.65 / 0.35 decay)', () => {
    const players = [makeMockPlayer(90, '1'), makeMockPlayer(80, '2')];
    // 90 * 0.65 + 80 * 0.35 = 58.5 + 28 = 86.5 -> 87
    expect(calculateDepthScore(players)).toBe(87);
  });

  it('calculates depth score with 5 players (35/25/20/13/7)', () => {
    const players = [
      makeMockPlayer(90, '1'),
      makeMockPlayer(80, '2'),
      makeMockPlayer(70, '3'),
      makeMockPlayer(60, '4'),
      makeMockPlayer(50, '5'),
    ];
    // 90*0.35 + 80*0.25 + 70*0.20 + 60*0.13 + 50*0.07 = 31.5 + 20 + 14 + 7.8 + 3.5 = 76.8 -> 77
    expect(calculateDepthScore(players)).toBe(77);
  });

  it('ignores retired or ineligible players', () => {
    const players = [
      makeMockPlayer(90, '1'),
      { ...makeMockPlayer(85, '2'), status: 'retired' as const },
    ];
    expect(calculateDepthScore(players)).toBe(90);
  });

  it('maps depth bands accurately per PRD section 1.1', () => {
    expect(getDepthBand(88).label).toBe('Elite');
    expect(getDepthBand(82).label).toBe('Excellent');
    expect(getDepthBand(77).label).toBe('Strong');
    expect(getDepthBand(71).label).toBe('Solid');
    expect(getDepthBand(66).label).toBe('Thin');
    expect(getDepthBand(62).label).toBe('Vulnerable');
  });

  it('maps rating tiers accurately', () => {
    expect(getRatingTier(95).tier).toBe('World Class');
    expect(getRatingTier(85).tier).toBe('International');
    expect(getRatingTier(75).tier).toBe('Squad');
    expect(getRatingTier(65).tier).toBe('Fringe');
    expect(getRatingTier(55).tier).toBe('Emerging');
  });
});
