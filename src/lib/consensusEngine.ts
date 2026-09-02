import { Proposal, RatingSpread, PlayerEntry } from '../types/depth';

/**
 * Calculates the mathematical median of a list of numbers
 */
export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2);
  }
  return sorted[mid] ?? 0;
}

/**
 * Calculates rating spread metrics from vote counter-values and base rating
 */
export function calculateSpreadMetrics(values: number[]): RatingSpread {
  if (values.length === 0) {
    return { min: 0, max: 0, stdDev: 0, voteCount: 0 };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Number(Math.sqrt(variance).toFixed(1));

  return {
    min,
    max,
    stdDev,
    voteCount: values.length,
  };
}

export interface ProposalResolution {
  canResolve: boolean;
  quorumMet: boolean;
  supports: number;
  challenges: number;
  status: 'open' | 'passed' | 'failed';
  resolvedRating?: number;
  spread?: RatingSpread;
  summary: string;
}

/**
 * Evaluates whether a proposal has reached quorum and passes or fails
 */
export function evaluateProposal(
  proposal: Proposal,
  activeMemberCount: number = 6
): ProposalResolution {
  const quorumRequired = Math.ceil(activeMemberCount * 0.5); // 50%
  const totalVotes = proposal.votes.length;
  const quorumMet = totalVotes >= quorumRequired;

  const supports = proposal.votes.filter(v => v.choice === 'support').length;
  const challenges = proposal.votes.filter(v => v.choice === 'challenge').length;

  if (!quorumMet) {
    return {
      canResolve: false,
      quorumMet: false,
      supports,
      challenges,
      status: 'open',
      summary: `Needs ${quorumRequired - totalVotes} more vote(s) to reach quorum (${totalVotes}/${quorumRequired}).`,
    };
  }

  // Quorum met!
  if (supports > challenges) {
    // Collect all submitted counter values + proposer's value
    const values: number[] = [];
    if (typeof proposal.proposedValue === 'number') {
      values.push(proposal.proposedValue);
    }
    proposal.votes.forEach(v => {
      if (typeof v.counterValue === 'number' && !isNaN(v.counterValue)) {
        values.push(v.counterValue);
      } else if (v.choice === 'support' && typeof proposal.proposedValue === 'number') {
        values.push(proposal.proposedValue);
      }
    });

    const resolvedRating = values.length > 0 ? calculateMedian(values) : Number(proposal.proposedValue);
    const spread = calculateSpreadMetrics(values);

    return {
      canResolve: true,
      quorumMet: true,
      supports,
      challenges,
      status: 'passed',
      resolvedRating,
      spread,
      summary: `Passed by majority support (${supports} vs ${challenges}). Consensus median rating: ${resolvedRating}.`,
    };
  } else {
    return {
      canResolve: true,
      quorumMet: true,
      supports,
      challenges,
      status: 'failed',
      summary: `Failed: Challenges (${challenges}) met or exceeded supports (${supports}). Player rating flagged Contested.`,
    };
  }
}

/**
 * Derives the "Contested List": Top players with highest dispute or spread
 */
export function getMostContested(players: PlayerEntry[], limit: number = 10): PlayerEntry[] {
  return [...players]
    .filter(p => p.status === 'active')
    .sort((a, b) => {
      const aScore = (a.isContested ? 50 : 0) + (a.disputeCount ?? 0) * 10 + (a.spread ? (a.spread.max - a.spread.min) : 0);
      const bScore = (b.isContested ? 50 : 0) + (b.disputeCount ?? 0) * 10 + (b.spread ? (b.spread.max - b.spread.min) : 0);
      return bScore - aScore;
    })
    .slice(0, limit);
}

/**
 * Calculates rating delta between current consensus and a baseline snapshot
 */
export function calculateMovers(
  currentPlayers: PlayerEntry[],
  baselinePlayers: PlayerEntry[]
): Array<{ player: PlayerEntry; delta: number; baselineRating: number }> {
  const baselineMap = new Map(baselinePlayers.map(p => [`${p.pos}-${p.name.toLowerCase()}`, p.rating]));
  
  return currentPlayers
    .filter(p => p.status === 'active')
    .map(p => {
      const key = `${p.pos}-${p.name.toLowerCase()}`;
      const baselineRating = baselineMap.get(key) ?? p.rating;
      return {
        player: p,
        delta: p.rating - baselineRating,
        baselineRating,
      };
    })
    .filter(m => m.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}
