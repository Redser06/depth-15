import React from 'react';
import { PlayerEntry, Position, Snapshot } from '../../types/depth';
import { calculateMovers } from '../../lib/consensusEngine';
import { getRatingTier } from '../../lib/depthCalc';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MoversViewProps {
  currentPlayers: PlayerEntry[];
  snapshots: Snapshot[];
  positions: Position[];
  onChallengePlayer: (player: PlayerEntry) => void;
}

export const MoversView: React.FC<MoversViewProps> = ({
  currentPlayers,
  snapshots,
  positions,
  onChallengePlayer,
}) => {
  const baseline = snapshots[snapshots.length - 1]?.players ?? [];
  const movers = calculateMovers(currentPlayers, baseline);
  const posMap = new Map(positions.map((p) => [p.id, p]));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0D6938] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Squad Movers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tracking the biggest consensus rating deltas since the 2025 baseline season snapshot.
            </p>
          </div>
        </div>
      </div>

      {movers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          No rating deltas yet! Propose changes or vote on open debates to move players up or down.
        </div>
      ) : (
        <div className="space-y-2.5">
          {movers.map(({ player, delta, baselineRating }) => {
            const pos = posMap.get(player.pos);
            const isRise = delta > 0;
            const { tier } = getRatingTier(player.rating);

            return (
              <div
                key={player.id}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isRise
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {isRise ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {player.name}
                      </h4>
                      <span className="text-xs text-slate-400 font-mono">
                        · Pos {pos?.num} ({pos?.abbr})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Baseline: {baselineRating} → Current Consensus: <strong>{player.rating}</strong> ({tier})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-base font-mono font-black ${
                      isRise ? 'text-[#0D6938] dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isRise ? `+${delta}` : delta}
                  </span>

                  <button
                    onClick={() => onChallengePlayer(player)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
                  >
                    Challenge
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
