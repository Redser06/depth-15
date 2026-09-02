import { PlayerEntry, Position } from '../types/depth';

// Exact decay weights per PRD & irelandSquadDepth.ts
export const WEIGHT_SETS: Record<number, number[]> = {
  1: [1.00],
  2: [0.65, 0.35],
  3: [0.50, 0.30, 0.20],
  4: [0.40, 0.28, 0.20, 0.12],
  5: [0.35, 0.25, 0.20, 0.13, 0.07],
  6: [0.32, 0.24, 0.18, 0.13, 0.08, 0.05],
  7: [0.30, 0.23, 0.17, 0.12, 0.08, 0.06, 0.04],
};

export function calculateDepthScore(players: PlayerEntry[]): number {
  const activePlayers = players.filter(p => p.status === 'active');
  if (activePlayers.length === 0) return 0;
  
  const sorted = [...activePlayers].sort((a, b) => b.rating - a.rating);
  const n = Math.min(sorted.length, 7);
  const weights = WEIGHT_SETS[n] ?? [1.0];
  
  const score = sorted.slice(0, n).reduce((acc, p, idx) => {
    const weight = weights[idx] ?? 0;
    return acc + p.rating * weight;
  }, 0);

  return Math.round(score);
}

export type DepthBand = 'Elite' | 'Excellent' | 'Strong' | 'Solid' | 'Thin' | 'Vulnerable';

export function getDepthBand(score: number): { label: DepthBand; color: string; bgLight: string; textDark: string; border: string } {
  if (score >= 85) {
    return {
      label: 'Elite',
      color: '#047857',      // Emerald 700
      bgLight: '#ECFDF5',    // Emerald 50
      textDark: '#065F46',   // Emerald 800
      border: '#A7F3D0',     // Emerald 200
    };
  }
  if (score >= 80) {
    return {
      label: 'Excellent',
      color: '#0D6938',      // Irish Forest Green
      bgLight: '#F0FDF4',    // Green 50
      textDark: '#14532D',   // Green 900
      border: '#BBF7D0',     // Green 200
    };
  }
  if (score >= 75) {
    return {
      label: 'Strong',
      color: '#16A34A',      // Green 600
      bgLight: '#F7FEE7',    // Lime/Green tint
      textDark: '#166534',   // Green 800
      border: '#86EFAC',     // Green 300
    };
  }
  if (score >= 70) {
    return {
      label: 'Solid',
      color: '#B45309',      // Amber 700
      bgLight: '#FFFBEB',    // Amber 50
      textDark: '#92400E',   // Amber 800
      border: '#FDE68A',     // Amber 200
    };
  }
  if (score >= 65) {
    return {
      label: 'Thin',
      color: '#C2410C',      // Orange 700
      bgLight: '#FFF7ED',    // Orange 50
      textDark: '#9A3412',   // Orange 800
      border: '#FED7AA',     // Orange 200
    };
  }
  return {
    label: 'Vulnerable',
    color: '#DC2626',        // Red 600
    bgLight: '#FEF2F2',      // Red 50
    textDark: '#991B1B',     // Red 800
    border: '#FECACA',       // Red 200
  };
}

export type RatingTier = 'World Class' | 'International' | 'Squad' | 'Fringe' | 'Emerging';

export function getRatingTier(rating: number): { tier: RatingTier; pillClass: string; badgeColor: string; barColor: string } {
  if (rating >= 90) {
    return {
      tier: 'World Class',
      pillClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold',
      badgeColor: '#047857',
      barColor: '#047857',
    };
  }
  if (rating >= 80) {
    return {
      tier: 'International',
      pillClass: 'bg-green-100 text-green-900 border-green-300 font-medium',
      badgeColor: '#16A34A',
      barColor: '#16A34A',
    };
  }
  if (rating >= 70) {
    return {
      tier: 'Squad',
      pillClass: 'bg-amber-100 text-amber-900 border-amber-300 font-medium',
      badgeColor: '#D97706',
      barColor: '#D97706',
    };
  }
  if (rating >= 60) {
    return {
      tier: 'Fringe',
      pillClass: 'bg-orange-100 text-orange-900 border-orange-300 font-medium',
      badgeColor: '#EA580C',
      barColor: '#EA580C',
    };
  }
  return {
    tier: 'Emerging',
    pillClass: 'bg-red-100 text-red-900 border-red-300 font-medium',
    badgeColor: '#DC2626',
    barColor: '#DC2626',
  };
}

export function groupPlayersByPosition(players: PlayerEntry[], positions: Position[]): Record<number, PlayerEntry[]> {
  const result: Record<number, PlayerEntry[]> = {};
  positions.forEach(pos => {
    result[pos.id] = players
      .filter(p => p.pos === pos.id && p.status === 'active')
      .sort((a, b) => b.rating - a.rating);
  });
  return result;
}
