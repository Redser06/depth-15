import React from 'react';
import { Position, PlayerEntry } from '../../types/depth';
import { calculateDepthScore, getDepthBand } from '../../lib/depthCalc';
import { Shield, Sparkles } from 'lucide-react';

interface OverviewGridProps {
  positions: Position[];
  playersByPos: Record<number, PlayerEntry[]>;
  onSelectPosition: (posId: number) => void;
}

export const OverviewGrid: React.FC<OverviewGridProps> = ({
  positions,
  playersByPos,
  onSelectPosition,
}) => {
  const forwards = positions.filter((p) => p.group === 'Forwards');
  const backs = positions.filter((p) => p.group === 'Backs');

  // Squad metrics
  const scores = positions.map((p) => calculateDepthScore(playersByPos[p.id] ?? []));
  const avgDepth = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));
  const avgBand = getDepthBand(avgDepth);

  const minDepthScore = Math.min(...scores);
  const mostVulnerablePos = positions.find(
    (p) => calculateDepthScore(playersByPos[p.id] ?? []) === minDepthScore
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Overall Squad Depth
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className="text-2xl font-extrabold font-mono"
              style={{ color: avgBand.color }}
            >
              {avgDepth}
            </span>
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: avgBand.color }}
            >
              {avgBand.label}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Total Rated Contenders
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {Object.values(playersByPos).reduce((sum, list) => sum + list.length, 0)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              across 15 ladders
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Thinnest Position
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-extrabold text-red-600 dark:text-red-400 truncate">
              {mostVulnerablePos?.name} ({minDepthScore})
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Consensus Engine
          </div>
          <div className="flex items-baseline gap-1 mt-1 text-xs font-semibold text-[#0D6938] dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 text-[#0D6938]" />
            <span>Median-of-Counters</span>
          </div>
        </div>
      </div>

      {/* Forwards Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#0D6938]" />
            <span>Pack / Forwards (1–8)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">8 Positions</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {forwards.map((pos) => {
            const list = playersByPos[pos.id] ?? [];
            const depth = calculateDepthScore(list);
            const band = getDepthBand(depth);
            const starter = list[0];
            const cover = list[1];

            return (
              <button
                key={pos.id}
                onClick={() => onSelectPosition(pos.id)}
                className="p-3 text-left rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-600 hover:shadow-sm transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-md bg-[#0F1E36] dark:bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                      {pos.num}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      {pos.abbr}
                    </span>
                  </div>
                  <span
                    className="px-1.5 py-0.5 rounded text-xs font-mono font-bold text-white shadow-xs"
                    style={{ backgroundColor: band.color }}
                  >
                    {depth}
                  </span>
                </div>

                <div className="mt-2 text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#0D6938] dark:group-hover:text-emerald-400 transition">
                  {pos.name}
                </div>

                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    1. {starter?.name ?? '—'}
                  </span>
                  {starter && <span className="font-mono ml-1">({starter.rating})</span>}
                </div>
                {cover && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    2. {cover.name} ({cover.rating})
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Backs Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="text-base">⚡</span>
            <span>Backs Division (9–15)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">7 Positions</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {backs.map((pos) => {
            const list = playersByPos[pos.id] ?? [];
            const depth = calculateDepthScore(list);
            const band = getDepthBand(depth);
            const starter = list[0];
            const cover = list[1];

            return (
              <button
                key={pos.id}
                onClick={() => onSelectPosition(pos.id)}
                className="p-3 text-left rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-600 hover:shadow-sm transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-md bg-[#0F1E36] dark:bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                      {pos.num}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      {pos.abbr}
                    </span>
                  </div>
                  <span
                    className="px-1.5 py-0.5 rounded text-xs font-mono font-bold text-white shadow-xs"
                    style={{ backgroundColor: band.color }}
                  >
                    {depth}
                  </span>
                </div>

                <div className="mt-2 text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#0D6938] dark:group-hover:text-emerald-400 transition">
                  {pos.name}
                </div>

                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    1. {starter?.name ?? '—'}
                  </span>
                  {starter && <span className="font-mono ml-1">({starter.rating})</span>}
                </div>
                {cover && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    2. {cover.name} ({cover.rating})
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
