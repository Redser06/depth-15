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

export type Province = 'Leinster' | 'Munster' | 'Ulster' | 'Connacht' | 'Exile' | 'Other';
export const PROVINCES: Province[] = ['Leinster', 'Munster', 'Ulster', 'Connacht', 'Exile', 'Other'];

export interface PlayerEntry {
  id: string;
  name: string;
  pos: number;
  rating: number;
  secondary: boolean;
  province?: Province;
  uncapped?: boolean;
  status: PlayerStatus;
  statusReason?: string;
  lastReviewed: string;
  spread?: RatingSpread;
  isContested?: boolean;
  disputeCount?: number;
  rolledOver?: boolean;
  startsAtOtherPos?: number; // Indicates this player is selected as #1 starter in another position
}

export type ProposalType = 'rerate' | 'reorder' | 'add_player' | 'retire' | 'add_secondary' | 'select_starter' | 'transfer';

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
  province?: Province;
  uncapped?: boolean;
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

// Starter Selection & Tactical Conflict Types
export interface StarterConflict {
  playerName: string;
  positions: Array<{ posId: number; posName: string; rating: number; isPrimary: boolean }>;
  currentAssignedPos: number;
}

export interface TacticalOption {
  assignedPos: number;
  posName: string;
  playerRatingAtPos: number;
  alternativePos: number;
  alternativePosName: string;
  backupStarterName: string;
  backupStarterRating: number;
  backupDropoff: number; // gap between player rating at alternative pos and backup
  combinedScore: number; // playerRatingAtPos + backupStarterRating
  summary: string;
}

export interface TacticalTradeoff {
  playerName: string;
  options: TacticalOption[];
  bestOptionPos: number;
  netDelta: number;
  explanation: string;
}

export interface ProposalResolution {
  canResolve: boolean;
  quorumMet: boolean;
  supports: number;
  challenges: number;
  status: 'open' | 'passed' | 'failed';
  proposalType: ProposalType;
  resolvedRating?: number;
  resolvedAction?: 'rerate' | 'retire' | 'add_player' | 'reorder' | 'add_secondary' | 'select_starter' | 'transfer';
  spread?: RatingSpread;
  summary: string;
}

export interface ResolvedSquadSelection {
  starters: Record<number, PlayerEntry>;
  adjustedLadders: Record<number, PlayerEntry[]>;
  conflicts: StarterConflict[];
  tradeoffs: TacticalTradeoff[];
  startingXVAverageRating: number;
  unresolvedPositions: number[];
  resolvedStarterCount: number;
  ignoredAssignments: string[];
  totalPositions: number;
}

export type BlogCategory =
  | 'Matchday Analysis'
  | 'Positional Deep-Dive'
  | 'U20 & Breakthrough Watch'
  | 'Consensus Digest';

export const BLOG_CATEGORIES: BlogCategory[] = [
  'Matchday Analysis',
  'Positional Deep-Dive',
  'U20 & Breakthrough Watch',
  'Consensus Digest',
];

export interface BlogSection {
  heading?: string;
  body: string;
  callout?: string;
  embeddedPosId?: number;
}

export interface BlogComment {
  id: string;
  memberId: string;
  memberName: string;
  text: string;
  timestamp: string;
}

export interface BlogHotTake {
  targetPlayerName: string;
  pos: number;
  proposedRating: number;
  rationale: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: BlogCategory;
  authorId: string;
  authorName: string;
  authorRole: string;
  publishedAt: string;
  readTimeMinutes: number;
  featured?: boolean;
  tags: string[];
  linkedPositions: number[];
  spotlightPlayerNames: string[];
  hotTake?: BlogHotTake;
  sections: BlogSection[];
  likes: string[];
  comments: BlogComment[];
}

