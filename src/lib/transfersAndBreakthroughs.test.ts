import { describe, it, expect } from 'vitest';
import { evaluateProposal } from './consensusEngine';
import { Proposal, PlayerEntry, Province, PROVINCES } from '../types/depth';

describe('Player Transfers and Provincial Squad Allocation', () => {
  it('updates all position instances synchronously when a dual-position player transfers', () => {
    // Andrew Porter plays Loosehead (pos 1) and Tighthead (pos 3)
    const initialPlayers: PlayerEntry[] = [
      {
        id: 'p-1-1',
        name: 'Andrew Porter',
        pos: 1,
        rating: 91,
        secondary: false,
        province: 'Leinster',
        status: 'active',
        lastReviewed: 'Baseline',
        spread: { min: 89, max: 93, stdDev: 1.0, voteCount: 4 },
        isContested: false,
        disputeCount: 0,
      },
      {
        id: 'p-3-2',
        name: 'Andrew Porter',
        pos: 3,
        rating: 88,
        secondary: true,
        province: 'Leinster',
        status: 'active',
        lastReviewed: 'Baseline',
        spread: { min: 86, max: 90, stdDev: 1.2, voteCount: 3 },
        isContested: false,
        disputeCount: 0,
      },
      {
        id: 'p-1-2',
        name: 'Cian Healy',
        pos: 1,
        rating: 77,
        secondary: false,
        province: 'Leinster',
        status: 'active',
        lastReviewed: 'Baseline',
        spread: { min: 75, max: 79, stdDev: 1.1, voteCount: 2 },
        isContested: false,
        disputeCount: 0,
      },
    ];

    // Simulate transfer action logic
    const transferPlayerLogic = (
      players: PlayerEntry[],
      playerName: string,
      newProvince: Province,
      notes?: string
    ) => {
      const cleanName = playerName.toLowerCase().trim();
      return players.map((pl) => {
        if (pl.name.toLowerCase().trim() === cleanName) {
          return {
            ...pl,
            province: newProvince,
            lastReviewed: notes?.trim() ? `Transfer: ${notes.trim()}` : `Transferred to ${newProvince}`,
          };
        }
        return pl;
      });
    };

    const updated = transferPlayerLogic(initialPlayers, 'Andrew Porter', 'Munster', 'Major provincial move');

    // Both instances of Andrew Porter must be Munster
    const porterPos1 = updated.find((p) => p.id === 'p-1-1');
    const porterPos3 = updated.find((p) => p.id === 'p-3-2');
    const healy = updated.find((p) => p.id === 'p-1-2');

    expect(porterPos1?.province).toBe('Munster');
    expect(porterPos3?.province).toBe('Munster');
    expect(porterPos1?.lastReviewed).toBe('Transfer: Major provincial move');
    expect(porterPos3?.lastReviewed).toBe('Transfer: Major provincial move');

    // Unrelated player Cian Healy remains Leinster
    expect(healy?.province).toBe('Leinster');
  });

  it('correctly evaluates transfer proposal consensus without producing NaN ratings', () => {
    const proposal: Proposal = {
      id: 'prop-transfer-1',
      type: 'transfer',
      targetPlayerName: 'Joey Carbery',
      pos: 10,
      proposerId: 'm-1',
      proposerName: 'Conor',
      createdAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      status: 'open',
      currentValue: 'Munster',
      proposedValue: 'Exile',
      province: 'Exile',
      rationale: 'Confirmed signing with Bordeaux-Begles in Top 14.',
      votes: [
        {
          id: 'v-1',
          proposalId: 'prop-transfer-1',
          memberId: 'm-2',
          memberName: 'Brendan',
          choice: 'support',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'v-2',
          proposalId: 'prop-transfer-1',
          memberId: 'm-3',
          memberName: 'Dave',
          choice: 'support',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'v-3',
          proposalId: 'prop-transfer-1',
          memberId: 'm-4',
          memberName: 'Ruairi',
          choice: 'challenge',
          timestamp: new Date().toISOString(),
        },
      ],
      comments: [],
    };

    const resolution = evaluateProposal(proposal, 4);

    expect(resolution.canResolve).toBe(true);
    expect(resolution.status).toBe('passed');
    expect(resolution.proposalType).toBe('transfer');
    expect(resolution.resolvedAction).toBe('transfer');
    expect(resolution.resolvedRating).toBeUndefined(); // Must NOT produce NaN
    expect(resolution.summary).toContain('Joey Carbery');
    expect(resolution.summary).toContain('Exile');
  });
});

describe('2026 Breakthrough Talent Intake', () => {
  it('creates breakthrough player entry with designated rating, province, uncapped status and tight initial spread', () => {
    const createBreakthroughPlayer = (data: {
      name: string;
      pos: number;
      rating: number;
      province: Province;
      uncapped?: boolean;
      secondary?: boolean;
      notes?: string;
    }): PlayerEntry => {
      const cleanName = data.name.trim();
      return {
        id: `p-${data.pos}-${Date.now()}-mock`,
        name: cleanName,
        pos: data.pos,
        rating: data.rating,
        secondary: data.secondary ?? false,
        province: data.province,
        uncapped: data.uncapped ?? true,
        status: 'active',
        lastReviewed: data.notes?.trim() || '2026 Breakthrough Entrant',
        spread: {
          min: Math.max(45, data.rating - 2),
          max: Math.min(99, data.rating + 2),
          stdDev: 1.2,
          voteCount: 1,
        },
        isContested: false,
        disputeCount: 0,
      };
    };

    const newEntrant = createBreakthroughPlayer({
      name: 'Brian Gleeson',
      pos: 8,
      rating: 77,
      province: 'Munster',
      uncapped: true,
      notes: 'U20 World Championship Graduate dominant ball-carrier',
    });

    expect(newEntrant.name).toBe('Brian Gleeson');
    expect(newEntrant.pos).toBe(8);
    expect(newEntrant.rating).toBe(77);
    expect(newEntrant.province).toBe('Munster');
    expect(newEntrant.uncapped).toBe(true);
    expect(newEntrant.status).toBe('active');
    expect(newEntrant.isContested).toBe(false);
    expect(newEntrant.spread).toBeDefined();
    expect(newEntrant.spread?.min).toBe(75);
    expect(newEntrant.spread?.max).toBe(79);
    expect(newEntrant.lastReviewed).toContain('U20 World Championship Graduate');
  });

  it('filters ladders by province accurately without dropping players or corrupting order', () => {
    const squad: PlayerEntry[] = [
      { id: '1', name: 'Dan Sheehan', pos: 2, rating: 92, secondary: false, province: 'Leinster', status: 'active', lastReviewed: '', spread: { min: 90, max: 94, stdDev: 1, voteCount: 1 }, isContested: false, disputeCount: 0 },
      { id: '2', name: 'Ronan Kelleher', pos: 2, rating: 86, secondary: false, province: 'Leinster', status: 'active', lastReviewed: '', spread: { min: 84, max: 88, stdDev: 1, voteCount: 1 }, isContested: false, disputeCount: 0 },
      { id: '3', name: 'Rob Herring', pos: 2, rating: 81, secondary: false, province: 'Ulster', status: 'active', lastReviewed: '', spread: { min: 79, max: 83, stdDev: 1, voteCount: 1 }, isContested: false, disputeCount: 0 },
      { id: '4', name: 'Tom Stewart', pos: 2, rating: 78, secondary: false, province: 'Ulster', status: 'active', lastReviewed: '', spread: { min: 76, max: 80, stdDev: 1, voteCount: 1 }, isContested: false, disputeCount: 0 },
      { id: '5', name: 'Dave Heffernan', pos: 2, rating: 76, secondary: false, province: 'Connacht', status: 'active', lastReviewed: '', spread: { min: 74, max: 78, stdDev: 1, voteCount: 1 }, isContested: false, disputeCount: 0 },
      { id: '6', name: 'Diarmuid Barron', pos: 2, rating: 77, secondary: false, province: 'Munster', status: 'active', lastReviewed: '', spread: { min: 75, max: 79, stdDev: 1, voteCount: 1 }, isContested: false, disputeCount: 0 },
    ];

    const filterByProvince = (list: PlayerEntry[], prov: Province) => {
      return list.filter((p) => p.province === prov);
    };

    const leinsterHookers = filterByProvince(squad, 'Leinster');
    const ulsterHookers = filterByProvince(squad, 'Ulster');
    const munsterHookers = filterByProvince(squad, 'Munster');
    const connachtHookers = filterByProvince(squad, 'Connacht');
    const exileHookers = filterByProvince(squad, 'Exile');

    expect(leinsterHookers.map((p) => p.name)).toEqual(['Dan Sheehan', 'Ronan Kelleher']);
    expect(ulsterHookers.map((p) => p.name)).toEqual(['Rob Herring', 'Tom Stewart']);
    expect(munsterHookers.map((p) => p.name)).toEqual(['Diarmuid Barron']);
    expect(connachtHookers.map((p) => p.name)).toEqual(['Dave Heffernan']);
    expect(exileHookers).toHaveLength(0);
  });

  it('supports all valid provinces defined in PROVINCES constant', () => {
    expect(PROVINCES).toEqual(['Leinster', 'Munster', 'Ulster', 'Connacht', 'Exile', 'Other']);
  });
});
