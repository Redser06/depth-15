import React, { useState } from 'react';
import { Position, PlayerEntry, ProposalType } from '../../types/depth';
import { X, AlertCircle, Sparkles, Send } from 'lucide-react';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlayer?: PlayerEntry;
  targetPosition?: Position;
  positions: Position[];
  initialRationale?: string;
  onSubmit: (data: {
    type: ProposalType;
    targetPlayerName: string;
    pos: number;
    currentValue: number | string;
    proposedValue: number | string;
    rationale: string;
  }) => void;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({
  isOpen,
  onClose,
  targetPlayer,
  targetPosition,
  positions,
  initialRationale = '',
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<ProposalType>(targetPlayer ? 'rerate' : 'add_player');
  const [selectedPos, setSelectedPos] = useState<number>(targetPosition?.id ?? targetPlayer?.pos ?? 10);
  const [playerName, setPlayerName] = useState<string>(targetPlayer?.name ?? '');
  const [proposedRating, setProposedRating] = useState<number>(targetPlayer?.rating ?? 80);
  const [rationale, setRationale] = useState<string>(initialRationale);
  const [error, setError] = useState<string | null>(null);

  const isRetire = type === 'retire';
  // Retire/out requires no minimum essay (0 chars). Normal challenge requires brief 15 chars.
  const MIN_CHARS = isRetire ? 0 : 15;
  const currentLength = rationale.trim().length;
  const charsRemaining = Math.max(0, MIN_CHARS - currentLength);

  const QUICK_REASONS = isRetire
    ? [
        'Retired from rugby',
        'Moved abroad / ineligible',
        'Long-term injury',
        'Left provincial squad',
      ]
    : [
        'Standout European form',
        'Outperformed rival in camp',
        'Dominant set-piece work',
        'Exposed in recent tests',
      ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please provide a player name.');
      return;
    }

    if (!isRetire && currentLength < MIN_CHARS) {
      setError(`Pub rule: Give a brief reason (${MIN_CHARS} chars minimum). No essays needed! (${charsRemaining} characters left)`);
      return;
    }

    const currentVal = targetPlayer?.rating ?? 0;
    const finalRationale = rationale.trim() || (isRetire ? `${playerName.trim()} retired / unavailable for selection.` : 'Consensus proposal update.');

    onSubmit({
      type,
      targetPlayerName: playerName.trim(),
      pos: selectedPos,
      currentValue: currentVal,
      proposedValue: proposedRating,
      rationale: finalRationale,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0D6938] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Propose Consensus Change
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submit proposal to the group for debate and voting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Proposal Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Proposal Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('rerate')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                  type === 'rerate'
                    ? 'bg-[#0D6938] text-white border-transparent'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Re-rate
              </button>
              <button
                type="button"
                onClick={() => setType('add_player')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                  type === 'add_player'
                    ? 'bg-[#0D6938] text-white border-transparent'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Add Player
              </button>
              <button
                type="button"
                onClick={() => setType('retire')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                  type === 'retire'
                    ? 'bg-[#0D6938] text-white border-transparent'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Retire / Out
              </button>
            </div>
          </div>

          {/* Target Position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pos-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Position
              </label>
              <select
                id="pos-select"
                value={selectedPos}
                onChange={(e) => setSelectedPos(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0D6938]"
              >
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.num}. {p.name} ({p.abbr})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Player Name */}
            <div>
              <label htmlFor="player-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Player Name
              </label>
              <input
                id="player-input"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="e.g. Sam Prendergast"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0D6938]"
              />
            </div>
          </div>

          {/* Rating Slider & Value */}
          {type !== 'retire' && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Proposed Quality Rating (0–100)
                </label>
                <div className="flex items-baseline gap-1.5">
                  {targetPlayer && (
                    <span className="text-xs text-slate-400 line-through">
                      {targetPlayer.rating}
                    </span>
                  )}
                  <span className="text-lg font-black font-mono text-[#0D6938] dark:text-emerald-400">
                    {proposedRating}
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="45"
                max="99"
                value={proposedRating}
                onChange={(e) => setProposedRating(Number(e.target.value))}
                className="w-full accent-[#0D6938] cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>50 Emerging</span>
                <span>70 Squad</span>
                <span>80 Int'l</span>
                <span>90+ World Class</span>
              </div>
            </div>
          )}

          {/* Rationale Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="rationale-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>{isRetire ? 'Reason' : 'Pub Rationale'}</span>
                {!isRetire && <span className="text-red-500">*</span>}
              </label>
              <span
                className={`text-[11px] font-mono font-semibold ${
                  isRetire
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : charsRemaining > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isRetire
                  ? 'Ready (No essay needed)'
                  : charsRemaining > 0
                  ? `${charsRemaining} chars needed (15 min)`
                  : `${currentLength} chars (Good)`}
              </span>
            </div>

            {/* Quick Reason Chips */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <span className="text-[10px] text-slate-400 font-medium">Quick tap:</span>
              {QUICK_REASONS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setRationale(chip)}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-[#0D6938] dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                >
                  + {chip}
                </button>
              ))}
            </div>

            <textarea
              id="rationale-input"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              placeholder={
                isRetire
                  ? "Optional: e.g. Retired from test rugby, signed abroad in Top 14, long-term ACL..."
                  : "Quick pub reason: e.g. Outstanding against SA in summer, dominant scrummaging, outplayed rival in camp..."
              }
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0D6938] resize-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              {isRetire
                ? "They're gone and that's that — no essay needed."
                : "Keep it punchy. Quick empirical argument, no essays required."}
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isRetire && currentLength < MIN_CHARS}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white transition shadow-sm ${
                isRetire || currentLength >= MIN_CHARS
                  ? 'bg-[#0D6938] hover:bg-emerald-800 cursor-pointer active:scale-95'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Debate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
