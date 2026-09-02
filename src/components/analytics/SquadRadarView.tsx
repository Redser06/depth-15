import React, { useState } from 'react';
import { Position, PlayerEntry } from '../../types/depth';
import { calculateDepthScore, getDepthBand } from '../../lib/depthCalc';
import { ChevronRight, Activity, Sparkles, AlertTriangle } from 'lucide-react';

export interface SquadAspect {
  id: string;
  name: string;
  shortName: string;
  posIds: number[];
  description: string;
  benchmarkTrait: string;
}

export const SQUAD_TACTICAL_ASPECTS: SquadAspect[] = [
  {
    id: 'scrum',
    name: 'Scrum & Prop Anchor',
    shortName: 'Props / Scrum',
    posIds: [1, 3],
    description: 'Set-piece scrummaging foundation, tight carrying, and front-row anchor power.',
    benchmarkTrait: 'Porter & Bealham set-piece core',
  },
  {
    id: 'hooking',
    name: 'Hooking & Lineout Throw',
    shortName: 'Hooker / Throw',
    posIds: [2],
    description: 'Lineout throw darts accuracy, dynamic ruck arrivals, and explosive rolling maul execution.',
    benchmarkTrait: 'Dan Sheehan world-class strike',
  },
  {
    id: 'locks',
    name: 'Second Row Engine & Aerial',
    shortName: 'Second Row Engine',
    posIds: [4, 5],
    description: 'Lineout jumping authority, maul defence, ruck disruption, and engine-room ballast.',
    benchmarkTrait: 'Beirne turnover menace & Ryan ballast',
  },
  {
    id: 'backrow',
    name: 'Back Row Breakdown & Collision',
    shortName: 'Back Row Breakdown',
    posIds: [6, 7, 8],
    description: 'Jackal turnover threat, collision impact, gainline punching, and breakdown speed.',
    benchmarkTrait: 'Doris & Van der Flier engine',
  },
  {
    id: 'halves',
    name: 'Half-Back Tactical Direction',
    shortName: 'Half-Backs Tempo',
    posIds: [9, 10],
    description: 'Rapid distribution cadence, kicking territory control, game management, and exit clarity.',
    benchmarkTrait: 'JGP lightning tempo & Crowley/Sam',
  },
  {
    id: 'midfield',
    name: 'Midfield Defence & Blitz Channel',
    shortName: 'Midfield Channel',
    posIds: [12, 13],
    description: '13-channel blitz containment, crash gainline punching, and dual-playmaker distribution.',
    benchmarkTrait: 'Aki power & Ringrose read',
  },
  {
    id: 'backthree',
    name: 'Back Three Aerial & Strike',
    shortName: 'Back Three Aerial',
    posIds: [11, 14, 15],
    description: 'High-ball security under contestables, pendulum backfield sweep, counter-attack velocity.',
    benchmarkTrait: 'Keenan sweeping & Lowe left boot',
  },
];

export interface CalculatedAspect {
  aspect: SquadAspect;
  positions: Position[];
  starters: PlayerEntry[];
  backups: PlayerEntry[];
  starterAvg: number | null;
  depthAvg: number | null;
  overallScore: number | null;
  hasData: boolean;
  isVulnerable: boolean;
  angleRad: number;
  x: number;
  y: number;
}

interface SquadRadarViewProps {
  positions: Position[];
  playersByPos: Record<number, PlayerEntry[]>;
  onSelectPosition?: (posId: number) => void;
}

export const SquadRadarView: React.FC<SquadRadarViewProps> = ({
  positions,
  playersByPos,
  onSelectPosition,
}) => {
  const [hoveredAspectId, setHoveredAspectId] = useState<string | null>(null);
  const [selectedAspectId, setSelectedAspectId] = useState<string>('halves');

  const CX = 260;
  const CY = 245;
  const MAX_RADIUS = 160;
  const N = SQUAD_TACTICAL_ASPECTS.length;

  // Calculate scores for each aspect honestly — no fabricated 50s!
  const calculatedAspects: CalculatedAspect[] = SQUAD_TACTICAL_ASPECTS.map((aspect, idx) => {
    const unitPositions = positions.filter((p) => aspect.posIds.includes(p.id));
    const allContenders = unitPositions.flatMap((p) => playersByPos[p.id] ?? []);
    const activeContenders = allContenders.filter((p) => p.status === 'active');
    const hasData = activeContenders.length > 0;

    const starters = unitPositions
      .map((p) => playersByPos[p.id]?.find((pl) => pl.status === 'active'))
      .filter((p): p is PlayerEntry => Boolean(p));

    const backups = unitPositions
      .map((p) => {
        const activeList = (playersByPos[p.id] ?? []).filter((pl) => pl.status === 'active');
        return activeList[1];
      })
      .filter((p): p is PlayerEntry => Boolean(p));

    const depths = unitPositions
      .map((p) => {
        const activeList = (playersByPos[p.id] ?? []).filter((pl) => pl.status === 'active');
        return activeList.length > 0 ? calculateDepthScore(activeList) : null;
      })
      .filter((d): d is number => d !== null);

    const starterRatings = starters.map((s) => s.rating);

    const starterAvg = starterRatings.length > 0
      ? Math.round(starterRatings.reduce((a, b) => a + b, 0) / starterRatings.length)
      : null;

    const depthAvg = depths.length > 0
      ? Math.round(depths.reduce((a, b) => a + b, 0) / depths.length)
      : null;

    // Overall aspect score: 60% starter class + 40% squad depth resilience
    // If no active players exist in this unit, overallScore is strictly NULL — never fabricated 50
    const overallScore = starterAvg !== null && depthAvg !== null
      ? Math.round(starterAvg * 0.6 + depthAvg * 0.4)
      : (starterAvg ?? depthAvg ?? null);

    const isVulnerable = !hasData || (depthAvg !== null && depthAvg < 70) || (overallScore !== null && overallScore < 75);

    // Angle on the radar circle (starting from top, clockwise)
    const angleRad = -Math.PI / 2 + (idx * 2 * Math.PI) / N;
    const r = overallScore !== null ? (Math.max(20, Math.min(100, overallScore)) / 100) * MAX_RADIUS : 0;
    const x = CX + r * Math.cos(angleRad);
    const y = CY + r * Math.sin(angleRad);

    return {
      aspect,
      positions: unitPositions,
      starters,
      backups,
      starterAvg,
      depthAvg,
      overallScore,
      hasData,
      isVulnerable,
      angleRad,
      x,
      y,
    };
  });

  // Measured aspects only (aspects with genuine player data)
  const measuredAspects = calculatedAspects.filter((item) => item.hasData && item.overallScore !== null);
  const totalUnits = calculatedAspects.length;
  const measuredCount = measuredAspects.length;

  // Calculate polygon points only from measured vertices
  const polygonPoints = measuredAspects
    .map((item) => `${item.x.toFixed(1)},${item.y.toFixed(1)}`)
    .join(' ');

  // Grid levels (50, 70, 80, 90, 100)
  const gridLevels = [50, 70, 80, 90, 100];

  // Headline metrics: Strictly computed over measured units only with denominator stated
  const teamOverallScore = measuredCount > 0
    ? Math.round(measuredAspects.reduce((sum, item) => sum + item.overallScore!, 0) / measuredCount)
    : null;

  const highestAspect = measuredCount > 0
    ? [...measuredAspects].sort((a, b) => b.overallScore! - a.overallScore!)[0]!
    : null;

  const lowestAspect = measuredCount > 0
    ? [...measuredAspects].sort((a, b) => a.overallScore! - b.overallScore!)[0]!
    : null;

  const activeCalculatedAspect =
    calculatedAspects.find((a) => a.aspect.id === (hoveredAspectId || selectedAspectId)) ??
    calculatedAspects[0]!;

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-[#0D6938] text-white text-xs font-mono font-black uppercase tracking-wider">
              Consensus Team Profile
            </span>
            <span className="text-xs font-bold text-slate-400">
              7 Core Tactical Dimensions
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Squad Unit Strength Radar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Multi-dimensional spider radar balancing peak starting XV rating (60%) with squad succession depth resilience (40%).
          </p>
        </div>

        {/* Aggregate KPI chips with honest denominator disclosure */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0 flex-wrap">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-center min-w-[110px]">
            <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
              Overall Index
            </span>
            <div className="text-2xl font-mono font-black text-[#0D6938] dark:text-emerald-400">
              {teamOverallScore !== null ? teamOverallScore : '—'}
            </div>
            <span className="text-[9px] font-bold text-emerald-700/90 dark:text-emerald-400/90 block">
              {measuredCount === totalUnits
                ? '/ 100 Rating (All 7 Units)'
                : `${measuredCount}/${totalUnits} measured units`}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center min-w-[110px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Top Strength
            </span>
            <div className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
              {highestAspect ? highestAspect.aspect.shortName : '—'}
            </div>
            <span className="text-[10px] font-mono font-extrabold text-emerald-600 dark:text-emerald-400 block">
              {highestAspect ? `${highestAspect.overallScore}/100` : 'No data'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center min-w-[110px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Key Focus
            </span>
            <div className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
              {lowestAspect ? lowestAspect.aspect.shortName : '—'}
            </div>
            <span className="text-[10px] font-mono font-extrabold text-amber-600 dark:text-amber-400 block">
              {lowestAspect ? `${lowestAspect.overallScore}/100` : 'No data'}
            </span>
          </div>
        </div>
      </div>

      {/* Denominator Warning Alert if any unit is unmeasured */}
      {measuredCount < totalUnits && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-700/80 flex items-center gap-2.5 text-xs text-amber-950 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Data Disclosure:</strong> {totalUnits - measuredCount} tactical unit(s) currently have no active contenders assigned and are excluded from the team index (measured across {measuredCount} of {totalUnits} units).
          </span>
        </div>
      )}

      {/* Main Grid: Radar Chart + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Radar SVG Visualizer with responsive mobile padding */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
            <span className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Activity className="w-4 h-4 text-[#0D6938]" />
              Interactive Radar Map
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Tap any vertex to inspect
            </span>
          </div>

          <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
            {/* ViewBox has generous margin padding (-45 to 570) to prevent outer label collisions on small screens */}
            <svg
              viewBox="-45 -20 610 520"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full select-none overflow-visible"
            >
              <defs>
                {/* Emerald Radar Radial Glow */}
                <radialGradient id="radarEmeraldGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0D6938" stopOpacity="0.45" />
                  <stop offset="75%" stopColor="#16A34A" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity="0.05" />
                </radialGradient>
                <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Concentric Polygonal Web Grid Rings */}
              {gridLevels.map((lvl) => {
                const radius = (lvl / 100) * MAX_RADIUS;
                const points = Array.from({ length: N }, (_, i) => {
                  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N;
                  return `${(CX + radius * Math.cos(angle)).toFixed(1)},${(CY + radius * Math.sin(angle)).toFixed(1)}`;
                }).join(' ');

                return (
                  <g key={lvl}>
                    <polygon
                      points={points}
                      fill="none"
                      stroke={lvl === 80 ? '#10B981' : lvl === 100 ? '#64748B' : '#94A3B8'}
                      strokeWidth={lvl === 80 || lvl === 100 ? '1.5' : '1'}
                      strokeDasharray={lvl === 100 ? undefined : lvl === 80 ? '3,3' : '2,2'}
                      strokeOpacity={lvl === 80 ? '0.4' : '0.2'}
                    />
                    {/* Concentric Value Label on Vertical Axis */}
                    <text
                      x={CX + 4}
                      y={CY - radius + 10}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      className="fill-slate-400 select-none"
                    >
                      {lvl}
                    </text>
                  </g>
                );
              })}

              {/* Radial Spokes from Center to Outer Vertex */}
              {calculatedAspects.map((item) => {
                const outerX = CX + MAX_RADIUS * Math.cos(item.angleRad);
                const outerY = CY + MAX_RADIUS * Math.sin(item.angleRad);
                return (
                  <line
                    key={item.aspect.id}
                    x1={CX}
                    y1={CY}
                    x2={outerX}
                    y2={outerY}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeOpacity="0.25"
                  />
                );
              })}

              {/* Filled Consensus Team Polygon (only connects measured points) */}
              {measuredAspects.length >= 3 && (
                <polygon
                  points={polygonPoints}
                  fill="url(#radarEmeraldGlow)"
                  stroke="#10B981"
                  strokeWidth="3"
                  filter="url(#radarGlow)"
                  className="transition-all duration-300"
                />
              )}

              {/* Interactive Vertex Nodes & Labels */}
              {calculatedAspects.map((item) => {
                const isHovered = hoveredAspectId === item.aspect.id;
                const isSelected = selectedAspectId === item.aspect.id;
                const labelDist = MAX_RADIUS + 24;
                const lx = CX + labelDist * Math.cos(item.angleRad);
                const ly = CY + labelDist * Math.sin(item.angleRad);

                const textAnchor =
                  Math.abs(Math.cos(item.angleRad)) < 0.25
                    ? 'middle'
                    : Math.cos(item.angleRad) > 0
                    ? 'start'
                    : 'end';

                const outerX = CX + MAX_RADIUS * Math.cos(item.angleRad);
                const outerY = CY + MAX_RADIUS * Math.sin(item.angleRad);

                return (
                  <g
                    key={item.aspect.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedAspectId(item.aspect.id)}
                    onMouseEnter={() => setHoveredAspectId(item.aspect.id)}
                    onMouseLeave={() => setHoveredAspectId(null)}
                  >
                    {/* Vertex Data Node */}
                    {item.hasData && item.overallScore !== null ? (
                      <circle
                        cx={item.x}
                        cy={item.y}
                        r={isSelected || isHovered ? 8 : 5}
                        className={`transition-all duration-150 ${
                          isSelected || isHovered
                            ? 'fill-amber-400 stroke-white dark:stroke-slate-900 stroke-2'
                            : item.isVulnerable
                            ? 'fill-amber-500 stroke-slate-900 stroke-1'
                            : 'fill-[#0D6938] stroke-white stroke-1'
                        }`}
                      />
                    ) : (
                      /* Empty unit: Hollow dashed ring on perimeter spoke with horizontal slash */
                      <g>
                        <circle
                          cx={outerX}
                          cy={outerY}
                          r={isSelected || isHovered ? 8 : 6}
                          className="fill-slate-100 dark:fill-slate-800 stroke-amber-500 dark:stroke-amber-400 stroke-2"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1={outerX - 3}
                          y1={outerY}
                          x2={outerX + 3}
                          y2={outerY}
                          stroke="#f59e0b"
                          strokeWidth="2"
                        />
                      </g>
                    )}

                    {/* Touch / Click target buffer */}
                    <circle
                      cx={item.hasData && item.overallScore !== null ? item.x : outerX}
                      cy={item.hasData && item.overallScore !== null ? item.y : outerY}
                      r={16}
                      fill="transparent"
                      className="hover:stroke-amber-400/30 hover:stroke-4"
                    />

                    {/* Outer Spoke Label */}
                    <text
                      x={lx}
                      y={ly}
                      textAnchor={textAnchor}
                      fontSize="10"
                      fontWeight={isSelected || isHovered ? '900' : '700'}
                      className={`transition-all duration-150 ${
                        isSelected || isHovered
                          ? 'fill-[#0D6938] dark:fill-emerald-400 font-black'
                          : 'fill-slate-700 dark:fill-slate-200'
                      }`}
                    >
                      {item.aspect.shortName}
                    </text>

                    {/* Subtext Score / No Data on Spoke */}
                    <text
                      x={lx}
                      y={ly + 12}
                      textAnchor={textAnchor}
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      className={
                        item.hasData && item.overallScore !== null
                          ? item.overallScore >= 85
                            ? 'fill-emerald-600 dark:fill-emerald-400'
                            : 'fill-amber-600 dark:fill-amber-400'
                          : 'fill-amber-600 dark:fill-amber-400 italic'
                      }
                    >
                      {item.hasData && item.overallScore !== null ? `${item.overallScore}/100` : '— No data'}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Legend */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#10B981] inline-block" />
              Consensus Unit Profile
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              Active Inspection
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-amber-500 border-dashed inline-block" />
              Hollow = No Data
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-emerald-500 border-dashed inline-block" />
              80 Int'l Benchmark
            </span>
          </div>
        </div>

        {/* Selected Unit Drill-Down Detail Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[#0D6938] dark:text-emerald-400">
                TACTICAL UNIT DETAIL
              </span>
              <span className="text-xl font-mono font-black px-2.5 py-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                {activeCalculatedAspect.overallScore !== null ? (
                  <>
                    {activeCalculatedAspect.overallScore} <span className="text-xs text-slate-400 font-sans">/ 100</span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">No Data</span>
                )}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {activeCalculatedAspect.aspect.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {activeCalculatedAspect.aspect.description}
            </p>
          </div>

          {/* Warning banner if selected unit has no contenders */}
          {!activeCalculatedAspect.hasData && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-300 dark:border-amber-700/80 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>No active contenders currently assigned to this unit. Excluded from overall squad rating.</span>
            </div>
          )}

          {/* Metric Breakdown: Starters vs Depth */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                #1 Starter Class (60%)
              </span>
              <div className="text-xl font-mono font-black text-slate-900 dark:text-white mt-0.5">
                {activeCalculatedAspect.starterAvg !== null ? activeCalculatedAspect.starterAvg : '—'}
              </div>
              <span className="text-[10px] text-slate-400">
                {activeCalculatedAspect.starterAvg !== null ? 'Peak world-class capability' : 'No active starters'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Succession Depth (40%)
              </span>
              <div className="text-xl font-mono font-black text-slate-900 dark:text-white mt-0.5">
                {activeCalculatedAspect.depthAvg !== null ? activeCalculatedAspect.depthAvg : '—'}
              </div>
              <span className="text-[10px] text-slate-400">
                {activeCalculatedAspect.depthAvg !== null ? 'Resilience if #1 is sidelined' : 'No active contenders'}
              </span>
            </div>
          </div>

          {/* Included Positions & Contenders */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
              Contenders in this Unit:
            </span>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {activeCalculatedAspect.positions.map((pos) => {
                const contenders = (playersByPos[pos.id] ?? []).filter((p) => p.status === 'active');
                const starter = contenders[0];
                const backup = contenders[1];
                const depth = contenders.length > 0 ? calculateDepthScore(contenders) : null;
                const band = depth !== null ? getDepthBand(depth) : null;

                return (
                  <div
                    key={pos.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 flex items-center justify-between gap-2 hover:border-slate-300 dark:hover:border-slate-700 transition"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-[#0F1E36] text-white text-[10px] font-mono font-black flex items-center justify-center shrink-0">
                          {pos.num}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                          {pos.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 truncate">
                        <strong>#1:</strong> {starter ? `${starter.name} (${starter.rating})` : 'Unassigned'}
                        {backup && ` · #2: ${backup.name} (${backup.rating})`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {depth !== null && band ? (
                        <span
                          className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-lg text-white"
                          style={{ backgroundColor: band.color }}
                        >
                          {depth} Depth
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500">
                          Empty
                        </span>
                      )}
                      {onSelectPosition && (
                        <button
                          onClick={() => onSelectPosition(pos.id)}
                          className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                          title="Open in Pub Debate"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tactical Commentary Card */}
          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-2 text-xs text-emerald-950 dark:text-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Tactical Note:</strong> {activeCalculatedAspect.aspect.benchmarkTrait}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
