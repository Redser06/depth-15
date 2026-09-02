import { describe, it, expect } from 'vitest';
import { calculateMedian, calculateSpreadMetrics, evaluateProposal } from './consensusEngine';
import { Proposal } from '../types/depth';

describe('consensusEngine', () => {
  it('calculates median for odd-length lists', () => {
    expect(calculateMedian([80, 84, 88])).toBe(84);
    expect(calculateMedian([90, 82, 85])).toBe(85);
  });

  it('calculates median for even-length lists by averaging the middle two', () => {
    expect(calculateMedian([80, 82, 86, 88])).toBe(84);
    expect(calculateMedian([82, 84, 85, 87])).toBe(85); // (84 + 85) / 2 = 84.5 -> 85
  });

  it('calculates spread metrics correctly', () => {
    const metrics = calculateSpreadMetrics([80, 84, 88]);
    expect(metrics.min).toBe(80);
    expect(metrics.max).toBe(88);
    expect(metrics.voteCount).toBe(3);
    expect(metrics.stdDev).toBeGreaterThan(3);
  });

  it('evaluates proposal without quorum as open', () => {
    const proposal: Proposal = {
      id: 'p1',
      type: 'rerate',
      targetPlayerName: 'Sam Prendergast',
      pos: 10,
      proposerId: 'm1',
      proposerName: 'Conor',
      createdAt: '',
      expiresAt: '',
      status: 'open',
      currentValue: 80,
      proposedValue: 86,
      rationale: 'Reasoned argument test 140 chars...',
      votes: [
        {
          id: 'v1',
          proposalId: 'p1',
          memberId: 'm1',
          memberName: 'Conor',
          choice: 'support',
          counterValue: 86,
          timestamp: '',
        },
      ],
      comments: [],
    };

    const res = evaluateProposal(proposal, 6);
    expect(res.quorumMet).toBe(false);
    expect(res.status).toBe('open');
    expect(res.canResolve).toBe(false);
  });

  it('evaluates passed proposal with quorum as median of counter values', () => {
    const proposal: Proposal = {
      id: 'p1',
      type: 'rerate',
      targetPlayerName: 'Sam Prendergast',
      pos: 10,
      proposerId: 'm1',
      proposerName: 'Conor',
      createdAt: '',
      expiresAt: '',
      status: 'open',
      currentValue: 80,
      proposedValue: 86,
      rationale: 'Solid case on test rugby standard',
      votes: [
        {
          id: 'v1',
          proposalId: 'p1',
          memberId: 'm1',
          memberName: 'Conor',
          choice: 'support',
          counterValue: 86,
          timestamp: '',
        },
        {
          id: 'v2',
          proposalId: 'p1',
          memberId: 'm2',
          memberName: 'Ronan',
          choice: 'challenge',
          counterValue: 82,
          timestamp: '',
        },
        {
          id: 'v3',
          proposalId: 'p1',
          memberId: 'm3',
          memberName: 'Declan',
          choice: 'support',
          counterValue: 84,
          timestamp: '',
        },
      ],
      comments: [],
    };

    const res = evaluateProposal(proposal, 6); // 3 of 6 = 50% quorum!
    expect(res.quorumMet).toBe(true);
    expect(res.canResolve).toBe(true);
    expect(res.status).toBe('passed');
    // values: [86 (proposed), 86, 82, 84] -> [82, 84, 86, 86] -> median is (84+86)/2 = 85
    expect(res.resolvedRating).toBe(85);
  });

  it('evaluates failed proposal when challenges outweigh supports', () => {
    const proposal: Proposal = {
      id: 'p1',
      type: 'rerate',
      targetPlayerName: 'Player X',
      pos: 1,
      proposerId: 'm1',
      proposerName: 'Conor',
      createdAt: '',
      expiresAt: '',
      status: 'open',
      currentValue: 70,
      proposedValue: 85,
      rationale: 'Testing challenge majority',
      votes: [
        {
          id: 'v1',
          proposalId: 'p1',
          memberId: 'm1',
          memberName: 'Conor',
          choice: 'support',
          timestamp: '',
        },
        {
          id: 'v2',
          proposalId: 'p1',
          memberId: 'm2',
          memberName: 'Ronan',
          choice: 'challenge',
          timestamp: '',
        },
        {
          id: 'v3',
          proposalId: 'p1',
          memberId: 'm3',
          memberName: 'Declan',
          choice: 'challenge',
          timestamp: '',
        },
      ],
      comments: [],
    };

    const res = evaluateProposal(proposal, 6);
    expect(res.quorumMet).toBe(true);
    expect(res.status).toBe('failed');
  });
});
