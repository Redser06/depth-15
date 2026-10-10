import React, { useState } from 'react';
import { Position, Province, PROVINCES } from '../../types/depth';
import { X, UserPlus, Sparkles, Check, AlertCircle } from 'lucide-react';

interface AddBreakthroughPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  positions: Position[];
  defaultPositionId?: number;
  onAddPlayerDirect: (data: {
    name: string;
    pos: number;
    rating: number;
    province: Province;
    uncapped?: boolean;
    notes?: string;
  }) => void;
  onProposePlayer: (data: {
    type: 'add_player';
    targetPlayerName: string;
    pos: number;
    currentValue: number;
    proposedValue: number;
    rationale: string;
    province: Province;
    uncapped: boolean;
  }) => void;
}

const INTAKE_STREAMS = [
  'U20 World Championship Graduate',
  'Provincial Academy Breakthrough',
  'Emerging Ireland Standout',
  'Newly Capped Senior Debutant',
  'Returning / IQ Eligible Exile',
];

export const AddBreakthroughPlayerModal: React.FC<AddBreakthroughPlayerModalProps> = ({
  isOpen,
  onClose,
  positions,
  defaultPositionId = 10,
  onAddPlayerDirect,
  onProposePlayer,
}) => {
  const [selectedPos, setSelectedPos] = useState<number>(defaultPositionId);
  const [name, setName] = useState<string>('');
  const [province, setProvince] = useState<Province>('Leinster');
  const [rating, setRating] = useState<number>(74);
  const [uncapped, setUncapped] = useState<boolean>(true);
  const [stream, setStream] = useState<string>(INTAKE_STREAMS[0]!);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Sync default position if prop updates
  React.useEffect(() => {
    if (defaultPositionId) {
      setSelectedPos(defaultPositionId);
    }
  }, [defaultPositionId]);

  if (!isOpen) return null;

  const handleSubmit = (immediate: boolean) => {
    if (!name.trim()) {
      setError('Please provide the breakthrough player’s name.');
      return;
    }

    const rationale = notes.trim()
      ? `${stream}: ${notes.trim()}`
      : `${stream} breaking through in 2026.`;

    if (immediate) {
      onAddPlayerDirect({
        name: name.trim(),
        pos: selectedPos,
        rating,
        province,
        uncapped,
        notes: rationale,
      });
    } else {
      onProposePlayer({
        type: 'add_player',
        targetPlayerName: name.trim(),
        pos: selectedPos,
        currentValue: 0,
        proposedValue: rating,
        rationale,
        province,
        uncapped,
      });
    }

    setName('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0D6938] text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Add 2026 Breakthrough Player
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register new emerging talent or provincial breakthrough into squad depth
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Position & Player Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Position (1–15)
              </label>
              <select
                value={selectedPos}
                onChange={(e) => setSelectedPos(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
              >
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.num}. {p.name} ({p.abbr})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Player Name
              </label>
              <input
                type="text"
                placeholder="e.g. Brian Gleeson, Ben O'Connor"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D6938]"
              />
            </div>
          </div>

          {/* Provincial Squad Allocation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Provincial Squad Allocation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PROVINCES.map((prov) => {
                const isSelected = province === prov;
                return (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setProvince(prov)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#0D6938] text-white border-transparent shadow-xs font-black'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    {prov}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating Slider & Uncapped Status */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Initial Quality Rating
                </label>
                <span className="text-[10px] text-slate-400">
                  {rating >= 80 ? "International Standard" : rating >= 70 ? "Solid Squad Cover" : "Emerging Prospect"}
                </span>
              </div>
              <div className="text-xl font-black font-mono text-[#0D6938] dark:text-emerald-400">
                {rating}
              </div>
            </div>

            <input
              type="range"
              min="45"
              max="95"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full accent-[#0D6938] cursor-pointer"
            />

            {/* Uncapped checkbox */}
            <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={uncapped}
                onChange={(e) => setUncapped(e.target.checked)}
                className="w-4 h-4 rounded text-[#0D6938] accent-[#0D6938] cursor-pointer"
              />
              <span>Mark as Uncapped Talent (Displays with * badge in squad depth)</span>
            </label>
          </div>

          {/* Breakthrough Intake Stream & Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Breakthrough Pathway
            </label>
            <select
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
            >
              {INTAKE_STREAMS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Scouting Notes / Rationale (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Breakthrough U20 form, excellent ball-carrying, European Cup debut"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D6938]"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer order-2 sm:order-1"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 transition cursor-pointer flex items-center justify-center gap-1.5"
              title="Submit as proposal for community consensus voting"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Submit Proposal</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold bg-[#0D6938] hover:bg-emerald-800 text-white shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Add to Squad</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
