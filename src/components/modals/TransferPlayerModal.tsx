import React, { useState } from 'react';
import { PlayerEntry, Province, PROVINCES } from '../../types/depth';
import { X, ArrowRightLeft, Check, AlertCircle, Sparkles } from 'lucide-react';

interface TransferPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player?: PlayerEntry;
  allPlayers: PlayerEntry[];
  onTransferDirect: (playerName: string, newProvince: Province, notes?: string) => void;
  onProposeTransfer: (data: {
    targetPlayerName: string;
    pos: number;
    currentProvince: string;
    newProvince: Province;
    rationale: string;
  }) => void;
}

const PROVINCE_THEMES: Record<Province, { bg: string; text: string; border: string; accent: string }> = {
  Leinster: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-800',
    accent: 'border-blue-600 bg-blue-600',
  },
  Munster: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-200 dark:border-red-800',
    accent: 'border-red-600 bg-red-600',
  },
  Ulster: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-800 dark:text-slate-200',
    border: 'border-slate-300 dark:border-slate-700',
    accent: 'border-slate-600 bg-slate-600',
  },
  Connacht: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-800 dark:text-emerald-200',
    border: 'border-emerald-200 dark:border-emerald-800',
    accent: 'border-[#0D6938] bg-[#0D6938]',
  },
  Exile: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-800 dark:text-purple-200',
    border: 'border-purple-200 dark:border-purple-800',
    accent: 'border-purple-600 bg-purple-600',
  },
  Other: {
    bg: 'bg-slate-50 dark:bg-slate-850',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-750',
    accent: 'border-slate-500 bg-slate-500',
  },
};

export const TransferPlayerModal: React.FC<TransferPlayerModalProps> = ({
  isOpen,
  onClose,
  player,
  allPlayers,
  onTransferDirect,
  onProposeTransfer,
}) => {
  // Deduplicate unique player names from allPlayers
  const uniquePlayerNames = React.useMemo(() => {
    const map = new Map<string, PlayerEntry>();
    allPlayers.forEach((p) => {
      const key = p.name.toLowerCase().trim();
      if (!map.has(key)) map.set(key, p);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allPlayers]);

  const [selectedPlayerName, setSelectedPlayerName] = useState<string>(player?.name ?? (uniquePlayerNames[0]?.name || ''));
  const activePlayer = player ?? uniquePlayerNames.find((p) => p.name.toLowerCase() === selectedPlayerName.toLowerCase()) ?? uniquePlayerNames[0];

  const currentProvince = (activePlayer?.province ?? 'Other') as Province;
  const [targetProvince, setTargetProvince] = useState<Province>(currentProvince);
  const [rationale, setRationale] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Sync if player prop changes
  React.useEffect(() => {
    if (player) {
      setSelectedPlayerName(player.name);
      setTargetProvince(player.province ?? 'Other');
    }
  }, [player]);

  if (!isOpen) return null;

  const handleExecuteTransfer = (immediate: boolean) => {
    if (!activePlayer) {
      setError('Please select a player to transfer.');
      return;
    }
    if (targetProvince === currentProvince) {
      setError(`Player is already allocated to ${currentProvince}. Please choose a different provincial squad.`);
      return;
    }

    if (immediate) {
      onTransferDirect(activePlayer.name, targetProvince, rationale.trim());
    } else {
      onProposeTransfer({
        targetPlayerName: activePlayer.name,
        pos: activePlayer.pos,
        currentProvince,
        newProvince: targetProvince,
        rationale: rationale.trim() || `Transferred ${activePlayer.name} from ${currentProvince} to ${targetProvince}.`,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0D6938] text-white flex items-center justify-center shadow-xs">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Transfer &amp; Squad Reallocation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update provincial squad registration for 2025/2026 transfers
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

          {/* Player Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Player to Transfer
            </label>
            {player ? (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {player.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Rating {player.rating} · Position {player.pos}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${PROVINCE_THEMES[currentProvince]?.bg} ${PROVINCE_THEMES[currentProvince]?.text} ${PROVINCE_THEMES[currentProvince]?.border}`}>
                  {currentProvince}
                </span>
              </div>
            ) : (
              <select
                value={selectedPlayerName}
                onChange={(e) => {
                  setSelectedPlayerName(e.target.value);
                  const p = uniquePlayerNames.find((x) => x.name === e.target.value);
                  if (p?.province) setTargetProvince(p.province as Province);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
              >
                {uniquePlayerNames.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.province ?? 'Other'}) — Pos {p.pos}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Province Allocation Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Select New Provincial Squad</span>
              <span className="text-[11px] font-normal text-slate-400">
                Current: <strong className="text-slate-700 dark:text-slate-300">{currentProvince}</strong>
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROVINCES.map((prov) => {
                const theme = PROVINCE_THEMES[prov];
                const isSelected = targetProvince === prov;
                const isCurrent = currentProvince === prov;

                return (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => {
                      setTargetProvince(prov);
                      setError(null);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-[#0D6938] border-transparent bg-emerald-50 dark:bg-emerald-950/40 shadow-xs'
                        : `${theme.bg} ${theme.border} hover:opacity-90`
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-black ${theme.text}`}>
                        {prov}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {isCurrent ? 'Current squad' : 'Transfer target'}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#0D6938] dark:text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transfer Context / Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Transfer Reason or Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Transferred for 2025/26 season, overseas loan, corrected data..."
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D6938]"
            />
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {['Transferred province for game-time', 'Moved abroad (Exile / Top14)', 'Corrected baseline allocation', 'Provincial Academy graduate'].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setRationale(quick)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  {quick}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer / Two Actions */}
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
              onClick={() => handleExecuteTransfer(false)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 transition cursor-pointer flex items-center justify-center gap-1.5"
              title="Submit as proposal for community consensus vote"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Submit Proposal</span>
            </button>

            <button
              type="button"
              onClick={() => handleExecuteTransfer(true)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold bg-[#0D6938] hover:bg-emerald-800 text-white shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Transfer Immediately</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
