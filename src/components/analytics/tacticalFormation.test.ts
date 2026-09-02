import { describe, it, expect } from 'vitest';
import { PITCH_COORDINATES } from './tacticalFormation';
import { POSITIONS } from '../../data/baseline2025';

describe('Tactical Rugby Pitch Formation Coordinates', () => {
  it('defines coordinates for all 15 rugby union positions', () => {
    expect(Object.keys(PITCH_COORDINATES)).toHaveLength(15);
    POSITIONS.forEach(pos => {
      expect(PITCH_COORDINATES[pos.id]).toBeDefined();
    });
  });

  it('correctly stacks the Front Row across the pitch at y: 14%', () => {
    const p1 = PITCH_COORDINATES[1]!;
    const p2 = PITCH_COORDINATES[2]!;
    const p3 = PITCH_COORDINATES[3]!;

    expect(p1.yPercent).toBe(14);
    expect(p2.yPercent).toBe(14);
    expect(p3.yPercent).toBe(14);

    // Loosehead on left (38), Hooker middle (50), Tighthead right (62)
    expect(p1.xPercent).toBeLessThan(p2.xPercent);
    expect(p2.xPercent).toBeLessThan(p3.xPercent);
  });

  it('places the Second Row (4, 5) directly behind the front row', () => {
    const p4 = PITCH_COORDINATES[4]!;
    const p5 = PITCH_COORDINATES[5]!;

    expect(p4.yPercent).toBe(26);
    expect(p5.yPercent).toBe(26);
    expect(p4.xPercent).toBe(44);
    expect(p5.xPercent).toBe(56);
  });

  it('creates the back row triangle with Number 8 anchored behind and between locks', () => {
    const p6 = PITCH_COORDINATES[6]!;
    const p7 = PITCH_COORDINATES[7]!;
    const p8 = PITCH_COORDINATES[8]!;

    // Flankers are wider than locks
    expect(p6.xPercent).toBeLessThan(PITCH_COORDINATES[4]!.xPercent);
    expect(p7.xPercent).toBeGreaterThan(PITCH_COORDINATES[5]!.xPercent);

    // Number 8 is centered and behind locks
    expect(p8.xPercent).toBe(50);
    expect(p8.yPercent).toBeGreaterThan(p6.yPercent);
    expect(p8.yPercent).toBeGreaterThan(p7.yPercent);
  });

  it('orders the backline diagonal attack line from 9 -> 10 -> 12 -> 13 -> 14', () => {
    const p9 = PITCH_COORDINATES[9]!;
    const p10 = PITCH_COORDINATES[10]!;
    const p12 = PITCH_COORDINATES[12]!;
    const p13 = PITCH_COORDINATES[13]!;
    const p14 = PITCH_COORDINATES[14]!;

    expect(p9.xPercent).toBeLessThan(p10.xPercent);
    expect(p10.xPercent).toBeLessThan(p12.xPercent);
    expect(p12.xPercent).toBeLessThan(p13.xPercent);
    expect(p13.xPercent).toBeLessThan(p14.xPercent);

    expect(p9.yPercent).toBeLessThan(p10.yPercent);
    expect(p10.yPercent).toBeLessThan(p12.yPercent);
    expect(p12.yPercent).toBeLessThan(p13.yPercent);
    expect(p13.yPercent).toBeLessThan(p14.yPercent);
  });

  it('places Left Wing (11) wide on the left flank level with Right Wing (14)', () => {
    const p11 = PITCH_COORDINATES[11]!;
    const p14 = PITCH_COORDINATES[14]!;

    expect(p11.xPercent).toBe(14);
    expect(p11.yPercent).toBe(p14.yPercent);
  });

  it('places Full-Back (15) deep centrally floating behind the midfield', () => {
    const p15 = PITCH_COORDINATES[15]!;
    const p12 = PITCH_COORDINATES[12]!;
    const p13 = PITCH_COORDINATES[13]!;

    expect(p15.yPercent).toBeGreaterThan(p12.yPercent);
    expect(p15.yPercent).toBeGreaterThan(p13.yPercent);
    expect(p15.xPercent).toBeGreaterThan(p12.xPercent - 10);
    expect(p15.xPercent).toBeLessThan(p13.xPercent + 10);
  });
});
