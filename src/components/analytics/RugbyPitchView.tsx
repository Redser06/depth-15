import React, { useState } from 'react';
import { Position, PlayerEntry } from '../../types/depth';
import { PITCH_COORDINATES } from './tacticalFormation';
import { calculateDepthScore, getDepthBand, getRatingTier } from '../../lib/depthCalc';
import { ShieldAlert, Users, X, ArrowDownRight, Award } from 'lucide-react';

interface RugbyPitchViewProps {
  positions: Position[];
  playersByPos: Record<number, PlayerEntry[]>;
  onSelectPosition: (posId: number) => void;
  onChallengePlayer: (player: PlayerEntry) => void;
}

export const RugbyPitchView: React.FC<RugbyPitchViewProps> = ({
  positions,
  playersByPos,
  onSelectPosition,
  onChallengePlayer,
}) => {
  const [activePosId, setActivePosId] = useState<number | null>(null);

  const selectedPos = positions.find((p) => p.id === activePosId);
  const selectedPlayers = activePosId ? playersByPos[activePosId] ?? [] : [];
  const selectedStarter = selectedPlayers[0];
  const selectedBackup = selectedPlayers[1];
  const selectedDropoff = selectedStarter && selectedBackup ? selectedStarter.rating - selectedBackup.rating : 0;
  const selectedDepth = calculateDepthScore(selectedPlayers);
  const selectedBand = getDepthBand(selectedDepth);

  return (
    <div className="space-y-4">
      {/* View Header with Legend */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>🏉</span> Tactical Pitch Setup
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            TV Broadcast formation: 3–2–3 forward pack with diagonal midfield stack &amp; deep sweeper. Tap any position to inspect depth.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Robust (80+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Moderate (70-79)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Fragile (&lt;70)</span>
          </div>
        </div>
      </div>

      {/* Main Pitch Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Pitch Graphic Canvas (Occupies 8 cols on large screens, or full width) */}
        <div className={`relative rounded-3xl overflow-hidden shadow-xl border-4 border-[#09351C] transition-all ${
          activePosId ? 'lg:col-span-8' : 'lg:col-span-12'
        }`}>
          {/* Authentic Rugby Grass Backdrop with Striping Pattern */}
          <div
            className="w-full relative select-none"
            style={{
              paddingBottom: '125%', // 4:5 authentic pitch aspect ratio
              background: 'repeating-linear-gradient(0deg, #104C28 0px, #104C28 40px, #0D4222 40px, #0D4222 80px)',
            }}
          >
            {/* SVG Chalk Markings Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
              viewBox="0 0 1000 1250"
              preserveAspectRatio="none"
            >
              {/* Outer boundary line */}
              <rect x="40" y="40" width="920" height="1170" fill="none" stroke="#FFFFFF" strokeWidth="4" opacity="0.9" />

              {/* Try line / Dead ball area top */}
              <line x1="40" y1="120" x2="960" y2="120" stroke="#FFFFFF" strokeWidth="5" />
              <text x="500" y="85" fill="#FFFFFF" opacity="0.35" fontSize="24" fontWeight="bold" textAnchor="middle" letterSpacing="4">
                IN-GOAL / TRY AREA
              </text>

              {/* Goalposts H-crossbar top */}
              <line x1="460" y1="120" x2="540" y2="120" stroke="#FFE600" strokeWidth="7" />
              <circle cx="460" cy="120" r="5" fill="#FFE600" />
              <circle cx="540" cy="120" r="5" fill="#FFE600" />

              {/* 5m dashed line from try line */}
              <line x1="40" y1="180" x2="960" y2="180" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="16,12" opacity="0.5" />

              {/* 22-metre line */}
              <line x1="40" y1="360" x2="960" y2="360" stroke="#FFFFFF" strokeWidth="4" />
              <text x="80" y="350" fill="#FFFFFF" opacity="0.45" fontSize="22" fontWeight="bold">22m</text>
              <text x="920" y="350" fill="#FFFFFF" opacity="0.45" fontSize="22" fontWeight="bold" textAnchor="end">22m</text>

              {/* 10m dashed line */}
              <line x1="40" y1="520" x2="960" y2="520" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="20,15" opacity="0.65" />
              <text x="80" y="510" fill="#FFFFFF" opacity="0.4" fontSize="18" fontWeight="bold">10m</text>
              <text x="920" y="510" fill="#FFFFFF" opacity="0.4" fontSize="18" fontWeight="bold" textAnchor="end">10m</text>

              {/* Halfway line with center spot */}
              <line x1="40" y1="650" x2="960" y2="650" stroke="#FFFFFF" strokeWidth="4" />
              <circle cx="500" cy="650" r="8" fill="#FFFFFF" />
              <text x="500" y="640" fill="#FFFFFF" opacity="0.4" fontSize="22" fontWeight="bold" textAnchor="middle" letterSpacing="2">
                HALFWAY
              </text>

              {/* Tramlines / 5m & 15m lineout markings */}
              <line x1="100" y1="40" x2="100" y2="1210" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="10,12" opacity="0.3" />
              <line x1="200" y1="40" x2="200" y2="1210" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="10,12" opacity="0.3" />
              <line x1="800" y1="40" x2="800" y2="1210" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="10,12" opacity="0.3" />
              <line x1="900" y1="40" x2="900" y2="1210" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="10,12" opacity="0.3" />

              {/* Lower 10m and 22m lines */}
              <line x1="40" y1="780" x2="960" y2="780" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="20,15" opacity="0.5" />
              <line x1="40" y1="940" x2="960" y2="940" stroke="#FFFFFF" strokeWidth="3" opacity="0.7" />
              <line x1="40" y1="1160" x2="960" y2="1160" stroke="#FFFFFF" strokeWidth="4" />
            </svg>

            {/* Tactical Unit Boundary Shadows / Labels */}
            <div className="absolute top-[10%] left-[26%] right-[26%] h-[35%] rounded-3xl border border-white/10 bg-white/5 pointer-events-none backdrop-blur-[0.5px]">
              <span className="absolute top-2 left-3 text-[10px] uppercase tracking-widest font-black text-white/30">
                Pack · 8 Man Scrum
              </span>
            </div>

            <div className="absolute top-[48%] left-[8%] right-[8%] h-[45%] rounded-3xl border border-white/10 bg-white/5 pointer-events-none backdrop-blur-[0.5px]">
              <span className="absolute bottom-2 right-4 text-[10px] uppercase tracking-widest font-black text-white/30">
                Backline Attack Line
              </span>
            </div>

            {/* 15 Player Nodes Arranged by Exact Pitch Coordinates */}
            {positions.map((pos) => {
              const coord = PITCH_COORDINATES[pos.id]!;
              const players = playersByPos[pos.id] ?? [];
              const starter = players[0];
              const depth = calculateDepthScore(players);
              const band = getDepthBand(depth);
              const isSelected = activePosId === pos.id;
              const isFragile = depth < 70;

              return (
                <div
                  key={pos.id}
                  style={{
                    left: `${coord.xPercent}%`,
                    top: `${coord.yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute z-20 transition-all duration-200"
                >
                  <button
                    onClick={() => setActivePosId(isSelected ? null : pos.id)}
                    className={`group relative flex flex-col items-center focus:outline-hidden transition-transform active:scale-95 ${
                      isSelected ? 'scale-110 z-30' : 'hover:scale-105'
                    }`}
                    title={`${pos.num}. ${pos.name}: ${starter ? starter.name : 'Unassigned'} (Depth: ${depth})`}
                  >
                    {/* Jersey / Circle Shield Node */}
                    <div
                      className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-lg transition-all border-2 ${
                        isSelected
                          ? 'ring-4 ring-amber-400 border-white bg-slate-950 scale-105'
                          : isFragile
                          ? 'border-red-400 bg-slate-900/95 ring-2 ring-red-500/40'
                          : 'border-white/80 bg-[#0F1E36]/95 hover:border-amber-300'
                      }`}
                    >
                      {/* Position Number Pill */}
                      <span className="text-xs sm:text-sm font-black font-mono leading-none tracking-tight">
                        {pos.num}
                      </span>

                      {/* Starter Rating */}
                      <span className="text-[10px] sm:text-[11px] font-extrabold font-mono text-emerald-400 mt-0.5 leading-none">
                        {starter ? starter.rating : '—'}
                      </span>

                      {/* Depth Band Indicator Dot */}
                      <span
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 shadow-xs flex items-center justify-center text-[7px]"
                        style={{ backgroundColor: band.color }}
                        title={`Depth Score: ${depth} (${band.label})`}
                      >
                        {isFragile && <ShieldAlert className="w-2 h-2 text-white" />}
                      </span>
                    </div>

                    {/* Compact Player Name Label Plaque */}
                    <div className="mt-1 px-1.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-xs border border-white/20 text-center max-w-[76px] sm:max-w-[95px] shadow-sm">
                      <p className="text-[9px] sm:text-[10px] font-bold text-white truncate leading-tight">
                        {starter ? starter.name.split(' ').pop() : 'Empty'}
                      </p>
                      <p className="text-[8px] font-mono text-slate-300 truncate leading-none">
                        {pos.abbr}
                      </p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tactical Depth Detail Drawer / Card (Displays when position clicked, or default Fly-Half) */}
        {selectedPos && (
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header with Close */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0F1E36] dark:bg-slate-800 text-white font-mono font-black text-base flex items-center justify-center shadow-xs border border-slate-700">
                  {selectedPos.num}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {selectedPos.abbr}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {PITCH_COORDINATES[selectedPos.id]?.unit}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                    {selectedPos.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActivePosId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Depth Score & Drop-off Metric Banner */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Position Depth
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    className="text-xl font-black font-mono"
                    style={{ color: selectedBand.color }}
                  >
                    {selectedDepth}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    / 100
                  </span>
                </div>
                <span
                  className="text-[9px] font-extrabold uppercase tracking-wide block mt-0.5"
                  style={{ color: selectedBand.color }}
                >
                  {selectedBand.label}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  #1 to #2 Drop-Off
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    className={`text-xl font-black font-mono ${
                      selectedDropoff > 8 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    -{selectedDropoff}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    pts gap
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  {selectedDropoff > 8 ? 'High cliff edge risk' : 'Healthy succession'}
                </span>
              </div>
            </div>

            {/* Contenders Ladder in this position */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Contender Ladder ({selectedPlayers.length})</span>
                </span>
                <button
                  onClick={() => onSelectPosition(selectedPos.id)}
                  className="text-[11px] font-bold text-[#0D6938] dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Open Full Ladder</span>
                  <ArrowDownRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                {selectedPlayers.map((player, idx) => {
                  const { badgeColor } = getRatingTier(player.rating);
                  const isStarter = idx === 0;

                  return (
                    <div
                      key={player.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                        isStarter
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-xs'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono ${
                            isStarter
                              ? 'bg-[#0D6938] text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {player.name}
                            </span>
                            {isStarter && (
                              <span className="flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-bold bg-[#0D6938] text-white">
                                <Award className="w-2.5 h-2.5" /> Starter
                              </span>
                            )}
                            {player.secondary && (
                              <span className="px-1 py-0.2 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300">
                                2nd
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {player.province ?? 'National Squad'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-black font-mono text-white shadow-xs"
                          style={{ backgroundColor: badgeColor }}
                        >
                          {player.rating}
                        </span>
                        <button
                          onClick={() => onChallengePlayer(player)}
                          className="text-[10px] font-bold text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-300 underline"
                        >
                          Debate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
