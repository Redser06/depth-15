import { useState, useEffect, useCallback, useMemo } from 'react';
import { PlayerEntry, Proposal, Snapshot, RebaseSession, Gate2Entrant, ProposalResolution } from '../types/depth';
import { BASELINE_PLAYERS, IMMUTABLE_2025_SNAPSHOT, POSITIONS } from '../data/baseline2025';
import { DEFAULT_MEMBERS, DEFAULT_GROUP_CODE } from '../data/defaultMembers';
import { evaluateProposal } from './consensusEngine';
import { resolveStartingXV } from './selectionRules';
import { groupPlayersByPosition } from './depthCalc';

const STORAGE_KEYS = {
  PLAYERS: 'depth15_players_v1',
  PROPOSALS: 'depth15_proposals_v1',
  SNAPSHOTS: 'depth15_snapshots_v1',
  ACTIVE_MEMBER: 'depth15_active_member_v1',
  REBASE: 'depth15_rebase_v1',
  DARK_MODE: 'depth15_dark_mode_v1',
  STARTER_ASSIGNMENTS: 'depth15_starters_v1',
  POSITION_ORDERS: 'depth15_orders_v1',
};

// Seed initial realistic debate proposals so app is immediately rich with live pub discussion
const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop-prendergast-10',
    type: 'rerate',
    targetPlayerName: 'Sam Prendergast',
    pos: 10,
    proposerId: 'm-conor',
    proposerName: 'Conor Redmond',
    createdAt: '2026-09-01T15:30:00Z',
    expiresAt: '2026-09-04T15:30:00Z',
    status: 'open',
    currentValue: 80,
    proposedValue: 86,
    rationale: 'His distribution against South Africa in the summer tour showed an elite second-receiver ceiling. Time to reflect that he is challenging Jack Crowley directly for the 10 shirt, not just an 80 squad cover.',
    votes: [
      {
        id: 'v-1',
        proposalId: 'prop-prendergast-10',
        memberId: 'm-conor',
        memberName: 'Conor Redmond',
        choice: 'support',
        counterValue: 86,
        rationale: 'Sticking with 86 after watching the tour replay.',
        timestamp: '2026-09-01T15:30:00Z',
      },
      {
        id: 'v-2',
        proposalId: 'prop-prendergast-10',
        memberId: 'm-ronan',
        memberName: 'Ronan O’Shea',
        choice: 'challenge',
        counterValue: 82,
        rationale: '86 is wild lads. Defense in the URC quarter-final was exposed. 82 maximum until he fronts up physically against the French pack.',
        timestamp: '2026-09-01T17:15:00Z',
      },
      {
        id: 'v-3',
        proposalId: 'prop-prendergast-10',
        memberId: 'm-declan',
        memberName: 'Declan Murphy',
        choice: 'support',
        counterValue: 84,
        rationale: 'Fair compromise is 84. His kick-pass execution unlocks wings that Crowley can sometimes leave cold.',
        timestamp: '2026-09-01T19:40:00Z',
      }
    ],
    comments: [
      {
        id: 'c-1',
        proposalId: 'prop-prendergast-10',
        memberId: 'm-fiona',
        memberName: 'Fiona Walsh',
        text: 'Are we voting on ceiling or where he starts tomorrow against the Boks? Because Crowley starts tomorrow 100 times out of 100.',
        timestamp: '2026-09-01T18:05:00Z',
      },
      {
        id: 'c-2',
        proposalId: 'prop-prendergast-10',
        memberId: 'm-conor',
        memberName: 'Conor Redmond',
        text: 'Current level at international intensity. An 85+ rating puts him in the conversation without claiming he displaces Crowley today.',
        timestamp: '2026-09-01T18:22:00Z',
      }
    ]
  },
  {
    id: 'prop-furlong-3',
    type: 'rerate',
    targetPlayerName: 'Tadhg Furlong',
    pos: 3,
    proposerId: 'm-declan',
    proposerName: 'Declan Murphy',
    createdAt: '2026-09-02T11:00:00Z',
    expiresAt: '2026-09-05T11:00:00Z',
    status: 'open',
    currentValue: 88,
    proposedValue: 83,
    rationale: 'Minutes management and recurring hamstring issues mean he has completed fewer than 50 minutes per match in the last calendar year. Bealham and Clarkson are carrying the scrum load.',
    votes: [
      {
        id: 'v-4',
        proposalId: 'prop-furlong-3',
        memberId: 'm-declan',
        memberName: 'Declan Murphy',
        choice: 'support',
        counterValue: 83,
        timestamp: '2026-09-02T11:00:00Z',
      },
      {
        id: 'v-5',
        proposalId: 'prop-furlong-3',
        memberId: 'm-brian',
        memberName: 'Brian Kelly',
        choice: 'challenge',
        counterValue: 87,
        rationale: 'Class is permanent. When he played the 55 minutes in Twickenham he destroyed the England loosehead. You do not drop Furlong to 83.',
        timestamp: '2026-09-02T12:30:00Z',
      }
    ],
    comments: [
      {
        id: 'c-3',
        proposalId: 'prop-furlong-3',
        memberId: 'm-ronan',
        memberName: 'Ronan O’Shea',
        text: 'The question is tighthead depth if he pulls up in warm-up. That is why this 3 spot gives me nightmares.',
        timestamp: '2026-09-02T13:00:00Z',
      }
    ]
  }
];

export function useDepthStore() {
  // Players state
  const [players, setPlayers] = useState<PlayerEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return BASELINE_PLAYERS;
  });

  // Proposals state
  const [proposals, setProposals] = useState<Proposal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PROPOSALS;
  });

  // Snapshots state
  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [IMMUTABLE_2025_SNAPSHOT];
  });

  // Active member
  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_MEMBER);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return 'm-conor';
  });

  // Rebase session state
  const [rebaseSession, setRebaseSession] = useState<RebaseSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REBASE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      isOpen: false,
      targetSeason: '2026-27',
      currentGate: 1,
      gate1Attrition: {},
      gate2Entrants: [],
      gate3PositionsReviewed: {},
    };
  });

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return false; // Default bright light mode per user instruction!
  });

  // Starter assignments state (for players with conflicts or manual preference)
  const [starterAssignments, setStarterAssignments] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STARTER_ASSIGNMENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  // Custom rank-ordered position ladders
  const [positionOrders, setPositionOrders] = useState<Record<number, string[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POSITION_ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  // Sync starter assignments & position orders
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STARTER_ASSIGNMENTS, JSON.stringify(starterAssignments));
    } catch (e) {
      console.error(e);
    }
  }, [starterAssignments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POSITION_ORDERS, JSON.stringify(positionOrders));
    } catch (e) {
      console.error(e);
    }
  }, [positionOrders]);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    } catch (e) {
      console.error(e);
    }
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(proposals));
    } catch (e) {
      console.error(e);
    }
  }, [proposals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
    } catch (e) {
      console.error(e);
    }
  }, [snapshots]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MEMBER, activeMemberId);
    } catch (e) {
      console.error(e);
    }
  }, [activeMemberId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REBASE, JSON.stringify(rebaseSession));
    } catch (e) {
      console.error(e);
    }
  }, [rebaseSession]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [darkMode]);

  const activeMember = DEFAULT_MEMBERS.find(m => m.id === activeMemberId) ?? DEFAULT_MEMBERS[0]!;

  // 1. Group active players by position
  const rawPlayersByPos = useMemo(() => {
    return groupPlayersByPosition(players, POSITIONS);
  }, [players]);

  // 2. Apply drag-and-drop custom order if set
  const orderedPlayersByPos = useMemo(() => {
    const result: Record<number, PlayerEntry[]> = {};
    POSITIONS.forEach(pos => {
      const originalList = rawPlayersByPos[pos.id] ?? [];
      const order = positionOrders[pos.id];
      if (order && order.length > 0) {
        const orderMap = new Map(order.map((id, idx) => [id, idx]));
        result[pos.id] = [...originalList].sort((a, b) => {
          const idxA = orderMap.get(a.id) ?? 999;
          const idxB = orderMap.get(b.id) ?? 999;
          return idxA - idxB;
        });
      } else {
        result[pos.id] = originalList;
      }
    });
    return result;
  }, [rawPlayersByPos, positionOrders]);

  // 3. Resolve starting XV and detect conflicts/tradeoffs
  const resolvedSelection = useMemo(() => {
    return resolveStartingXV(orderedPlayersByPos, POSITIONS, starterAssignments);
  }, [orderedPlayersByPos, starterAssignments]);

  const reorderPositionLadder = useCallback((posId: number, orderedPlayerIds: string[]) => {
    setPositionOrders(prev => ({
      ...prev,
      [posId]: orderedPlayerIds,
    }));
    // If the top player changed, make sure they are recorded as starter for this position
    const topPlayerId = orderedPlayerIds[0];
    const topPlayer = players.find(p => p.id === topPlayerId && p.pos === posId);
    if (topPlayer) {
      setStarterAssignments(prev => ({
        ...prev,
        [topPlayer.name]: posId,
      }));
    }
  }, [players]);

  const assignPlayerStarter = useCallback((playerName: string, posId: number) => {
    setStarterAssignments(prev => ({
      ...prev,
      [playerName]: posId,
    }));
  }, []);

  // Actions
  const createProposal = useCallback((data: {
    type: Proposal['type'];
    targetPlayerName: string;
    pos: number;
    currentValue: number | string;
    proposedValue: number | string;
    rationale: string;
  }) => {
    const newProposal: Proposal = {
      id: `prop-${Date.now()}`,
      ...data,
      proposerId: activeMember.id,
      proposerName: activeMember.name,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(), // 72 hours
      status: 'open',
      votes: [
        {
          id: `vote-${Date.now()}`,
          proposalId: `prop-${Date.now()}`,
          memberId: activeMember.id,
          memberName: activeMember.name,
          choice: 'support',
          counterValue: typeof data.proposedValue === 'number' ? data.proposedValue : undefined,
          rationale: 'Proposer initial position',
          timestamp: new Date().toISOString(),
        }
      ],
      comments: [],
    };

    setProposals(prev => [newProposal, ...prev]);
    return newProposal;
  }, [activeMember]);

  // Domain effect mutation applier for passed proposals (BLOCKER 1 & SERIOUS 2)
  const applyPassedProposalMutation = useCallback((prop: Proposal, resolution: ProposalResolution) => {
    const cleanName = prop.targetPlayerName.toLowerCase().trim();

    if (prop.type === 'retire') {
      // 1. Mark player retired
      setPlayers(curr => curr.map(pl => {
        if (pl.name.toLowerCase().trim() === cleanName) {
          return {
            ...pl,
            status: 'retired',
            statusReason: prop.rationale || 'Retired by group consensus',
          };
        }
        return pl;
      }));

      // 2. Purge any starter assignments for this player
      setStarterAssignments(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          if (k.toLowerCase().trim() === cleanName) {
            delete next[k];
          }
        });
        return next;
      });
    } else if (prop.type === 'add_player') {
      const rating = typeof resolution.resolvedRating === 'number' && !isNaN(resolution.resolvedRating)
        ? resolution.resolvedRating
        : (typeof prop.proposedValue === 'number' && !isNaN(prop.proposedValue) ? prop.proposedValue : 70);

      const newPlayer: PlayerEntry = {
        id: `p-${prop.pos}-${Date.now()}`,
        name: prop.targetPlayerName.trim(),
        pos: prop.pos,
        rating,
        secondary: false,
        status: 'active',
        lastReviewed: 'Consensus Add',
        spread: resolution.spread ?? {
          min: rating,
          max: rating,
          stdDev: 0,
          voteCount: prop.votes.length,
        },
        isContested: false,
        disputeCount: 0,
      };

      setPlayers(curr => [...curr, newPlayer]);
    } else if (prop.type === 'reorder' || prop.type === 'select_starter') {
      // Assign target player as starter for this position
      setStarterAssignments(prev => ({
        ...prev,
        [prop.targetPlayerName.trim()]: prop.pos,
      }));
    } else {
      // Default: rerate / add_secondary
      const newRating = resolution.resolvedRating ?? (typeof prop.proposedValue === 'number' ? prop.proposedValue : 75);
      setPlayers(curr => curr.map(pl => {
        if (pl.pos === prop.pos && pl.name.toLowerCase().trim() === cleanName) {
          return {
            ...pl,
            rating: newRating,
            spread: resolution.spread ?? pl.spread,
            isContested: false,
            lastReviewed: new Date().toLocaleDateString('en-IE', { month: 'short', year: 'numeric' }),
          };
        }
        return pl;
      }));
    }
  }, []);

  const castVote = useCallback((proposalId: string, choice: 'support' | 'challenge', counterValue?: number, rationale?: string) => {
    setProposals(prev => prev.map(prop => {
      if (prop.id !== proposalId) return prop;

      // Filter out existing vote from this member if any (one vote per member)
      const otherVotes = prop.votes.filter(v => v.memberId !== activeMember.id);
      const newVote: Proposal['votes'][0] = {
        id: `v-${Date.now()}`,
        proposalId: prop.id,
        memberId: activeMember.id,
        memberName: activeMember.name,
        choice,
        counterValue: choice === 'challenge'
          ? (counterValue ?? (typeof prop.currentValue === 'number' ? prop.currentValue : 70))
          : (counterValue ?? (typeof prop.proposedValue === 'number' ? prop.proposedValue : undefined)),
        rationale,
        timestamp: new Date().toISOString(),
      };

      const updatedVotes = [...otherVotes, newVote];
      const updatedProp: Proposal = {
        ...prop,
        votes: updatedVotes,
      };

      // Check if quorum is met
      const resolution = evaluateProposal(updatedProp, DEFAULT_MEMBERS.filter(m => m.role !== 'lurker').length);
      if (resolution.canResolve) {
        if (resolution.status === 'passed') {
          applyPassedProposalMutation(updatedProp, resolution);
          return {
            ...updatedProp,
            status: 'passed',
            resolvedAt: new Date().toISOString(),
            resolvedValue: resolution.resolvedRating ?? (prop.type === 'retire' ? 'retired' : prop.proposedValue),
            resolutionNote: resolution.summary,
          };
        } else if (resolution.status === 'failed') {
          // Flag player as contested
          setPlayers(curr => curr.map(pl => {
            if (pl.pos === prop.pos && pl.name.toLowerCase().trim() === prop.targetPlayerName.toLowerCase().trim()) {
              return {
                ...pl,
                isContested: true,
                disputeCount: (pl.disputeCount ?? 0) + 1,
              };
            }
            return pl;
          }));
          return {
            ...updatedProp,
            status: 'failed',
            resolvedAt: new Date().toISOString(),
            resolutionNote: resolution.summary,
          };
        }
      }

      return updatedProp;
    }));
  }, [activeMember, applyPassedProposalMutation]);

  const addComment = useCallback((proposalId: string, text: string) => {
    if (!text.trim()) return;
    setProposals(prev => prev.map(prop => {
      if (prop.id !== proposalId) return prop;
      return {
        ...prop,
        comments: [
          ...prop.comments,
          {
            id: `c-${Date.now()}`,
            proposalId,
            memberId: activeMember.id,
            memberName: activeMember.name,
            text: text.trim(),
            timestamp: new Date().toISOString(),
          }
        ]
      };
    }));
  }, [activeMember]);

  const manuallyResolveProposal = useCallback((proposalId: string) => {
    setProposals(prev => prev.map(prop => {
      if (prop.id !== proposalId) return prop;
      const resolution = evaluateProposal(prop, DEFAULT_MEMBERS.filter(m => m.role !== 'lurker').length);
      
      if (resolution.status === 'passed') {
        applyPassedProposalMutation(prop, resolution);
        return {
          ...prop,
          status: 'passed',
          resolvedAt: new Date().toISOString(),
          resolvedValue: resolution.resolvedRating ?? (prop.type === 'retire' ? 'retired' : prop.proposedValue),
          resolutionNote: resolution.summary,
        };
      } else {
        setPlayers(curr => curr.map(pl => {
          if (pl.pos === prop.pos && pl.name.toLowerCase().trim() === prop.targetPlayerName.toLowerCase().trim()) {
            return {
              ...pl,
              isContested: true,
              disputeCount: (pl.disputeCount ?? 0) + 1,
            };
          }
          return pl;
        }));
        return {
          ...prop,
          status: 'failed',
          resolvedAt: new Date().toISOString(),
          resolutionNote: resolution.summary,
        };
      }
    }));
  }, [applyPassedProposalMutation]);

  // Rebase actions
  const openRebase = useCallback(() => {
    setRebaseSession({
      isOpen: true,
      targetSeason: '2026-27',
      currentGate: 1,
      openedAt: new Date().toISOString(),
      openedBy: activeMember.name,
      gate1Attrition: {},
      gate2Entrants: [],
      gate3PositionsReviewed: {},
    });
  }, [activeMember]);

  const setGate = useCallback((gate: 1 | 2 | 3 | 4) => {
    setRebaseSession(prev => ({ ...prev, currentGate: gate }));
  }, []);

  const recordGate1 = useCallback((playerName: string, action: 'keep' | 'retire' | 'ineligible', reason?: string) => {
    setRebaseSession(prev => ({
      ...prev,
      gate1Attrition: {
        ...prev.gate1Attrition,
        [playerName]: { action, reason }
      }
    }));
  }, []);

  const addGate2Entrant = useCallback((entrant: Omit<Gate2Entrant, 'id'>) => {
    setRebaseSession(prev => ({
      ...prev,
      gate2Entrants: [
        ...prev.gate2Entrants,
        { ...entrant, id: `entrant-${Date.now()}` }
      ]
    }));
  }, []);

  const markGate3Position = useCallback((posId: number) => {
    setRebaseSession(prev => ({
      ...prev,
      gate3PositionsReviewed: {
        ...prev.gate3PositionsReviewed,
        [posId]: true
      }
    }));
  }, []);

  const completeRebaseSignoff = useCallback((versionTitle: string, notes?: string) => {
    // 1. Apply Gate 1 Attrition
    let updated = [...players];
    Object.entries(rebaseSession.gate1Attrition).forEach(([name, decision]) => {
      if (decision.action !== 'keep') {
        updated = updated.map(p => {
          if (p.name.toLowerCase() === name.toLowerCase()) {
            return {
              ...p,
              status: decision.action === 'retire' ? 'retired' : 'ineligible',
              statusReason: decision.reason ?? 'Season re-base attrition',
            };
          }
          return p;
        });
      }
    });

    // 2. Add Gate 2 Entrants
    rebaseSession.gate2Entrants.forEach(entrant => {
      const exists = updated.some(p => p.name.toLowerCase() === entrant.name.toLowerCase() && p.pos === entrant.pos);
      if (!exists) {
        const newPlayer: PlayerEntry = {
          id: `p-${entrant.pos}-${entrant.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name: entrant.name,
          pos: entrant.pos,
          rating: entrant.rating,
          secondary: false,
          province: entrant.province,
          uncapped: entrant.uncapped,
          status: 'active',
          lastReviewed: '2026-27 Season Re-base',
          spread: {
            min: entrant.rating - 2,
            max: entrant.rating + 2,
            stdDev: 1.5,
            voteCount: 5,
          },
          isContested: false,
          disputeCount: 0,
        };
        updated.push(newPlayer);
      }
    });

    // 3. Mark Gate 3 positions as rolled over if not modified
    updated = updated.map(p => {
      if (!p.rolledOver && p.status === 'active') {
        return { ...p, rolledOver: true, lastReviewed: '2026-27.0 Re-base' };
      }
      return p;
    });

    // Purge any retired players from starter assignments
    const retiredNames = new Set(
      updated.filter(p => p.status === 'retired').map(p => p.name.toLowerCase().trim())
    );
    setStarterAssignments(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (retiredNames.has(k.toLowerCase().trim())) {
          delete next[k];
        }
      });
      return next;
    });

    setPlayers(updated);

    // 4. Create new snapshot
    const newSnapshot: Snapshot = {
      id: `snapshot-${Date.now()}`,
      version: '2026-27.0',
      title: versionTitle || '2026-27 Official Season Consensus',
      createdAt: new Date().toISOString(),
      createdBy: activeMember.name,
      players: updated,
      notes: notes || 'Published after 4-gate season re-base with full group sign-off.',
    };

    setSnapshots(prev => [newSnapshot, ...prev]);

    // Close rebase session
    setRebaseSession({
      isOpen: false,
      targetSeason: '2026-27',
      currentGate: 1,
      gate1Attrition: {},
      gate2Entrants: [],
      gate3PositionsReviewed: {},
    });
  }, [players, rebaseSession, activeMember]);

  const resetAllToBaseline = useCallback(() => {
    // Scoped storage removal (LAZY 3) — never nuke unrelated keys on shared origin
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });
    setPlayers(BASELINE_PLAYERS);
    setProposals(INITIAL_PROPOSALS);
    setSnapshots([IMMUTABLE_2025_SNAPSHOT]);
    setActiveMemberId('m-conor');
    setRebaseSession({
      isOpen: false,
      targetSeason: '2026-27',
      currentGate: 1,
      gate1Attrition: {},
      gate2Entrants: [],
      gate3PositionsReviewed: {},
    });
    setStarterAssignments({});
    setPositionOrders({});
    setDarkMode(false);
  }, []);

  return {
    players,
    proposals,
    snapshots,
    activeMember,
    members: DEFAULT_MEMBERS,
    groupCode: DEFAULT_GROUP_CODE,
    rebaseSession,
    darkMode,
    setDarkMode,
    setActiveMemberId,
    starterAssignments,
    positionOrders,
    resolvedSelection,
    reorderPositionLadder,
    assignPlayerStarter,
    createProposal,
    castVote,
    addComment,
    manuallyResolveProposal,
    openRebase,
    setGate,
    recordGate1,
    addGate2Entrant,
    markGate3Position,
    completeRebaseSignoff,
    resetAllToBaseline,
  };
}
