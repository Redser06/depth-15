import React from 'react';
import { StarterConflict, TacticalTradeoff } from '../../types/depth';
import { AlertTriangle, Sparkles, Check, Shield, MessageSquarePlus } from 'lucide-react';

interface SelectionConflictBannerProps {
  conflicts: StarterConflict[];
  tradeoffs: TacticalTradeoff[];
  starterAssignments: Record<string, number>;
  onAssignStarter: (playerName: string, posId: number) => void;
  onStartDebate?: (playerName: string, posId: number, rationale: string) => void;
  unresolvedPositions?: number[];
}

export const SelectionConflictBanner: React.FC<SelectionConflictBannerProps> = ({
  conflicts,
  tradeoffs,
  starterAssignments,
  onAssignStarter,
  onStartDebate,
  unresolvedPositions = [],
}) => {
  if (conflicts.length === 0 && unresolvedPositions.length === 0) return null;

  return (
    <div className="space-y-4">
      {unresolvedPositions.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-400 dark:border-amber-600 flex items-start gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-sm text-amber-950 dark:text-amber-200">
              Vacated Shirt Warning: {unresolvedPositions.length} position(s) have no eligible starter
            </h3>
            <p className="text-xs text-amber-900/90 dark:text-amber-300/90 mt-0.5">
              Positions <strong>{unresolvedPositions.join(', ')}</strong> have no unassigned active contenders available to start. Check tactical assignments or promote a backup contender.
            </p>
          </div>
        </div>
      )}
      {conflicts.map((conflict) => {
        const tradeoff = tradeoffs.find(
          (t) => t.playerName.toLowerCase().trim() === conflict.playerName.toLowerCase().trim()
        );
        const assignedPos =
          starterAssignments[conflict.playerName] ??
          starterAssignments[conflict.playerName.toLowerCase().trim()] ??
          conflict.currentAssignedPos;

        return (
          <div
            key={conflict.playerName}
            className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/80 shadow-sm space-y-4"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                      Starter Selection Conflict: {conflict.playerName}
                    </h3>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                      Rule: Cannot start in 2 positions
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {conflict.playerName} is the highest-rated contender across multiple positions:{' '}
                    <strong>
                      {conflict.positions.map((p) => `${p.posName} (${p.rating})`).join(' and ')}
                    </strong>
                    . You must designate exactly one starting shirt.
                  </p>
                </div>
              </div>
            </div>

            {/* Tactical Opportunity Cost Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {conflict.positions.map((pos) => {
                const isSelected = assignedPos === pos.posId;
                const pairedOption = tradeoff?.options.find((o) => o.assignedPos === pos.posId);
                const isOptimal = tradeoff?.bestOptionPos === pos.posId;

                return (
                  <div
                    key={pos.posId}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-[#0D6938] dark:border-emerald-500 ring-2 ring-[#0D6938]/20 shadow-md'
                        : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-amber-400'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-[#0F1E36] dark:bg-slate-800 text-white font-bold text-xs flex items-center justify-center font-mono shrink-0">
                            {pos.posId}
                          </span>
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            Starts at {pos.posName}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          {isOptimal && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                              <Sparkles className="w-3 h-3" /> Max ({pairedOption?.combinedScore})
                            </span>
                          )}
                          <span className="font-mono font-black text-sm text-[#0D6938] dark:text-emerald-400">
                            Rating {pos.rating}
                          </span>
                        </div>
                      </div>

                      {/* Drop-off & Pair Analysis */}
                      {pairedOption && (
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 text-xs space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-1 text-slate-600 dark:text-slate-300">
                            <span className="font-medium">Vacated Cover:</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {pairedOption.backupStarterName} ({pairedOption.backupStarterRating})
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500">
                            <span>Drop-off Gap:</span>
                            <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                              -{pairedOption.backupDropoff} pts at {pairedOption.alternativePosName}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-1 mt-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Net Pair:</span>
                            <span className="font-mono font-black text-slate-900 dark:text-white">
                              {pos.rating} + {pairedOption.backupStarterRating} = {pairedOption.combinedScore}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                      <button
                        onClick={() => onAssignStarter(conflict.playerName, pos.posId)}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#0D6938] text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-800'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{isSelected ? 'Current Starter Choice' : `Start at ${pos.posName}`}</span>
                      </button>

                      {onStartDebate && (
                        <button
                          onClick={() =>
                            onStartDebate(
                              conflict.playerName,
                              pos.posId,
                              `Tactical selection debate: Should ${conflict.playerName} start at ${pos.posName} (Rating ${pos.rating}) where our backup drop-off at ${pairedOption?.alternativePosName} is ${pairedOption?.backupDropoff} pts to ${pairedOption?.backupStarterName}?`
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Open formal selection debate proposal"
                        >
                          <MessageSquarePlus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {tradeoff && (
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-amber-200 dark:border-amber-800/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#0D6938] shrink-0 mt-0.5" />
                <span>{tradeoff.explanation}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
