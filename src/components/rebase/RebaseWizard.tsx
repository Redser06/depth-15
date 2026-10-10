import React, { useState, useMemo } from 'react';
import { RebaseSession, Position, PlayerEntry, Member, Gate2Entrant } from '../../types/depth';
import {
  Sparkles,
  Check,
  ChevronRight,
  UserMinus,
  UserPlus,
  Sliders,
  FileCheck,
  Search,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RebaseWizardProps {
  rebaseSession: RebaseSession;
  positions: Position[];
  players: PlayerEntry[];
  activeMember?: Member;
  onOpenRebase: () => void;
  onSetGate: (gate: 1 | 2 | 3 | 4) => void;
  onRecordGate1: (playerName: string, action: 'keep' | 'retire' | 'ineligible', reason?: string) => void;
  onRecordGate1Batch?: (playerNames: string[], action: 'keep' | 'retire' | 'ineligible', reason?: string) => void;
  onAddGate2Entrant: (entrant: Omit<Gate2Entrant, 'id'>) => void;
  onRemoveGate2Entrant?: (entrantId: string) => void;
  onMarkGate3Position: (posId: number) => void;
  onMarkAllGate3Positions?: () => void;
  onCompleteSignoff: (title: string, notes?: string) => void;
}

export const RebaseWizard: React.FC<RebaseWizardProps> = ({
  rebaseSession,
  positions,
  players,
  onOpenRebase,
  onSetGate,
  onRecordGate1,
  onRecordGate1Batch,
  onAddGate2Entrant,
  onRemoveGate2Entrant,
  onMarkGate3Position,
  onMarkAllGate3Positions,
  onCompleteSignoff,
}) => {
  // Gate 1 state
  const [gate1GroupFilter, setGate1GroupFilter] = useState<'all' | 'Forwards' | 'Backs'>('all');
  const [gate1PosFilter, setGate1PosFilter] = useState<number | 'all'>('all');
  const [gate1Search, setGate1Search] = useState<string>('');

  // Gate 2 form state
  const [entrantName, setEntrantName] = useState('');
  const [entrantPos, setEntrantPos] = useState<number>(10);
  const [entrantStream, setEntrantStream] = useState<Gate2Entrant['stream']>('Provincial Breakthrough');
  const [entrantProvince, setEntrantProvince] = useState<Gate2Entrant['province']>('Leinster');
  const [entrantRating, setEntrantRating] = useState<number>(75);
  const [entrantUncapped, setEntrantUncapped] = useState<boolean>(true);
  const [entrantRationale, setEntrantRationale] = useState<string>('');

  // Gate 3 state
  const [expandedPosId, setExpandedPosId] = useState<number | null>(null);

  // Gate 4 sign-off state
  const [versionTitle, setVersionTitle] = useState('2026-27.0 Official Consensus Baseline');
  const [versionNotes, setVersionNotes] = useState('Full squad consensus re-based across 15 positions in pre-season session.');

  // Gate 1 summary metrics
  const { keptCount, retiredCount, ineligibleCount } = useMemo(() => {
    let kept = 0;
    let retired = 0;
    let ineligible = 0;

    players.forEach((p) => {
      const decision = rebaseSession.gate1Attrition[p.name]?.action ?? 'keep';
      if (decision === 'retire') retired++;
      else if (decision === 'ineligible') ineligible++;
      else kept++;
    });

    return { keptCount: kept, retiredCount: retired, ineligibleCount: ineligible };
  }, [players, rebaseSession.gate1Attrition]);

  // Positions mapped with players
  const positionMap = useMemo(() => {
    const map = new Map<number, Position>();
    positions.forEach((pos) => map.set(pos.id, pos));
    return map;
  }, [positions]);

  // Grouped players by position
  const playersByPosition = useMemo(() => {
    const grouped: Record<number, PlayerEntry[]> = {};
    positions.forEach((pos) => {
      grouped[pos.id] = players.filter((p) => p.pos === pos.id);
    });
    return grouped;
  }, [players, positions]);

  // Filtered positions for Gate 1
  const filteredPositions = useMemo(() => {
    return positions.filter((pos) => {
      if (gate1GroupFilter !== 'all' && pos.group !== gate1GroupFilter) return false;
      if (gate1PosFilter !== 'all' && pos.id !== gate1PosFilter) return false;
      return true;
    });
  }, [positions, gate1GroupFilter, gate1PosFilter]);

  // Batch keep helper
  const handleBatchKeep = (playerNames: string[]) => {
    if (onRecordGate1Batch) {
      onRecordGate1Batch(playerNames, 'keep');
    } else {
      playerNames.forEach((name) => onRecordGate1(name, 'keep'));
    }
  };

  // Helper for Confirm All Gate 3
  const handleConfirmAllGate3 = () => {
    if (onMarkAllGate3Positions) {
      onMarkAllGate3Positions();
    } else {
      positions.forEach((pos) => onMarkGate3Position(pos.id));
    }
  };

  if (!rebaseSession.isOpen) {
    return (
      <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-[#0D6938] dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
          <Sparkles className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Season 2026–27 Re-Base Window
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            A scheduled pub session event to update the Ireland squad depth chart through 4 structured gates covering all 15 positions.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Gate 1</span>
            <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">Attrition</div>
            <p className="text-[10px] text-slate-500">Who retired or left</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Gate 2</span>
            <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">Entry</div>
            <p className="text-[10px] text-slate-500">New caps &amp; U20s</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Gate 3</span>
            <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">Re-rate</div>
            <p className="text-[10px] text-slate-500">15-position sweep</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Gate 4</span>
            <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">Sign-off</div>
            <p className="text-[10px] text-slate-500">Snapshot 2026-27.0</p>
          </div>
        </div>

        <div className="pt-3">
          <button
            onClick={onOpenRebase}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#0D6938] hover:bg-emerald-800 text-white shadow-md transition active:scale-95 flex items-center gap-2 mx-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open 2026–27 Re-Base Window</span>
          </button>
        </div>
      </div>
    );
  }

  const handleAddEntrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entrantName.trim()) return;

    onAddGate2Entrant({
      name: entrantName.trim(),
      pos: entrantPos,
      rating: entrantRating,
      stream: entrantStream,
      province: entrantProvince,
      uncapped: entrantUncapped,
      rationale: entrantRationale.trim() || 'Added during Season 2026-27 Re-base intake.',
    });

    setEntrantName('');
    setEntrantRationale('');
  };

  const handleCompleteAll = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
    onCompleteSignoff(versionTitle, versionNotes);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Re-Base Active Window Progress Stepper */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Season 2026–27 Re-Base Window (Open)
            </h2>
          </div>
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
            Session Live
          </span>
        </div>

        {/* 4 Gates Horizontal Stepper */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {[
            { gate: 1, label: 'Gate 1: Attrition', icon: UserMinus },
            { gate: 2, label: 'Gate 2: Entry', icon: UserPlus },
            { gate: 3, label: 'Gate 3: Re-rate', icon: Sliders },
            { gate: 4, label: 'Gate 4: Sign-off', icon: FileCheck },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = rebaseSession.currentGate === item.gate;
            const isPast = rebaseSession.currentGate > item.gate;

            return (
              <button
                key={item.gate}
                onClick={() => onSetGate(item.gate as 1 | 2 | 3 | 4)}
                className={`p-2 sm:p-3 rounded-xl text-left border transition flex flex-col justify-between cursor-pointer ${
                  isCurrent
                    ? 'bg-[#0D6938] text-white border-transparent shadow-sm'
                    : isPast
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-4 h-4" />
                  {isPast && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <div className="text-[11px] sm:text-xs font-extrabold mt-2 leading-tight">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* GATE 1: ATTRITION (ALL 15 POSITIONS & ALL PLAYERS) */}
      {rebaseSession.currentGate === 1 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <UserMinus className="w-5 h-5 text-red-500" />
                <span>Gate 1 — Attrition (Who's Gone Across All 15 Positions)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Review all {players.length} squad players across 15 positions for international retirement, overseas moves outside IRFU policy, or career transitions. Default is <strong>Keep</strong>.
              </p>
            </div>

            {/* KPI Chips */}
            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Pool: {players.length}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-[#0D6938] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Keep: {keptCount}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Retire: {retiredCount}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                Ineligible: {ineligibleCount}
              </span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => {
                  setGate1GroupFilter('all');
                  setGate1PosFilter('all');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  gate1GroupFilter === 'all' && gate1PosFilter === 'all'
                    ? 'bg-[#0D6938] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                All 15 Positions
              </button>
              <button
                onClick={() => {
                  setGate1GroupFilter('Forwards');
                  setGate1PosFilter('all');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  gate1GroupFilter === 'Forwards'
                    ? 'bg-[#0D6938] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Forwards (1–8)
              </button>
              <button
                onClick={() => {
                  setGate1GroupFilter('Backs');
                  setGate1PosFilter('all');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  gate1GroupFilter === 'Backs'
                    ? 'bg-[#0D6938] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Backs (9–15)
              </button>

              {/* Position selector dropdown */}
              <select
                value={gate1PosFilter}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                  setGate1PosFilter(val);
                }}
                className="px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">Jump to Position...</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.num}. {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search player or province..."
                value={gate1Search}
                onChange={(e) => setGate1Search(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0D6938]"
              />
            </div>
          </div>

          {/* Position Sections */}
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
            {filteredPositions.map((pos) => {
              const posPlayers = (playersByPosition[pos.id] ?? []).filter((p) => {
                if (!gate1Search.trim()) return true;
                const query = gate1Search.toLowerCase().trim();
                return (
                  p.name.toLowerCase().includes(query) ||
                  (p.province && p.province.toLowerCase().includes(query))
                );
              });

              if (posPlayers.length === 0) return null;

              return (
                <div
                  key={pos.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900"
                >
                  {/* Position Header */}
                  <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#0D6938] text-white text-xs font-black flex items-center justify-center font-mono">
                        {pos.num}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {pos.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({posPlayers.length} contenders)
                      </span>
                    </div>

                    <button
                      onClick={() => handleBatchKeep(posPlayers.map((p) => p.name))}
                      className="text-[11px] font-bold text-[#0D6938] hover:text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
                      title="Mark all contenders in this position as Keep"
                    >
                      Keep All in Pos {pos.num}
                    </button>
                  </div>

                  {/* Contender Rows */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {posPlayers.map((player) => {
                      const decision = rebaseSession.gate1Attrition[player.name]?.action ?? 'keep';
                      const reason = rebaseSession.gate1Attrition[player.name]?.reason;

                      return (
                        <div
                          key={player.id}
                          className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {player.name}
                            </span>
                            {player.uncapped && (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400" title="Uncapped player">
                                *
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {player.rating}
                            </span>
                            {player.province && (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {player.province}
                              </span>
                            )}
                            {decision !== 'keep' && (
                              <span
                                className={`text-[10px] font-semibold italic ${
                                  decision === 'retire'
                                    ? 'text-amber-700 dark:text-amber-300'
                                    : 'text-red-700 dark:text-red-300'
                                }`}
                              >
                                ({reason ?? (decision === 'retire' ? 'Retired' : 'Ineligible')})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => onRecordGate1(player.name, 'keep')}
                              className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                                decision === 'keep'
                                  ? 'bg-[#0D6938] text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              Keep
                            </button>
                            <button
                              onClick={() =>
                                onRecordGate1(
                                  player.name,
                                  'retire',
                                  'Retired from international rugby'
                                )
                              }
                              className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                                decision === 'retire'
                                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              Retire
                            </button>
                            <button
                              onClick={() =>
                                onRecordGate1(
                                  player.name,
                                  'ineligible',
                                  'Moved abroad outside IRFU selection policy'
                                )
                              }
                              className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                                decision === 'ineligible'
                                  ? 'bg-red-600 text-white shadow-xs font-black'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              Ineligible
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {retiredCount + ineligibleCount > 0 ? (
                <span>
                  <strong>{retiredCount} retiring</strong>, <strong>{ineligibleCount} ineligible</strong>. Remaining {keptCount} players preserved.
                </span>
              ) : (
                <span>All {keptCount} players currently marked to keep into Season 2026–27.</span>
              )}
            </div>

            <button
              onClick={() => onSetGate(2)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-emerald-800 text-white flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <span>Proceed to Gate 2: Entry</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* GATE 2: ENTRY */}
      {rebaseSession.currentGate === 2 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#0D6938]" />
              <span>Gate 2 — Entry (Who's New Across All 15 Positions)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add candidates from the 4 intake streams: Newly Capped, U20 Graduates, Provincial Breakthroughs, or Returning Exiles to any position.
            </p>
          </div>

          {/* New Entrant Form */}
          <form onSubmit={handleAddEntrant} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Player Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brian Gleeson"
                  value={entrantName}
                  onChange={(e) => setEntrantName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Position (1–15)
                </label>
                <select
                  value={entrantPos}
                  onChange={(e) => setEntrantPos(Number(e.target.value))}
                  className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.num}. {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Intake Stream
                </label>
                <select
                  value={entrantStream}
                  onChange={(e) => setEntrantStream(e.target.value as Gate2Entrant['stream'])}
                  className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Newly Capped">Newly Capped (Last 12mo)</option>
                  <option value="U20 / Emerging">U20 / Emerging Graduate</option>
                  <option value="Provincial Breakthrough">Provincial Breakthrough</option>
                  <option value="Returning Exile">Returning Exile / Eligible</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Initial Rating: <span className="font-mono text-[#0D6938] dark:text-emerald-400 font-bold">{entrantRating}</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="85"
                  value={entrantRating}
                  onChange={(e) => setEntrantRating(Number(e.target.value))}
                  className="w-full mt-1 accent-[#0D6938]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Province
                </label>
                <select
                  value={entrantProvince}
                  onChange={(e) => setEntrantProvince(e.target.value as Gate2Entrant['province'])}
                  className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Leinster">Leinster</option>
                  <option value="Munster">Munster</option>
                  <option value="Ulster">Ulster</option>
                  <option value="Connacht">Connacht</option>
                  <option value="Exile">Exile</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="uncapped-chk"
                  checked={entrantUncapped}
                  onChange={(e) => setEntrantUncapped(e.target.checked)}
                  className="accent-[#0D6938] rounded"
                />
                <label htmlFor="uncapped-chk" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Uncapped Player (*)
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#0D6938] hover:bg-emerald-800 text-white transition cursor-pointer shadow-xs"
              >
                + Add Entrant Candidate
              </button>
            </div>
          </form>

          {/* Staged Entrants List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Staged Entrants ({rebaseSession.gate2Entrants.length})
            </span>
            {rebaseSession.gate2Entrants.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No new entrants staged yet. Add players above or proceed if no new squad intakes.
              </p>
            ) : (
              rebaseSession.gate2Entrants.map((ent) => {
                const pos = positionMap.get(ent.pos);
                return (
                  <div
                    key={ent.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs border border-slate-200 dark:border-slate-800"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {ent.name} {ent.uncapped && '*'}
                      </span>
                      <span className="text-slate-400 ml-2">
                        {pos ? `${pos.num}. ${pos.name}` : `Pos ${ent.pos}`} · {ent.province} · {ent.stream}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#0D6938] dark:text-emerald-400">
                        Rating {ent.rating}
                      </span>
                      {onRemoveGate2Entrant && (
                        <button
                          onClick={() => onRemoveGate2Entrant(ent.id)}
                          className="text-slate-400 hover:text-red-500 transition p-1 cursor-pointer"
                          title="Remove entrant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <button
              onClick={() => onSetGate(1)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Back to Gate 1
            </button>
            <button
              onClick={() => onSetGate(3)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-emerald-800 text-white flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <span>Proceed to Gate 3: Re-rate Sweep</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* GATE 3: RE-RATE SWEEP (ALL 15 POSITIONS) */}
      {rebaseSession.currentGate === 3 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#0D6938]" />
                <span>Gate 3 — Re-rate Sweep (15-Position Verification)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Confirm all 15 positions in chart order. Unchallenged ratings automatically roll over marked as <em>rolled over</em> into the new season snapshot.
              </p>
            </div>

            <button
              onClick={handleConfirmAllGate3}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-emerald-800 text-white flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm All 15 Positions</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {positions.map((p) => {
              const isDone = Boolean(rebaseSession.gate3PositionsReviewed[p.id]);
              const posPlayers = playersByPosition[p.id] ?? [];
              const isExpanded = expandedPosId === p.id;

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border text-xs transition ${
                    isDone
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedPosId(isExpanded ? null : p.id)}
                      className="flex items-center gap-1.5 font-bold text-left text-slate-900 dark:text-white hover:text-[#0D6938] cursor-pointer"
                    >
                      <span className="font-mono font-bold text-slate-500">{p.num}.</span>
                      <span className="truncate max-w-[120px]">{p.name}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => onMarkGate3Position(p.id)}
                      className={`px-2 py-1 rounded-md font-bold text-[11px] flex items-center gap-1 cursor-pointer transition ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Reviewed</span>
                        </>
                      ) : (
                        'Confirm'
                      )}
                    </button>
                  </div>

                  {/* Expanded Contenders Drawer */}
                  {isExpanded && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Current Contenders ({posPlayers.length}):
                      </span>
                      {posPlayers.map((pl, idx) => (
                        <div key={pl.id} className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 py-0.5">
                          <span>
                            #{idx + 1} {pl.name}
                          </span>
                          <span className="font-mono font-bold text-[#0D6938] dark:text-emerald-400">
                            {pl.rating}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <button
              onClick={() => onSetGate(2)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Back to Gate 2
            </button>
            <button
              onClick={() => onSetGate(4)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-emerald-800 text-white flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <span>Proceed to Gate 4: Sign-off</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* GATE 4: SIGN-OFF & SNAPSHOT */}
      {rebaseSession.currentGate === 4 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <span>Gate 4 — Official Sign-off &amp; Snapshot</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Finalize the 2026–27 squad re-base across all 15 positions. This will archive attrition players, incorporate staged entrants, snapshot version <strong>2026-27.0</strong>, and unlock normal in-season debate.
            </p>
          </div>

          {/* Audit Summary Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#0D6938]" />
              <span>Pre-Season Audit Verification</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Attrition</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {retiredCount} Retired · {ineligibleCount} Ineligible
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">New Intakes</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  +{rebaseSession.gate2Entrants.length} Entrants Staged
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Position Sweep</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {Object.keys(rebaseSession.gate3PositionsReviewed).length} / 15 Positions Confirmed
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Snapshot Title
              </label>
              <input
                type="text"
                value={versionTitle}
                onChange={(e) => setVersionTitle(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Sign-off Rationale &amp; Notes
              </label>
              <textarea
                rows={3}
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <button
              onClick={() => onSetGate(3)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Back to Gate 3
            </button>
            <button
              onClick={handleCompleteAll}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-[#0D6938] hover:bg-emerald-800 text-white shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Publish Official 2026-27.0 Snapshot</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
