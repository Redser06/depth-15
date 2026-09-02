export type PositionGroup = 'Forwards' | 'Backs';

export interface Position {
  id: number;
  num: string;
  name: string;
  abbr: string;
  group: PositionGroup;
}

export type PlayerStatus = 'active' | 'retired' | 'ineligible' | 'injured';

export interface RatingSpread {
  min: number;
  max: number;
  stdDev: number;
  voteCount: number;
}

export interface PlayerEntry {
  id: string;
  name: string;
  pos: number;
  rating: number;
  secondary: boolean;
  province?: 'Leinster' | 'Munster' | 'Ulster' | 'Connacht' | 'Exile' | 'Other';
  uncapped?: boolean;
  status: PlayerStatus;
  statusReason?: string;
  lastReviewed: string;
  spread?: RatingSpread;
  isContested?: boolean;
  disputeCount?: number;
  rolledOver?: boolean;
}

export type ProposalType = 'rerate' | 'reorder' | 'add_player' | 'retire' | 'add_secondary';

export type ProposalStatus = 'open' | 'passed' | 'failed' | 'cancelled';

export interface Vote {
  id: string;
  proposalId: string;
  memberId: string;
  memberName: string;
  choice: 'support' | 'challenge';
  counterValue?: number;
  rationale?: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  proposalId: string;
  memberId: string;
  memberName: string;
  text: string;
  timestamp: string;
}

export interface Proposal {
  id: string;
  type: ProposalType;
  targetPlayerName: string;
  pos: number;
  proposerId: string;
  proposerName: string;
  createdAt: string;
  expiresAt: string;
  status: ProposalStatus;
  currentValue: number | string;
  proposedValue: number | string;
  rationale: string;
  votes: Vote[];
  comments: Comment[];
  resolvedAt?: string;
  resolvedValue?: number | string;
  resolutionNote?: string;
}

export interface Member {
  id: string;
  name: string;
  role: 'owner' | 'member' | 'lurker';
  initials: string;
  color: string;
  province?: string;
}

export interface Snapshot {
  id: string;
  version: string;
  title: string;
  createdAt: string;
  createdBy: string;
  players: PlayerEntry[];
  notes?: string;
}

export interface Gate2Entrant {
  id: string;
  name: string;
  pos: number;
  rating: number;
  stream: 'Newly Capped' | 'U20 / Emerging' | 'Provincial Breakthrough' | 'Returning Exile';
  province: 'Leinster' | 'Munster' | 'Ulster' | 'Connacht' | 'Exile';
  uncapped: boolean;
  rationale: string;
}

export interface RebaseSession {
  isOpen: boolean;
  targetSeason: string;
  currentGate: 1 | 2 | 3 | 4;
  openedAt?: string;
  openedBy?: string;
  gate1Attrition: Record<string, { action: 'keep' | 'retire' | 'ineligible'; reason?: string }>;
  gate2Entrants: Gate2Entrant[];
  gate3PositionsReviewed: Record<number, boolean>;
}
