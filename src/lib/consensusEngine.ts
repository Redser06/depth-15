import { Proposal, RatingSpread, PlayerEntry, ProposalResolution } from '../types/depth';

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

export type { ProposalResolution };

/**
 * Evaluates whether a proposal has reached quorum and passes or fails.
 * Guarantees strict 1:1 mathematical vote aggregation:
 * - Exactly one value per vote + proposer's proposedValue once.
 * - Never returns NaN for non-numeric proposals (retire, reorder).
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
      proposalType: proposal.type,
      summary: `Needs ${quorumRequired - totalVotes} more vote(s) to reach quorum (${totalVotes}/${quorumRequired}).`,
    };
  }

  // Quorum met!
  if (supports > challenges) {
    if (proposal.type === 'retire') {
      return {
        canResolve: true,
        quorumMet: true,
        supports,
        challenges,
        status: 'passed',
        proposalType: proposal.type,
        resolvedAction: 'retire',
        summary: `Passed: Retirement of ${proposal.targetPlayerName} confirmed by majority (${supports} vs ${challenges}).`,
      };
    }

    if (proposal.type === 'reorder') {
      return {
        canResolve: true,
        quorumMet: true,
        supports,
        challenges,
        status: 'passed',
        proposalType: proposal.type,
        resolvedAction: 'reorder',
        summary: `Passed: Ladder reordering approved by majority (${supports} vs ${challenges}).`,
      };
    }

    // For numeric proposals ('rerate', 'add_player', 'add_secondary'):
    // Build value pool with strict 1:1 mathematical integrity:
    // Exactly one value per vote (the vote's counterValue ?? proposedValue for support,
    // or the member's stated counter for challenge) + proposer's proposedValue once.
    const values: number[] = [];
    const memberVoted = new Set<string>();

    proposal.votes.forEach(v => {
      // Avoid duplicate votes from the same member
      if (memberVoted.has(v.memberId)) return;
      memberVoted.add(v.memberId);

      if (typeof v.counterValue === 'number' && !isNaN(v.counterValue)) {
        values.push(v.counterValue);
      } else if (v.choice === 'support') {
        const val = typeof proposal.proposedValue === 'number' ? proposal.proposedValue : Number(proposal.proposedValue);
        if (!isNaN(val)) values.push(val);
      } else if (v.choice === 'challenge') {
        // If challenge has no explicit counter, fall back to currentValue
        const val = typeof proposal.currentValue === 'number' ? proposal.currentValue : Number(proposal.currentValue);
        if (!isNaN(val)) values.push(val);
      }
    });

    // If proposer has not voted as a member in proposal.votes, add their proposedValue once
    if (!memberVoted.has(proposal.proposerId)) {
      const proposerVal = typeof proposal.proposedValue === 'number' ? proposal.proposedValue : Number(proposal.proposedValue);
      if (!isNaN(proposerVal)) values.push(proposerVal);
    }

    const resolvedRating = values.length > 0 ? calculateMedian(values) : undefined;
    const spread = values.length > 0 ? calculateSpreadMetrics(values) : undefined;

    return {
      canResolve: true,
      quorumMet: true,
      supports,
      challenges,
      status: 'passed',
      proposalType: proposal.type,
      resolvedRating,
      resolvedAction: proposal.type,
      spread,
      summary: `Passed by majority support (${supports} vs ${challenges}). Consensus median rating: ${resolvedRating ?? 'approved'}.`,
    };
  } else {
    return {
      canResolve: true,
      quorumMet: true,
      supports,
      challenges,
      status: 'failed',
      proposalType: proposal.type,
      summary: `Failed: Challenges (${challenges}) met or exceeded supports (${supports}).`,
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
): Array<{
  player: PlayerEntry;
  baselineRating: number;
  delta: number;
  direction: 'up' | 'down' | 'flat';
}> {
  const baselineMap = new Map<string, number>();
  baselinePlayers.forEach(p => {
    baselineMap.set(`${p.pos}-${p.name.toLowerCase().trim()}`, p.rating);
  });

  return currentPlayers
    .filter(p => p.status === 'active')
    .map(p => {
      const key = `${p.pos}-${p.name.toLowerCase().trim()}`;
      const baselineRating = baselineMap.get(key) ?? p.rating;
      const delta = p.rating - baselineRating;
      const direction = delta > 0 ? ('up' as const) : delta < 0 ? ('down' as const) : ('flat' as const);

      return {
        player: p,
        baselineRating,
        delta,
        direction,
      };
    })
    .filter(m => m.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}
