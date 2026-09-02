import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProposalCard } from './ProposalCard';
import { Proposal, Member } from '../../types/depth';
import { evaluateProposal } from '../../lib/consensusEngine';
import { PositionCard } from '../chart/PositionCard';
import { POSITIONS } from '../../data/baseline2025';

const mockMember: Member = {
  id: 'm1',
  name: 'Conor R',
  role: 'member',
  initials: 'CR',
  color: '#0D6938',
  province: 'Leinster',
};

describe('ProposalCard — Card-Matches-Maths Integration & Dissent Transparency', () => {
  it('renders displayed resolvedValue and summary string that match engine evaluation', () => {
    const proposal: Proposal = {
      id: 'prop-test-numeric',
      pos: 10,
      type: 'rerate',
      targetPlayerName: 'Sam Prendergast',
      currentValue: 80,
      proposedValue: 86,
      rationale: 'World class form in Champions Cup fixtures',
      proposerId: 'm1',
      proposerName: 'Conor R',
      createdAt: '2026-09-02T12:00:00Z',
      expiresAt: '2026-09-09T12:00:00Z',
      status: 'passed',
      resolvedValue: 86,
      resolutionNote: 'Passed by consensus (3/3 votes)',
      votes: [
        {
          id: 'v1',
          proposalId: 'prop-test-numeric',
          memberId: 'm2',
          memberName: 'Dave H',
          choice: 'support',
          counterValue: 86,
          timestamp: '2026-09-02T12:05:00Z',
        },
        {
          id: 'v2',
          proposalId: 'prop-test-numeric',
          memberId: 'm3',
          memberName: 'Niall B',
          choice: 'support',
          counterValue: 86,
          timestamp: '2026-09-02T12:10:00Z',
        },
      ],
      comments: [],
    };

    const evaluation = evaluateProposal(proposal, 4);
    expect(evaluation.status).toBe('passed');
    expect(evaluation.resolvedRating).toBe(86);

    render(
      <ProposalCard
        proposal={proposal}
        activeMember={mockMember}
        position={POSITIONS.find((p) => p.id === 10)}
        onVote={vi.fn()}
        onComment={vi.fn()}
      />
    );

    // Assert card displays the exact resolved value computed
    expect(screen.getByText(/Passed \(86\)/i)).toBeTruthy();

    // Assert card displays the resolution note / summary
    expect(screen.getByText('Passed by consensus (3/3 votes)')).toBeTruthy();
  });

  it('renders typed action "Retired" for non-numeric retire proposal without NaN', () => {
    const proposal: Proposal = {
      id: 'prop-test-retire',
      pos: 4,
      type: 'retire',
      targetPlayerName: 'Senior Lock',
      currentValue: 85,
      proposedValue: 'retired',
      rationale: 'Retired from professional rugby',
      proposerId: 'm1',
      proposerName: 'Conor R',
      createdAt: '2026-09-02T12:00:00Z',
      expiresAt: '2026-09-09T12:00:00Z',
      status: 'passed',
      resolvedValue: 'retired',
      votes: [
        {
          id: 'v1',
          proposalId: 'prop-test-retire',
          memberId: 'm2',
          memberName: 'Dave H',
          choice: 'support',
          timestamp: '2026-09-02T12:05:00Z',
        },
        {
          id: 'v2',
          proposalId: 'prop-test-retire',
          memberId: 'm3',
          memberName: 'Niall B',
          choice: 'support',
          timestamp: '2026-09-02T12:10:00Z',
        },
      ],
      comments: [],
    };

    const evaluation = evaluateProposal(proposal, 4);
    expect(evaluation.resolvedAction).toBe('retire');
    expect(evaluation.resolvedRating).toBeUndefined();

    render(
      <ProposalCard
        proposal={proposal}
        activeMember={mockMember}
        position={POSITIONS.find((p) => p.id === 4)}
        onVote={vi.fn()}
        onComment={vi.fn()}
      />
    );

    // Card must display "Passed (Retired)" and never "Passed (NaN)" or "Passed (undefined)"
    expect(screen.getByText(/Passed \(Retired\)/i)).toBeTruthy();
    expect(screen.queryByText(/NaN/i)).toBeNull();
  });

  it('proves dissent transparency: renders visible dissent range 51–90 and challenge count on adversarial split pass', () => {
    // Adversarial review probe: proposed 80, votes: support 90, support 90, challenge 51
    const proposal: Proposal = {
      id: 'prop-adversarial-split',
      pos: 10,
      type: 'rerate',
      targetPlayerName: 'Jack Crowley',
      currentValue: 80,
      proposedValue: 80,
      rationale: 'Should Crowley be pushed higher?',
      proposerId: 'm1',
      proposerName: 'Conor R',
      createdAt: '2026-09-02T12:00:00Z',
      expiresAt: '2026-09-09T12:00:00Z',
      status: 'passed',
      resolvedValue: 85,
      votes: [
        {
          id: 'v1',
          proposalId: 'prop-adversarial-split',
          memberId: 'm2',
          memberName: 'Dave H',
          choice: 'support',
          counterValue: 90,
          timestamp: '2026-09-02T12:05:00Z',
        },
        {
          id: 'v2',
          proposalId: 'prop-adversarial-split',
          memberId: 'm3',
          memberName: 'Niall B',
          choice: 'support',
          counterValue: 90,
          timestamp: '2026-09-02T12:10:00Z',
        },
        {
          id: 'v3',
          proposalId: 'prop-adversarial-split',
          memberId: 'm4',
          memberName: 'Challenger',
          choice: 'challenge',
          counterValue: 51,
          timestamp: '2026-09-02T12:15:00Z',
        },
      ],
      comments: [],
    };

    const evaluation = evaluateProposal(proposal, 5);
    expect(evaluation.status).toBe('passed');
    expect(evaluation.resolvedRating).toBe(85);
    expect(evaluation.spread?.min).toBe(51);
    expect(evaluation.spread?.max).toBe(90);

    render(
      <ProposalCard
        proposal={proposal}
        activeMember={mockMember}
        position={POSITIONS.find((p) => p.id === 10)}
        onVote={vi.fn()}
        onComment={vi.fn()}
      />
    );

    // Assert card displays the exact median rating
    expect(screen.getByText(/Passed \(85\)/i)).toBeTruthy();

    // Assert dissent banner is rendered and explicitly displays range 51–90
    const dissentBanner = screen.getByTestId('dissent-banner');
    expect(dissentBanner).toBeTruthy();
    expect(dissentBanner.textContent).toContain('51–90');
    expect(dissentBanner.textContent).toContain('1 challenge vote(s) recorded');
  });
});

describe('PositionCard — Vacated Shirt UI Surface', () => {
  it('renders explicit amber warning banner when isVacant is true', () => {
    const pos = POSITIONS.find((p) => p.id === 6)!;

    render(
      <PositionCard
        position={pos}
        players={[]}
        onChallengePlayer={vi.fn()}
        onAddPlayer={vi.fn()}
        isVacant={true}
      />
    );

    // Must visibly display the vacant shirt warning
    expect(
      screen.getByText(/⚠ Shirt Vacant: No eligible starter — all contenders assigned elsewhere/i)
    ).toBeTruthy();
  });
});
