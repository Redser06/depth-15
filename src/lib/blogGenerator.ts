import {
  BlogCategory,
  BlogPost,
  PlayerEntry,
  Position,
  Proposal,
  ResolvedSquadSelection,
} from '../types/depth';
import { calculateDepthScore } from './depthCalc';

export interface GenerateDigestInput {
  players: PlayerEntry[];
  proposals: Proposal[];
  positions: Position[];
  authorId: string;
  authorName: string;
  resolvedSelection: ResolvedSquadSelection;
  nowIso?: string;
}

export function generateConsensusDigestPost(input: GenerateDigestInput): BlogPost {
  const {
    players,
    proposals,
    positions,
    authorId,
    authorName,
    resolvedSelection,
    nowIso = new Date().toISOString(),
  } = input;

  const ladders = resolvedSelection.adjustedLadders;

  // Compute position depth scores & starter-to-backup drop-offs across measured positions
  const posSummaries = positions
    .map((pos) => {
      const list = (ladders[pos.id] ?? []).filter((p) => p.status === 'active');
      const depthScore = calculateDepthScore(list);
      const starter = list[0];
      const backup = list[1];
      const dropoff = starter && backup ? starter.rating - backup.rating : null;
      return {
        pos,
        list,
        depthScore,
        starter,
        backup,
        dropoff,
      };
    })
    .filter((item) => item.list.length > 0);

  const strongestPos = [...posSummaries].sort((a, b) => b.depthScore - a.depthScore)[0];
  const steepestDropPos = [...posSummaries]
    .filter((item) => item.dropoff !== null)
    .sort((a, b) => (b.dropoff ?? 0) - (a.dropoff ?? 0))[0];

  const openProposals = proposals.filter((p) => p.status === 'open');
  const contestedPlayers = players
    .filter((p) => p.status === 'active' && p.isContested)
    .sort((a, b) => (b.spread?.stdDev ?? 0) - (a.spread?.stdDev ?? 0));

  const dateLabel = nowIso.slice(0, 10);
  const xvAvg = resolvedSelection.startingXVAverageRating;
  const resolvedCount = resolvedSelection.resolvedStarterCount;

  const linkedPositions: number[] = [];
  if (strongestPos) linkedPositions.push(strongestPos.pos.id);
  if (steepestDropPos && !linkedPositions.includes(steepestDropPos.pos.id)) {
    linkedPositions.push(steepestDropPos.pos.id);
  }
  if (openProposals[0] && !linkedPositions.includes(openProposals[0].pos)) {
    linkedPositions.push(openProposals[0].pos);
  }

  const spotlightPlayerNames: string[] = [];
  if (strongestPos?.starter) spotlightPlayerNames.push(strongestPos.starter.name);
  if (steepestDropPos?.starter && !spotlightPlayerNames.includes(steepestDropPos.starter.name)) {
    spotlightPlayerNames.push(steepestDropPos.starter.name);
  }
  if (openProposals[0] && !spotlightPlayerNames.includes(openProposals[0].targetPlayerName)) {
    spotlightPlayerNames.push(openProposals[0].targetPlayerName);
  } else if (contestedPlayers[0] && !spotlightPlayerNames.includes(contestedPlayers[0].name)) {
    spotlightPlayerNames.push(contestedPlayers[0].name);
  }

  const leadDebateTarget = openProposals[0]
    ? {
        targetPlayerName: openProposals[0].targetPlayerName,
        pos: openProposals[0].pos,
        proposedRating:
          typeof openProposals[0].proposedValue === 'number'
            ? openProposals[0].proposedValue
            : 84,
        rationale: openProposals[0].rationale,
      }
    : steepestDropPos?.backup
    ? {
        targetPlayerName: steepestDropPos.backup.name,
        pos: steepestDropPos.pos.id,
        proposedRating: Math.min(99, steepestDropPos.backup.rating + 3),
        rationale: `Closing the ${steepestDropPos.dropoff}-point starter-to-backup gap at ${steepestDropPos.pos.name} (#${steepestDropPos.pos.num}).`,
      }
    : undefined;

  const strongestBody = strongestPos
    ? `${strongestPos.pos.name} (#${strongestPos.pos.num}) currently leads the squad with a weighted Depth Score of ${strongestPos.depthScore}, anchored by ${strongestPos.starter?.name ?? 'our #1 starter'} (${strongestPos.starter?.rating ?? '—'})${
        strongestPos.backup ? ` and backed up by ${strongestPos.backup.name} (${strongestPos.backup.rating})` : ''
      }. Across ${resolvedCount} occupied Starting XV shirts, Ireland's consensus starting average stands at ${xvAvg}.`
    : `No active position ladders are currently populated in the chart.`;

  const cliffEdgeBody = steepestDropPos
    ? `Our sharpest single-injury cliff edge sits at ${steepestDropPos.pos.name} (#${steepestDropPos.pos.num}), where the drop-off from #1 ${steepestDropPos.starter?.name} (${steepestDropPos.starter?.rating}) to #2 ${steepestDropPos.backup?.name} (${steepestDropPos.backup?.rating}) spans ${steepestDropPos.dropoff} rating points. That gap makes #${steepestDropPos.pos.num} the highest-leverage shirt for upcoming provincial minutes.`
    : `All measured positions currently have single-tier coverage without a measured #1-to-#2 gap.`;

  const debateBody =
    openProposals.length > 0
      ? `There ${openProposals.length === 1 ? 'is 1 active proposal' : `are ${openProposals.length} active proposals`} open on the floor right now—headlined by ${openProposals
          .slice(0, 3)
          .map((p) => `${p.targetPlayerName} (#${p.pos}: ${p.currentValue} → ${p.proposedValue})`)
          .join(', ')}. Cast your support or counter-rating before the voting window closes.`
      : contestedPlayers.length > 0
      ? `While there are 0 open proposals in the queue right now, ${contestedPlayers.length} players carry contested voter spreads—led by ${contestedPlayers
          .slice(0, 3)
          .map((p) => `${p.name} (#${p.pos}, rated ${p.rating})`)
          .join(', ')}.`
      : `The floor is currently at full consensus with 0 open proposals and 0 contested player spreads.`;

  return {
    id: `blog-digest-${Date.now()}`,
    slug: `weekly-consensus-digest-${dateLabel}`,
    title: `Weekly Consensus Digest (${dateLabel}): Starting XV at ${xvAvg} & Live Squad Movers`,
    subtitle:
      openProposals.length > 0
        ? `Live data dispatch covering ${openProposals.length} open pub ${
            openProposals.length === 1 ? 'debate' : 'debates'
          }, top unit resilience at ${strongestPos?.pos.name ?? 'the pack'}, and our sharpest injury cliff-edge.`
        : `Automated squad audit across ${resolvedCount} occupied Starting XV shirts, highlighting unit depth and high-leverage backup gaps.`,
    category: 'Consensus Digest',
    authorId,
    authorName,
    authorRole: 'Automated Squad Intelligence',
    publishedAt: nowIso,
    readTimeMinutes: 3,
    featured: false,
    tags: [
      'Consensus Digest',
      `XV Avg ${xvAvg}`,
      ...(strongestPos ? [`Pos ${strongestPos.pos.num}`] : []),
      ...(steepestDropPos ? [`Pos ${steepestDropPos.pos.num}`] : []),
    ],
    linkedPositions,
    spotlightPlayerNames,
    hotTake: leadDebateTarget,
    sections: [
      {
        heading: '1. Headline Starting XV & Strongest Unit',
        body: strongestBody,
        callout:
          resolvedSelection.unresolvedPositions.length > 0
            ? `Vacancy Notice: ${resolvedSelection.unresolvedPositions.length} position shirt(s) currently have no active contender (#${resolvedSelection.unresolvedPositions.join(', #')}).`
            : `Starting XV Integrity: ${resolvedCount} of ${resolvedSelection.totalPositions} shirts occupied with an average rating of ${xvAvg}.`,
        embeddedPosId: strongestPos?.pos.id,
      },
      {
        heading: '2. Vulnerability Watch: The Starter-to-Backup Cliff Edge',
        body: cliffEdgeBody,
        embeddedPosId:
          steepestDropPos && steepestDropPos.pos.id !== strongestPos?.pos.id
            ? steepestDropPos.pos.id
            : undefined,
      },
      {
        heading: '3. Active Pub Debates & Contested Shirts',
        body: debateBody,
      },
    ],
    likes: [authorId],
    comments: [],
  };
}

export function filterBlogPosts(
  posts: BlogPost[],
  options: {
    category?: 'all' | BlogCategory;
    positionId?: 'all' | number;
    searchQuery?: string;
  }
): BlogPost[] {
  const { category = 'all', positionId = 'all', searchQuery = '' } = options;
  const q = searchQuery.trim().toLowerCase();

  return posts.filter((post) => {
    if (category !== 'all' && post.category !== category) {
      return false;
    }
    if (positionId !== 'all' && !post.linkedPositions.includes(positionId)) {
      return false;
    }
    if (q.length > 0) {
      const inTitle = post.title.toLowerCase().includes(q);
      const inSubtitle = post.subtitle.toLowerCase().includes(q);
      const inAuthor = post.authorName.toLowerCase().includes(q);
      const inTags = post.tags.some((t) => t.toLowerCase().includes(q));
      const inSpotlight = post.spotlightPlayerNames.some((n) => n.toLowerCase().includes(q));
      const inBody = post.sections.some(
        (s) =>
          s.body.toLowerCase().includes(q) ||
          (s.heading && s.heading.toLowerCase().includes(q))
      );
      return inTitle || inSubtitle || inAuthor || inTags || inSpotlight || inBody;
    }
    return true;
  });
}
