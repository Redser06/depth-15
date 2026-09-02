import React, { useState } from 'react';
import { Position, PlayerEntry } from '../../types/depth';
import { calculateDepthScore, getDepthBand } from '../../lib/depthCalc';
import { TacticalUnitDepth } from './tacticalFormation';
import { SquadRadarView } from './SquadRadarView';
import { TrendingDown, ShieldAlert, BarChart3, PieChart, Layers, ArrowUpRight, Activity } from 'lucide-react';

interface AnalystChartsViewProps {
  positions: Position[];
  playersByPos: Record<number, PlayerEntry[]>;
  onSelectPosition: (posId: number) => void;
}

export const AnalystChartsView: React.FC<AnalystChartsViewProps> = ({
  positions,
  playersByPos,
  onSelectPosition,
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'cliff' | 'units' | 'tiers'>('radar');

  // 1. Calculate cliff-edge data across all 15 positions
  const cliffData = positions.map((pos) => {
    const list = playersByPos[pos.id] ?? [];
    const p1 = list[0];
    const p2 = list[1];
    const p3 = list[2];

    const r1 = p1 ? p1.rating : 50;
    const r2 = p2 ? p2.rating : 50;
    const r3 = p3 ? p3.rating : 50;

    const dropoff1to2 = r1 - r2;
    const dropoff2to3 = r2 - r3;
    const totalDropoff = r1 - r3;
    const depth = calculateDepthScore(list);
    const band = getDepthBand(depth);

    return {
      pos,
      p1,
      p2,
      p3,
      r1,
      r2,
      r3,
      dropoff1to2,
      dropoff2to3,
      totalDropoff,
      depth,
      band,
      isSevereCliff: dropoff1to2 >= 8,
    };
  });

  // Sort cliff data by severity of #1 to #2 drop-off descending
  const sortedCliffs = [...cliffData].sort((a, b) => b.dropoff1to2 - a.dropoff1to2);

  // 2. Unit depth aggregation
  const unitGroups: Record<string, number[]> = {
    'Front Row (1, 2, 3)': [1, 2, 3],
    'Second Row (4, 5)': [4, 5],
    'Back Row (6, 7, 8)': [6, 7, 8],
    'Half-Backs (9, 10)': [9, 10],
    'Midfield (12, 13)': [12, 13],
    'Back Three (11, 14, 15)': [11, 14, 15],
  };

  const unitSummaries: TacticalUnitDepth[] = Object.entries(unitGroups).map(([unitName, posIds]) => {
    const unitPositions = positions.filter((p) => posIds.includes(p.id));
    const depths = unitPositions.map((p) => calculateDepthScore(playersByPos[p.id] ?? []));
    const starterRatings = unitPositions.map((p) => playersByPos[p.id]?.[0]?.rating ?? 50);
    const backupRatings = unitPositions.map((p) => playersByPos[p.id]?.[1]?.rating ?? 50);
    const dropoffs = starterRatings.map((s, idx) => s - (backupRatings[idx] ?? 50));
    const vulnerableCount = depths.filter((d) => d < 70).length;

    return {
      unitName,
      positions: unitPositions,
      avgDepthScore: Math.round(depths.reduce((a, b) => a + b, 0) / depths.length),
      starterAvgRating: Math.round(starterRatings.reduce((a, b) => a + b, 0) / starterRatings.length),
      backupAvgRating: Math.round(backupRatings.reduce((a, b) => a + b, 0) / backupRatings.length),
      avgDropoff: Math.round(dropoffs.reduce((a, b) => a + b, 0) / dropoffs.length),
      vulnerableCount,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#0F1E36] text-white text-xs font-mono font-bold">
              PRO ANALYST
            </span>
            <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white">
              Positional Depth &amp; Cliff-Edge Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Exposing squad fragility cliffs, replacement drop-offs, and tactical unit durability.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'radar'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#0D6938] dark:text-emerald-400" />
            <span>Squad Radar</span>
          </button>
          <button
            onClick={() => setActiveTab('cliff')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'cliff'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
            <span>Drop-Off Cliffs</span>
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'units'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tactical Units</span>
          </button>
          <button
            onClick={() => setActiveTab('tiers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'tiers'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Tier Distribution</span>
          </button>
        </div>
      </div>

      {/* TAB 0: SQUAD STRENGTH RADAR GRAPH */}
      {activeTab === 'radar' && (
        <div className="animate-in fade-in duration-150">
          <SquadRadarView
            positions={positions}
            playersByPos={playersByPos}
            onSelectPosition={onSelectPosition}
          />
        </div>
      )}

      {/* TAB 1: DROP-OFF CLIFF CHART */}
      {activeTab === 'cliff' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  Highest Cliff-Edge
                </span>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {sortedCliffs[0]?.pos.name} (-{sortedCliffs[0]?.dropoff1to2} pts)
                </p>
                <p className="text-[10px] text-slate-500">
                  {sortedCliffs[0]?.p1?.name} ({sortedCliffs[0]?.r1}) → {sortedCliffs[0]?.p2?.name} ({sortedCliffs[0]?.r2})
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0D6938] text-white flex items-center justify-center font-bold shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                  Most Resilient Succession
                </span>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {sortedCliffs[sortedCliffs.length - 1]?.pos.name} (-{sortedCliffs[sortedCliffs.length - 1]?.dropoff1to2} pts)
                </p>
                <p className="text-[10px] text-slate-500">
                  {sortedCliffs[sortedCliffs.length - 1]?.p1?.name} ({sortedCliffs[sortedCliffs.length - 1]?.r1}) → {sortedCliffs[sortedCliffs.length - 1]?.p2?.name} ({sortedCliffs[sortedCliffs.length - 1]?.r2})
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Squad Average Gap
                </span>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {Math.round(sortedCliffs.reduce((sum, c) => sum + c.dropoff1to2, 0) / 15)} Points
                </p>
                <p className="text-[10px] text-slate-500">
                  Average drop from starter to primary backup
                </p>
              </div>
            </div>
          </div>

          {/* 15 Positions Drop-off Waterfall Chart */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Positional Succession Drop-Off: Starter (#1) vs Backup (#2) vs 3rd Choice (#3)
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Sorted by Cliff Severity
              </span>
            </div>

            <div className="space-y-3">
              {sortedCliffs.map((item) => {
                const isWarning = item.dropoff1to2 >= 8;

                return (
                  <div
                    key={item.pos.id}
                    onClick={() => onSelectPosition(item.pos.id)}
                    className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-800/80 transition cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#0F1E36] text-white font-mono font-bold text-xs flex items-center justify-center">
                          {item.pos.num}
                        </span>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-[#0D6938] dark:group-hover:text-emerald-400 transition flex items-center gap-1">
                          {item.pos.name}
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                        </span>
                        <span className="text-xs text-slate-400 font-mono">({item.pos.abbr})</span>
                        {isWarning && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800">
                            Fragile Cliff
                          </span>
                        )}
                      </div>

                      {/* Drop-off metric badges */}
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-slate-500 font-sans">Gap to #2:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-md ${
                          isWarning ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          -{item.dropoff1to2} pts
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 font-sans">Depth:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {item.depth}
                        </span>
                      </div>
                    </div>

                    {/* Multi-tier Bar Visualizer */}
                    <div className="space-y-1.5">
                      {/* Bar 1: Starter */}
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-[10px] font-bold text-slate-500 truncate text-right">
                          #1 {item.p1?.name.split(' ').pop()}
                        </span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-4 rounded-md overflow-hidden relative">
                          <div
                            className="h-full bg-[#0D6938] dark:bg-emerald-500 rounded-md transition-all flex items-center justify-end pr-1.5"
                            style={{ width: `${item.r1}%` }}
                          >
                            <span className="text-[10px] font-mono font-bold text-white leading-none">
                              {item.r1}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bar 2: Backup */}
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-[10px] font-medium text-slate-400 truncate text-right">
                          #2 {item.p2 ? item.p2.name.split(' ').pop() : 'None'}
                        </span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-3 rounded-md overflow-hidden relative">
                          <div
                            className={`h-full rounded-md transition-all flex items-center justify-end pr-1.5 ${
                              isWarning ? 'bg-amber-500' : 'bg-slate-600 dark:bg-slate-400'
                            }`}
                            style={{ width: `${item.r2}%` }}
                          >
                            <span className="text-[9px] font-mono font-bold text-white leading-none">
                              {item.r2}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bar 3: Third Choice */}
                      {item.p3 && (
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-[10px] font-medium text-slate-400 truncate text-right">
                            #3 {item.p3.name.split(' ').pop()}
                          </span>
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-md overflow-hidden relative">
                            <div
                              className="h-full bg-slate-400 dark:bg-slate-600 rounded-md transition-all"
                              style={{ width: `${item.r3}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TACTICAL UNITS SUMMARY */}
      {activeTab === 'units' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-150">
          {unitSummaries.map((unit) => {
            const band = getDepthBand(unit.avgDepthScore);

            return (
              <div
                key={unit.unitName}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Unit Analysis
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      {unit.unitName}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end">
                    <span
                      className="px-2.5 py-0.5 rounded-lg text-sm font-black font-mono text-white"
                      style={{ backgroundColor: band.color }}
                    >
                      {unit.avgDepthScore}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                      {band.label}
                    </span>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850">
                    <span className="text-[10px] text-slate-400 block">Starter Avg</span>
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {unit.starterAvgRating}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850">
                    <span className="text-[10px] text-slate-400 block">Backup Avg</span>
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {unit.backupAvgRating}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850">
                    <span className="text-[10px] text-slate-400 block">Avg Drop</span>
                    <span className="font-mono font-black text-sm text-amber-600 dark:text-amber-400">
                      -{unit.avgDropoff}
                    </span>
                  </div>
                </div>

                {/* Position links in unit */}
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {unit.positions.map((p) => {
                    const depth = calculateDepthScore(playersByPos[p.id] ?? []);
                    const pBand = getDepthBand(depth);
                    const starter = playersByPos[p.id]?.[0];

                    return (
                      <button
                        key={p.id}
                        onClick={() => onSelectPosition(p.id)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-xs transition text-left"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono font-bold text-slate-400">{p.num}.</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">
                            ({starter?.name.split(' ').pop()})
                          </span>
                        </div>
                        <span
                          className="font-mono font-bold text-[11px]"
                          style={{ color: pBand.color }}
                        >
                          {depth}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: TIER DISTRIBUTION */}
      {activeTab === 'tiers' && (
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              International Player Tier Breakdown Across All Contenders
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Categorizing all active contenders by readiness tier
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* World Class 90+ */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#0D6938] dark:text-emerald-400">
                  World Class (90+)
                </span>
                <span className="w-6 h-6 rounded-full bg-[#0D6938] text-white font-mono font-bold text-xs flex items-center justify-center">
                  {positions.reduce((sum, p) => sum + (playersByPos[p.id] ?? []).filter(pl => pl.rating >= 90).length, 0)}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Lions test starters &amp; World Rugby player of year calibre.
              </p>
            </div>

            {/* International 80-89 */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-blue-800 dark:text-blue-300">
                  International (80–89)
                </span>
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-mono font-bold text-xs flex items-center justify-center">
                  {positions.reduce((sum, p) => sum + (playersByPos[p.id] ?? []).filter(pl => pl.rating >= 80 && pl.rating < 90).length, 0)}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Regular test matchday 23 &amp; Champions Cup starters.
              </p>
            </div>

            {/* Squad 70-79 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Squad (70–79)
                </span>
                <span className="w-6 h-6 rounded-full bg-slate-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                  {positions.reduce((sum, p) => sum + (playersByPos[p.id] ?? []).filter(pl => pl.rating >= 70 && pl.rating < 80).length, 0)}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                URC starters &amp; national training squad depth.
              </p>
            </div>

            {/* Emerging / Fringe <70 */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Emerging (&lt;70)
                </span>
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                  {positions.reduce((sum, p) => sum + (playersByPos[p.id] ?? []).filter(pl => pl.rating < 70).length, 0)}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                U20 standouts &amp; development provincial players.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
