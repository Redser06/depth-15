import { describe, it, expect } from 'vitest';
import { evaluateProposal, calculateMedian } from './consensusEngine';
import { resolveStartingXV } from './selectionRules';
import { Proposal, PlayerEntry, Position } from '../types/depth';

describe('Adversarial Consensus Voting Math (BLOCKER 2)', () => {
  it('guarantees 1:1 voting weight and pool length === votes.length + 1 (proposer once)', () => {
    // Proposer proposes 80
    const proposal: Proposal = {
      id: 'prop-adversarial-1',
      type: 'rerate',
      targetPlayerName: 'Sam Prendergast',
      pos: 10,
      proposerId: 'm-proposer',
      proposerName: 'Proposer',
      createdAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      status: 'open',
      currentValue: 70,
      proposedValue: 80,
      rationale: 'Incredible kicking and distribution form in Europe.',
      votes: [
        {
          id: 'v-1',
          proposalId: 'prop-adversarial-1',
          memberId: 'm-voter-1',
          memberName: 'Voter 1',
          choice: 'support',
          counterValue: 90,
          timestamp: new Date().toISOString(),
        },
        {
          id: 'v-2',
          proposalId: 'prop-adversarial-1',
          memberId: 'm-voter-2',
          memberName: 'Voter 2',
          choice: 'support',
          counterValue: 90,
          timestamp: new Date().toISOString(),
        },
        {
          id: 'v-3',
          proposalId: 'prop-adversarial-1',
          memberId: 'm-voter-3',
          memberName: 'Voter 3',
          choice: 'challenge',
          counterValue: 51,
          timestamp: new Date().toISOString(),
        },
      ],
      comments: [],
    };

    // 3 votes + 1 proposer = 4 values: [51, 80, 90, 90]
    // Median of [51, 80, 90, 90] is (80 + 90) / 2 = 85.
    // In old buggy code that double-counted 90s, it resolved to 90!
    const resolution = evaluateProposal(proposal, 6);
    expect(resolution.canResolve).toBe(true);
    expect(resolution.status).toBe('passed');
    expect(resolution.resolvedRating).toBe(85);
    expect(resolution.resolvedRating).not.toBe(90);
  });

  it('does not double count the proposer if their vote is recorded in proposal.votes', () => {
    const proposal: Proposal = {
      id: 'prop-adversarial-2',
      type: 'rerate',
      targetPlayerName: 'Jack Crowley',
      pos: 10,
      proposerId: 'm-conor',
      proposerName: 'Conor',
      createdAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      status: 'open',
      currentValue: 80,
      proposedValue: 86,
      rationale: 'Standard setting performance in European Champions Cup.',
      votes: [
        {
          id: 'v-conor',
          proposalId: 'prop-adversarial-2',
          memberId: 'm-conor', // Same as proposerId
          memberName: 'Conor',
          choice: 'support',
          counterValue: 86,
          timestamp: new Date().toISOString(),
        },
        {
          id: 'v-ronan',
          proposalId: 'prop-adversarial-2',
          memberId: 'm-ronan',
          memberName: 'Ronan',
          choice: 'support',
          counterValue: 86,
          timestamp: new Date().toISOString(),
        },
        {
          id: 'v-brian',
          proposalId: 'prop-adversarial-2',
          memberId: 'm-brian',
          memberName: 'Brian',
          choice: 'challenge',
          counterValue: 60,
          timestamp: new Date().toISOString(),
        },
      ],
      comments: [],
    };

    // 3 unique voters: [60, 86, 86]. Median is 86.
    const resolution = evaluateProposal(proposal, 6);
    expect(resolution.canResolve).toBe(true);
    expect(resolution.resolvedRating).toBe(86);
    expect(resolution.spread?.voteCount).toBe(3); // Exactly 3 distinct votes
  });

  it('correctly calculates median on odd and even sets without drift', () => {
    expect(calculateMedian([50, 80, 90])).toBe(80);
    expect(calculateMedian([51, 80, 90, 90])).toBe(85);
    expect(calculateMedian([40, 50, 60, 70, 80])).toBe(60);
    expect(calculateMedian([])).toBe(0);
  });
});

describe('Non-Numeric Proposal Domain Effects (BLOCKER 1)', () => {
  it('evaluates retire proposal without returning NaN and produces typed retire action', () => {
    const retireProposal: Proposal = {
      id: 'prop-retire-1',
      type: 'retire',
      targetPlayerName: "Peter O'Mahony",
      pos: 6,
      proposerId: 'm-conor',
      proposerName: 'Conor',
      createdAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      status: 'open',
      currentValue: 'active',
      proposedValue: 'retired',
      rationale: 'Officially hung up the boots after test career.',
      votes: [
        {
          id: 'v-1',
          proposalId: 'prop-retire-1',
          memberId: 'm-1',
          memberName: 'Ronan',
          choice: 'support',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'v-2',
          proposalId: 'prop-retire-1',
          memberId: 'm-2',
          memberName: 'Declan',
          choice: 'support',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'v-3',
          proposalId: 'prop-retire-1',
          memberId: 'm-3',
          memberName: 'Brian',
          choice: 'support',
          timestamp: new Date().toISOString(),
        },
      ],
      comments: [],
    };

    const resolution = evaluateProposal(retireProposal, 6);
    expect(resolution.canResolve).toBe(true);
    expect(resolution.status).toBe('passed');
    expect(resolution.resolvedAction).toBe('retire');
    // Critical: resolvedRating must NOT be NaN!
    expect(resolution.resolvedRating).toBeUndefined();
    expect(Number.isNaN(resolution.resolvedRating)).toBe(false);
  });

  it('evaluates reorder proposal without returning NaN and produces typed reorder action', () => {
    const reorderProposal: Proposal = {
      id: 'prop-reorder-1',
      type: 'reorder',
      targetPlayerName: 'Sam Prendergast',
      pos: 10,
      proposerId: 'm-conor',
      proposerName: 'Conor',
      createdAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      status: 'open',
      currentValue: '2',
      proposedValue: '1',
      rationale: 'Promotion to starting fly-half based on European performances.',
      votes: [
        {
          id: 'v-1',
          proposalId: 'prop-reorder-1',
          memberId: 'm-1',
          memberName: 'Ronan',
          choice: 'support',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'v-2',
          proposalId: 'prop-reorder-1',
          memberId: 'm-2',
          memberName: 'Declan',
          choice: 'support',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'v-3',
          proposalId: 'prop-reorder-1',
          memberId: 'm-3',
          memberName: 'Brian',
          choice: 'support',
          timestamp: new Date().toISOString(),
        },
      ],
      comments: [],
    };

    const resolution = evaluateProposal(reorderProposal, 6);
    expect(resolution.canResolve).toBe(true);
    expect(resolution.status).toBe('passed');
    expect(resolution.resolvedAction).toBe('reorder');
    expect(resolution.resolvedRating).toBeUndefined();
    expect(Number.isNaN(resolution.resolvedRating)).toBe(false);
  });
});

describe('Vacated Position Ladders & Unresolved Markers (SERIOUS 1)', () => {
  const mockPositions: Position[] = [
    { id: 1, num: '1', name: 'Loosehead Prop', abbr: 'LHP', group: 'Forwards' },
    { id: 2, num: '2', name: 'Hooker', abbr: 'HOO', group: 'Forwards' },
  ];

  it('explicitly reports unresolvedPositions and populates a vacant starter marker when a ladder is vacated', () => {
    // Setup: Pos 1 has Player A (90). Pos 2 ONLY has Player A as secondary cover (85).
    // Because Player A starts at Pos 1, Pos 2 has NO eligible starter!
    const playersByPos: Record<number, PlayerEntry[]> = {
      1: [
        { id: 'p-1', name: 'Player A', pos: 1, rating: 90, secondary: false, status: 'active', lastReviewed: 'Test' },
      ],
      2: [
        { id: 's-2', name: 'Player A', pos: 2, rating: 85, secondary: true, status: 'active', lastReviewed: 'Test' },
      ],
    };

    const resolved = resolveStartingXV(playersByPos, mockPositions, { 'Player A': 1 });

    // Starter at Pos 1 is Player A
    expect(resolved.starters[1]?.name).toBe('Player A');
    expect(resolved.starters[1]?.rating).toBe(90);

    // Pos 2 is fully vacated! Must be surfaced in unresolvedPositions
    expect(resolved.unresolvedPositions).toContain(2);
    expect(resolved.starters[2]?.name).toBe('Unassigned / Vacant');
    expect(resolved.starters[2]?.rating).toBe(0);

    // Headline metrics must be honest: 1 resolved starter out of 2 positions
    expect(resolved.resolvedStarterCount).toBe(1);
    expect(resolved.totalPositions).toBe(2);
    // Average rating is 90 (over the single resolved position, not dividing by 2 or throwing error)
    expect(resolved.startingXVAverageRating).toBe(90);
  });
});

describe('Stale & Inactive Starter Assignment Guard (SERIOUS 2)', () => {
  const mockPositions: Position[] = [
    { id: 6, num: '6', name: 'Blindside Flanker', abbr: 'BSF', group: 'Forwards' },
  ];

  it('ignores manual starter assignments for retired players and records them in ignoredAssignments', () => {
    const playersByPos: Record<number, PlayerEntry[]> = {
      6: [
        { id: 'p-baird', name: 'Ryan Baird', pos: 6, rating: 88, secondary: false, status: 'active', lastReviewed: 'Test' },
        { id: 'p-pom', name: "Peter O'Mahony", pos: 6, rating: 91, secondary: false, status: 'retired', lastReviewed: 'Test' },
      ],
    };

    // Stale localStorage assignment pointing to retired Peter O'Mahony
    const staleAssignments = { "Peter O'Mahony": 6 };

    const resolved = resolveStartingXV(playersByPos, mockPositions, staleAssignments);

    // Retired player must NOT be resurrected as starter!
    expect(resolved.starters[6]?.name).toBe('Ryan Baird');
    expect(resolved.starters[6]?.rating).toBe(88);
    // The stale assignment must be reported in ignoredAssignments
    expect(resolved.ignoredAssignments).toContain("Peter O'Mahony");
  });
});
