import { Position, PlayerEntry, StarterConflict, TacticalTradeoff, TacticalOption, ResolvedSquadSelection } from '../types/depth';

/**
 * Validates that across the 15 positions, no player is assigned as starter (#1) in more than one position.
 */
export function validateNoDuplicateStarters(starters: Record<number, PlayerEntry>): {
  valid: boolean;
  duplicates: string[];
} {
  const seen = new Map<string, number[]>();
  Object.entries(starters).forEach(([posStr, player]) => {
    const pos = Number(posStr);
    // Ignore vacant placeholders
    if (player.id.startsWith('vacant-') || player.rating === 0) return;
    const name = player.name.toLowerCase().trim();
    const existing = seen.get(name) ?? [];
    seen.set(name, [...existing, pos]);
  });

  const duplicates: string[] = [];
  seen.forEach((positions, name) => {
    if (positions.length > 1) {
      duplicates.push(name);
    }
  });

  return {
    valid: duplicates.length === 0,
    duplicates,
  };
}

/**
 * Scans raw position ladders to detect players who are currently the highest-rated in >1 position.
 */
export function detectStarterConflicts(
  playersByPos: Record<number, PlayerEntry[]>,
  positions: Position[],
  currentAssignments: Record<string, number> = {}
): StarterConflict[] {
  const topRatedMap = new Map<string, Array<{ posId: number; posName: string; rating: number; isPrimary: boolean }>>();

  positions.forEach(pos => {
    const list = (playersByPos[pos.id] ?? []).filter(p => p.status === 'active');
    if (list.length > 0) {
      const top = list[0]!;
      const cleanName = top.name.toLowerCase().trim();
      const existing = topRatedMap.get(cleanName) ?? [];
      topRatedMap.set(cleanName, [
        ...existing,
        {
          posId: pos.id,
          posName: pos.name,
          rating: top.rating,
          isPrimary: !top.secondary,
        },
      ]);
    }
  });

  const conflicts: StarterConflict[] = [];

  topRatedMap.forEach((matchedPositions, cleanName) => {
    if (matchedPositions.length > 1) {
      // Find original player capitalization
      const originalPlayer = (playersByPos[matchedPositions[0]!.posId] ?? []).find(
        p => p.name.toLowerCase().trim() === cleanName
      );
      const displayName = originalPlayer ? originalPlayer.name : cleanName;

      // Default assigned position: primary position first, or manual assignment, or highest rating
      const manual = currentAssignments[displayName] ?? currentAssignments[cleanName];
      const primaryPos = matchedPositions.find(p => p.isPrimary)?.posId;
      const highestRatingPos = [...matchedPositions].sort((a, b) => b.rating - a.rating)[0]!.posId;

      const currentAssignedPos = manual ?? primaryPos ?? highestRatingPos;

      conflicts.push({
        playerName: displayName,
        positions: matchedPositions,
        currentAssignedPos,
      });
    }
  });

  return conflicts;
}

/**
 * Calculates the opportunity cost and backup drop-off gap for each position option for a conflicting player.
 */
export function calculateSelectionTradeoffs(
  conflict: StarterConflict,
  playersByPos: Record<number, PlayerEntry[]>,
  positions: Position[],
  currentAssignments: Record<string, number> = {}
): TacticalTradeoff {
  const posMap = new Map(positions.map(p => [p.id, p]));
  const options: TacticalOption[] = [];

  // For each position the player could start in
  conflict.positions.forEach(primaryOpt => {
    const posP = primaryOpt.posId;
    const posPName = posMap.get(posP)?.name ?? `Position ${posP}`;
    const playerRatingAtP = primaryOpt.rating;

    // Evaluate what happens at the other positions in the conflict
    conflict.positions.forEach(altOpt => {
      if (altOpt.posId === posP) return;

      const posQ = altOpt.posId;
      const posQName = posMap.get(posQ)?.name ?? `Position ${posQ}`;

      // Find the backup who starts at Q if this player is starting at P
      // Must exclude conflict.playerName AND any player already assigned to start elsewhere
      const qList = (playersByPos[posQ] ?? []).filter(p => {
        if (p.status !== 'active') return false;
        const cleanPName = p.name.toLowerCase().trim();
        if (cleanPName === conflict.playerName.toLowerCase().trim()) return false;
        const assignedPos = currentAssignments[p.name] ?? currentAssignments[cleanPName] ?? currentAssignments[p.id];
        if (assignedPos !== undefined && assignedPos !== posQ) {
          return false; // Starts in another position!
        }
        return true;
      });
      const backupStarter = qList[0];
      const backupStarterName = backupStarter ? backupStarter.name : 'Unassigned';
      const backupStarterRating = backupStarter ? backupStarter.rating : 50;

      const backupDropoff = altOpt.rating - backupStarterRating;
      const combinedScore = playerRatingAtP + backupStarterRating;

      const summary = `Play ${conflict.playerName} at ${posP} (${playerRatingAtP}) → ${backupStarterName} starts at ${posQ} (${backupStarterRating}). Combined: ${combinedScore}.`;

      options.push({
        assignedPos: posP,
        posName: posPName,
        playerRatingAtPos: playerRatingAtP,
        alternativePos: posQ,
        alternativePosName: posQName,
        backupStarterName,
        backupStarterRating,
        backupDropoff,
        combinedScore,
        summary,
      });
    });
  });

  // Group by assignedPos and compute combined score sum across all paired options
  const scoreByAssignedPos = new Map<number, number>();
  options.forEach(opt => {
    const prev = scoreByAssignedPos.get(opt.assignedPos) ?? 0;
    scoreByAssignedPos.set(opt.assignedPos, prev + opt.combinedScore);
  });

  let bestOptionPos = conflict.currentAssignedPos;
  let highestScore = -1;
  scoreByAssignedPos.forEach((score, posId) => {
    if (score > highestScore) {
      highestScore = score;
      bestOptionPos = posId;
    }
  });

  const lowestScore = Math.min(...Array.from(scoreByAssignedPos.values()));
  const netDelta = highestScore > 0 ? highestScore - lowestScore : 0;

  const bestOpt = options.find(o => o.assignedPos === bestOptionPos);
  const bestPosName = posMap.get(bestOptionPos)?.name ?? `Position ${bestOptionPos}`;

  const explanation = bestOpt
    ? `Tactical recommendation: Starting ${conflict.playerName} at ${bestPosName} yields a combined rating of ${bestOpt.combinedScore} (+${netDelta} pts net) because the backup drop-off at ${bestOpt.alternativePosName} to ${bestOpt.backupStarterName} (${bestOpt.backupStarterRating}) is well-mitigated.`
    : `Tactical trade-off analysis between positions for ${conflict.playerName}.`;

  return {
    playerName: conflict.playerName,
    options,
    bestOptionPos,
    netDelta,
    explanation,
  };
}

/**
 * Resolves the 15-position squad depth ladders so that:
 * 1. Every position has exactly ONE unique starter at #1.
 * 2. Multi-position players who start elsewhere rank as cover in their secondary positions with `startsAtOtherPos` set.
 * 3. Stale manual starter assignments pointing to retired/inactive players are safely ignored and reported.
 * 4. Positions where all candidates are assigned elsewhere are explicitly flagged as unresolved/vacant.
 * 5. Returns the resulting Starters, Adjusted Ladders, and Tactical Tradeoffs with honest count & average.
 */
export function resolveStartingXV(
  playersByPos: Record<number, PlayerEntry[]>,
  positions: Position[],
  manualAssignments: Record<string, number> = {}
): ResolvedSquadSelection {
  // Index all active players to guard against ghost/retired starter assignments
  const activePlayersByName = new Map<string, PlayerEntry>();
  const activePlayersById = new Map<string, PlayerEntry>();

  positions.forEach(pos => {
    (playersByPos[pos.id] ?? []).forEach(p => {
      if (p.status === 'active') {
        activePlayersByName.set(p.name.toLowerCase().trim(), p);
        activePlayersById.set(p.id, p);
      }
    });
  });

  // Filter and sanitize manual assignments: only active players are accepted!
  const playerAssignedStarters = new Map<string, number>();
  const ignoredAssignments: string[] = [];

  Object.entries(manualAssignments).forEach(([key, posId]) => {
    const clean = key.toLowerCase().trim();
    const player = activePlayersById.get(key) ?? activePlayersByName.get(clean);
    if (player && player.status === 'active') {
      playerAssignedStarters.set(player.name.toLowerCase().trim(), posId);
      playerAssignedStarters.set(player.id, posId);
    } else {
      ignoredAssignments.push(key);
    }
  });

  // 1. Detect conflicts among active players
  const conflicts = detectStarterConflicts(playersByPos, positions, manualAssignments);

  // 2. Compute tradeoffs for each conflict
  const tradeoffs = conflicts.map(c => calculateSelectionTradeoffs(c, playersByPos, positions, manualAssignments));

  // 3. Resolve any unassigned conflicting players
  conflicts.forEach(c => {
    const clean = c.playerName.toLowerCase().trim();
    if (!playerAssignedStarters.has(clean)) {
      const tradeoff = tradeoffs.find(t => t.playerName.toLowerCase().trim() === clean);
      const finalPos = tradeoff?.bestOptionPos ?? c.currentAssignedPos;
      playerAssignedStarters.set(clean, finalPos);
    }
  });

  // 4. Construct Adjusted Ladders and Starting XV
  const adjustedLadders: Record<number, PlayerEntry[]> = {};
  const starters: Record<number, PlayerEntry> = {};
  const unresolvedPositions: number[] = [];

  positions.forEach(pos => {
    const list = [...(playersByPos[pos.id] ?? [])].filter(p => p.status === 'active');

    // Partition players into:
    // a) Eligible to start at this pos (not assigned as starter elsewhere)
    // b) Assigned as starter in another position
    const eligibleToStart: PlayerEntry[] = [];
    const startsElsewhere: PlayerEntry[] = [];

    list.forEach(player => {
      const cleanName = player.name.toLowerCase().trim();
      const assignedStarterPos = playerAssignedStarters.get(player.id) ?? playerAssignedStarters.get(cleanName);

      if (assignedStarterPos && assignedStarterPos !== pos.id) {
        // Starts in another position! Cannot be #1 here.
        startsElsewhere.push({
          ...player,
          startsAtOtherPos: assignedStarterPos,
        });
      } else {
        eligibleToStart.push({
          ...player,
          startsAtOtherPos: undefined,
        });
      }
    });

    // The starter is the top eligible player in the incoming ladder order
    const starter = eligibleToStart[0];
    if (starter) {
      starters[pos.id] = starter;
    } else {
      // Vacated shirt! Explicitly mark as unassigned/vacant
      unresolvedPositions.push(pos.id);
      starters[pos.id] = {
        id: `vacant-${pos.id}`,
        name: 'Unassigned / Vacant',
        pos: pos.id,
        rating: 0,
        secondary: false,
        status: 'ineligible',
        lastReviewed: 'Unresolved',
      };
    }

    // Combine ladder: starter first, then remaining eligible players and cover players in order
    const remainingEligible = eligibleToStart.slice(1);
    adjustedLadders[pos.id] = starter
      ? [starter, ...remainingEligible, ...startsElsewhere]
      : [...remainingEligible, ...startsElsewhere];
  });

  // Calculate Starting XV average rating strictly over resolved active starters
  const resolvedStarters = Object.values(starters).filter(s => s.rating > 0 && s.status === 'active');
  const resolvedStarterCount = resolvedStarters.length;
  const startingXVAverageRating = resolvedStarterCount > 0
    ? Math.round(resolvedStarters.reduce((sum, p) => sum + p.rating, 0) / resolvedStarterCount)
    : 0;

  return {
    starters,
    adjustedLadders,
    conflicts,
    tradeoffs,
    startingXVAverageRating,
    unresolvedPositions,
    resolvedStarterCount,
    ignoredAssignments,
    totalPositions: positions.length,
  };
}
