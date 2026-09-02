import { Position } from '../../types/depth';

export interface PitchCoordinate {
  posId: number;
  roleName: string;
  xPercent: number; // 0 (left touchline) to 100 (right touchline)
  yPercent: number; // 0 (top/try-line) to 100 (deep backfield)
  unit: 'Front Row' | 'Second Row' | 'Back Row' | 'Half-Backs' | 'Midfield' | 'Back Three';
}

/**
 * Standard TV broadcast tactical layout:
 * - Forwards Pack:
 *   - Front row: 1 (Loosehead, x: 38), 2 (Hooker, x: 50), 3 (Tighthead, x: 62) at y: 14%
 *   - Second row: 4 (Lock 4, x: 44), 5 (Lock 5, x: 56) directly behind at y: 26%
 *   - Back row triangle: 6 (Blindside, x: 33), 7 (Openside, x: 67) at y: 34%; 8 (Number Eight, x: 50) anchored behind/between locks at y: 40%
 * - Backline:
 *   - Diagonal stack:
 *     - 9 (Scrum-Half, x: 40, y: 48) behind 8
 *     - 10 (Fly-Half, x: 52, y: 55) diagonally back right
 *     - 12 (Inside Centre, x: 63, y: 63)
 *     - 13 (Outside Centre, x: 74, y: 71)
 *     - 14 (Right Wing, x: 86, y: 78)
 *   - 11 (Left Wing) on the wide left flank (x: 14, y: 78), level with 14
 *   - 15 (Full-Back) deep central anchor (x: 58, y: 88), floating behind 12 & 13
 */
export const PITCH_COORDINATES: Record<number, PitchCoordinate> = {
  1: { posId: 1, roleName: 'Loosehead Prop', xPercent: 38, yPercent: 14, unit: 'Front Row' },
  2: { posId: 2, roleName: 'Hooker', xPercent: 50, yPercent: 14, unit: 'Front Row' },
  3: { posId: 3, roleName: 'Tighthead Prop', xPercent: 62, yPercent: 14, unit: 'Front Row' },
  4: { posId: 4, roleName: 'Lock (L4)', xPercent: 44, yPercent: 26, unit: 'Second Row' },
  5: { posId: 5, roleName: 'Lock (L5)', xPercent: 56, yPercent: 26, unit: 'Second Row' },
  6: { posId: 6, roleName: 'Blindside Flanker', xPercent: 33, yPercent: 34, unit: 'Back Row' },
  7: { posId: 7, roleName: 'Openside Flanker', xPercent: 67, yPercent: 34, unit: 'Back Row' },
  8: { posId: 8, roleName: 'Number Eight', xPercent: 50, yPercent: 41, unit: 'Back Row' },
  9: { posId: 9, roleName: 'Scrum-Half', xPercent: 40, yPercent: 50, unit: 'Half-Backs' },
  10: { posId: 10, roleName: 'Fly-Half', xPercent: 51, yPercent: 58, unit: 'Half-Backs' },
  11: { posId: 11, roleName: 'Left Wing', xPercent: 14, yPercent: 78, unit: 'Back Three' },
  12: { posId: 12, roleName: 'Inside Centre', xPercent: 62, yPercent: 66, unit: 'Midfield' },
  13: { posId: 13, roleName: 'Outside Centre', xPercent: 73, yPercent: 74, unit: 'Midfield' },
  14: { posId: 14, roleName: 'Right Wing', xPercent: 86, yPercent: 78, unit: 'Back Three' },
  15: { posId: 15, roleName: 'Full-Back', xPercent: 58, yPercent: 88, unit: 'Back Three' },
};

export interface TacticalUnitDepth {
  unitName: string;
  positions: Position[];
  avgDepthScore: number;
  starterAvgRating: number;
  backupAvgRating: number;
  avgDropoff: number;
  vulnerableCount: number;
}
