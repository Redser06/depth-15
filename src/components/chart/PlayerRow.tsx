import React from 'react';
import { PlayerEntry } from '../../types/depth';
import { getRatingTier } from '../../lib/depthCalc';
import { SpreadBar } from './SpreadBar';
import { MessageSquarePlus, GripVertical, ChevronUp, ChevronDown, Shield } from 'lucide-react';

interface PlayerRowProps {
  player: PlayerEntry;
  rank: number;
  onChallenge: (player: PlayerEntry) => void;
  compact?: boolean;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  dragHandleProps?: Record<string, any>;
}

export const PlayerRow: React.FC<PlayerRowProps> = ({
  player,
  rank,
  onChallenge,
  compact = false,
  isDraggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  dragHandleProps,
}) => {
  const { tier, pillClass, badgeColor } = getRatingTier(player.rating);

  // Rank styling
  const rankBg =
    rank === 1
      ? 'bg-[#0D6938] text-white shadow-xs'
      : rank === 2
      ? 'bg-slate-700 text-white dark:bg-slate-700'
      : rank === 3
      ? 'bg-slate-500 text-white dark:bg-slate-600'
      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  const provincePill = {
    Leinster: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    Munster: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
    Ulster: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    Connacht: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    Exile: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    Other: 'bg-slate-100 text-slate-700 border-slate-200',
  }[player.province ?? 'Other'];

  if (compact) {
    return (
      <div
        draggable={isDraggable}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition group cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 min-w-0">
          {isDraggable && (
            <div
              {...dragHandleProps}
              className="touch-none cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Drag to reorder ladder"
            >
              <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0" />
            </div>
          )}
          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${rankBg}`}>
            {rank}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                {player.name}
              </span>
              {player.uncapped && (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400" title="Uncapped player">
                  *
                </span>
              )}
              {player.secondary && (
                <span className="px-1 py-0.2 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                  2nd
                </span>
              )}
              {player.startsAtOtherPos && (
                <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                  Starts #{player.startsAtOtherPos}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SpreadBar rating={player.rating} spread={player.spread} isContested={player.isContested} barColor={badgeColor} compact />
          <span
            className="w-8 py-0.5 rounded text-center text-xs font-bold text-white shadow-xs"
            style={{ backgroundColor: badgeColor }}
          >
            {player.rating}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`p-3 rounded-xl border transition-all relative group ${
        player.isContested
          ? 'border-amber-300 dark:border-amber-700/80 bg-amber-50/40 dark:bg-amber-950/10'
          : player.startsAtOtherPos
          ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/40 opacity-90'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Left: Drag Handle, Rank, Name & Tags */}
        <div className="flex items-start gap-2 min-w-0">
          {/* Drag Handle & Up/Down Steppers */}
          {isDraggable && (
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <div
                {...dragHandleProps}
                className="touch-none cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Drag to reorder ladder"
              >
                <GripVertical className="w-4 h-4" />
              </div>

              {(canMoveUp || canMoveDown) && (
                <div className="flex flex-col">
                  {canMoveUp && onMoveUp && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp();
                      }}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                      title="Move up rank"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  )}
                  {canMoveDown && onMoveDown && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown();
                      }}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                      title="Move down rank"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${rankBg}`}>
            {rank}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                {player.name}
              </h4>
              {player.uncapped && (
                <span
                  className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300"
                  title="Uncapped Player"
                >
                  * Uncapped
                </span>
              )}
              {player.secondary && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                  2nd Pos Cover
                </span>
              )}
              {player.province && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${provincePill}`}>
                  {player.province}
                </span>
              )}
            </div>

            {/* Starts elsewhere badge */}
            {player.startsAtOtherPos && (
              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800 w-fit">
                <Shield className="w-3 h-3 text-amber-600" />
                <span>Starts at Position {player.startsAtOtherPos} · Cover Only Here</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-[10px] border ${pillClass}`}>
                {tier}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                {player.lastReviewed}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Rating Pill & Propose Button */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <div
              className="px-2.5 py-1 rounded-lg text-sm font-extrabold text-white shadow-xs font-mono"
              style={{ backgroundColor: badgeColor }}
            >
              {player.rating}
            </div>
          </div>

          <button
            onClick={() => onChallenge(player)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition shadow-xs"
            title="Propose a rating change or challenge"
          >
            <MessageSquarePlus className="w-3 h-3" />
            <span>Challenge</span>
          </button>
        </div>
      </div>

      {/* Spread Bar Error Bar */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <SpreadBar
          rating={player.rating}
          spread={player.spread}
          isContested={player.isContested}
          disputeCount={player.disputeCount}
          barColor={badgeColor}
        />
      </div>
    </div>
  );
};
