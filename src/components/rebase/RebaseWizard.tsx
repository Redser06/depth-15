import React, { useState } from 'react';
import { RebaseSession, Position, PlayerEntry, Member, Gate2Entrant } from '../../types/depth';
import { Sparkles, Check, ChevronRight, UserMinus, UserPlus, Sliders, FileCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RebaseWizardProps {
  rebaseSession: RebaseSession;
  positions: Position[];
  players: PlayerEntry[];
  activeMember?: Member;
  onOpenRebase: () => void;
  onSetGate: (gate: 1 | 2 | 3 | 4) => void;
  onRecordGate1: (playerName: string, action: 'keep' | 'retire' | 'ineligible', reason?: string) => void;
  onAddGate2Entrant: (entrant: Omit<Gate2Entrant, 'id'>) => void;
  onMarkGate3Position: (posId: number) => void;
  onCompleteSignoff: (title: string, notes?: string) => void;
}

export const RebaseWizard: React.FC<RebaseWizardProps> = ({
  rebaseSession,
  positions,
  players,
  onOpenRebase,
  onSetGate,
  onRecordGate1,
  onAddGate2Entrant,
  onMarkGate3Position,
  onCompleteSignoff,
}) => {
  // Gate 2 form state
  const [entrantName, setEntrantName] = useState('');
  const [entrantPos, setEntrantPos] = useState<number>(10);
  const [entrantStream, setEntrantStream] = useState<Gate2Entrant['stream']>('Provincial Breakthrough');
  const [entrantProvince, setEntrantProvince] = useState<Gate2Entrant['province']>('Leinster');
  const [entrantRating, setEntrantRating] = useState<number>(75);
  const [entrantUncapped, setEntrantUncapped] = useState<boolean>(true);
  const [entrantRationale, setEntrantRationale] = useState<string>('');

  // Gate 4 sign-off state
  const [versionTitle, setVersionTitle] = useState('2026-27.0 Official Consensus Baseline');
  const [versionNotes, setVersionNotes] = useState('Full squad consensus re-based across 15 positions in pre-season session.');

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
            A scheduled pub session event to update the Ireland squad depth chart through 4 structured gates.
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
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#0D6938] hover:bg-emerald-800 text-white shadow-md transition active:scale-95 flex items-center gap-2 mx-auto"
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
                className={`p-2 sm:p-3 rounded-xl text-left border transition flex flex-col justify-between ${
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

      {/* GATE 1: ATTRITION */}
      {rebaseSession.currentGate === 1 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserMinus className="w-5 h-5 text-red-500" />
              <span>Gate 1 — Attrition (Who's Gone)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Review players for international retirement, overseas moves outside IRFU selection policy, or career transitions. Default is <strong>Keep</strong>.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto pr-1">
            {players.slice(0, 20).map((player) => {
              const decision = rebaseSession.gate1Attrition[player.name]?.action ?? 'keep';

              return (
                <div key={player.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {player.name}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      Pos {player.pos} · Rating {player.rating}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onRecordGate1(player.name, 'keep')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                        decision === 'keep'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Keep
                    </button>
                    <button
                      onClick={() => onRecordGate1(player.name, 'retire', 'Retired from international rugby')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                        decision === 'retire'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Retire
                    </button>
                    <button
                      onClick={() => onRecordGate1(player.name, 'ineligible', 'Moved abroad outside IRFU policy')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                        decision === 'ineligible'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Ineligible
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => onSetGate(2)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-emerald-800 text-white flex items-center gap-1.5 transition"
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
              <span>Gate 2 — Entry (Who's New)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add candidates from the 4 intake streams: Newly Capped, U20 Graduates, Provincial Breakthroughs, or Returning Exiles.
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
                  Position
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
                <label htmlFor="uncapped-chk" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Uncapped Player (*)
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#0D6938] hover:bg-emerald-800 text-white transition"
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
            {rebaseSession.gate2Entrants.map((ent) => (
              <div
                key={ent.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {ent.name} {ent.uncapped && '*'}
                  </span>
                  <span className="text-slate-400 ml-2">
                    Pos {ent.pos} · {ent.province} · {ent.stream}
                  </span>
                </div>
                <span className="font-mono font-bold text-[#0D6938] dark:text-emerald-400">
                  Rating {ent.rating}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <button
              onClick={() => onSetGate(1)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Back to Gate 1
            </button>
            <button
              onClick={() => onSetGate(3)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-emerald-800 text-white flex items-center gap-1.5 transition"
            >
              <span>Proceed to Gate 3: Re-rate Sweep</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* GATE 3: RE-RATE */}
      {rebaseSession.currentGate === 3 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#0D6938]" />
              <span>Gate 3 — Re-rate Sweep (Position-by-Position)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Step through the 15 positions in chart order. Unchallenged ratings automatically roll over marked as <em>rolled over</em>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {positions.map((p) => {
              const isDone = rebaseSession.gate3PositionsReviewed[p.id];

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <span className="font-mono font-bold text-slate-500 mr-1.5">
                      {p.num}.
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {p.name}
                    </span>
                  </div>

                  <button
                    onClick={() => onMarkGate3Position(p.id)}
                    className={`p-1 rounded-md font-bold text-[11px] ${
                      isDone
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : 'Confirm'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <button
              onClick={() => onSetGate(2)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Back to Gate 2
            </button>
            <button
              onClick={() => onSetGate(4)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-emerald-800 text-white flex items-center gap-1.5 transition"
            >
              <span>Proceed to Gate 4: Sign-off</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* GATE 4: SIGN-OFF */}
      {rebaseSession.currentGate === 4 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <span>Gate 4 — Official Sign-off &amp; Snapshot</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Finalize the 2026–27 squad re-base. This will archive removed players, incorporate all new entrants, snapshot version <strong>2026-27.0</strong>, and unlock normal in-season debate.
            </p>
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
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Back to Gate 3
            </button>
            <button
              onClick={handleCompleteAll}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-[#0D6938] hover:bg-emerald-800 text-white shadow-md transition active:scale-95 flex items-center gap-1.5"
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
