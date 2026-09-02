import React from 'react';
import { PlayerEntry, Position, Proposal } from '../../types/depth';
import { getMostContested } from '../../lib/consensusEngine';
import { PlayerRow } from '../chart/PlayerRow';
import { AlertTriangle, MessageSquare } from 'lucide-react';

interface ContestedViewProps {
  players: PlayerEntry[];
  positions: Position[];
  onChallengePlayer: (player: PlayerEntry) => void;
  openProposals: Proposal[];
  onViewProposal: (prop: Proposal) => void;
}

export const ContestedView: React.FC<ContestedViewProps> = ({
  players,
  positions,
  onChallengePlayer,
  openProposals,
  onViewProposal,
}) => {
  const contestedList = getMostContested(players, 10);
  const posMap = new Map(positions.map((p) => [p.id, p]));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              The Contested Table
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              The ten most-argued ratings across Irish rugby supporters, sorted by consensus spread and live challenges. The front page of the pub debate.
            </p>
          </div>
        </div>
      </div>

      {/* Contested Table List */}
      <div className="space-y-3">
        {contestedList.map((player, idx) => {
          const pos = posMap.get(player.pos);
          const liveProp = openProposals.find(
            (p) => p.pos === player.pos && p.targetPlayerName.toLowerCase() === player.name.toLowerCase()
          );

          return (
            <div
              key={player.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                    Pos {pos?.num} · {pos?.name} ({pos?.abbr})
                  </span>
                </div>

                {liveProp ? (
                  <button
                    onClick={() => onViewProposal(liveProp)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold hover:underline"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Live Dispute Open</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                    Consensus Split
                  </span>
                )}
              </div>

              <PlayerRow
                player={player}
                rank={idx + 1}
                onChallenge={onChallengePlayer}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
