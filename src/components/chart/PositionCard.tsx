import React, { useState } from 'react';
import { Position, PlayerEntry } from '../../types/depth';
import { calculateDepthScore, getDepthBand } from '../../lib/depthCalc';
import { PlayerRow } from './PlayerRow';
import { PlusCircle, ShieldAlert } from 'lucide-react';

interface PositionCardProps {
  position: Position;
  players: PlayerEntry[];
  onChallengePlayer: (player: PlayerEntry) => void;
  onAddPlayer: (pos: Position) => void;
  onOpenPubView: (posId: number) => void;
  onReorderLadder?: (posId: number, playerIds: string[]) => void;
}

export const PositionCard: React.FC<PositionCardProps> = ({
  position,
  players,
  onChallengePlayer,
  onAddPlayer,
  onOpenPubView,
  onReorderLadder,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const depth = calculateDepthScore(players);
  const band = getDepthBand(depth);
  const isVulnerable = depth < 70;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', `${index}`);
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggedIndex ?? Number(e.dataTransfer.getData('text/plain'));
    if (isNaN(sourceIndex) || sourceIndex === targetIndex || !onReorderLadder) {
      setDraggedIndex(null);
      return;
    }

    const reordered = [...players];
    const [moved] = reordered.splice(sourceIndex, 1);
    if (moved) {
      reordered.splice(targetIndex, 0, moved);
      onReorderLadder(position.id, reordered.map((p) => p.id));
    }
    setDraggedIndex(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!onReorderLadder) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= players.length) return;

    const reordered = [...players];
    const temp = reordered[index]!;
    reordered[index] = reordered[targetIndex]!;
    reordered[targetIndex] = temp;

    onReorderLadder(position.id, reordered.map((p) => p.id));
  };

  return (
    <div className={`rounded-2xl border transition-all shadow-sm overflow-hidden flex flex-col ${
      isVulnerable
        ? 'border-red-300 dark:border-red-900 bg-white dark:bg-slate-900 ring-1 ring-red-400/20'
        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
    }`}>
      {/* Position Header Banner */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-850/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#0F1E36] dark:bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-xs border border-slate-700/50">
            {position.num}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                {position.abbr}
              </span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {position.group}
              </span>
            </div>
            <button
              onClick={() => onOpenPubView(position.id)}
              className="text-left font-extrabold text-slate-900 dark:text-slate-100 hover:text-[#0D6938] dark:hover:text-emerald-400 text-sm sm:text-base leading-tight truncate transition"
              title="Open focused pub mode for this position"
            >
              {position.name}
            </button>
          </div>
        </div>

        {/* Depth Score Block */}
        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-center gap-1.5">
            {isVulnerable && (
              <span title="Depth under 70 - Vulnerable">
                <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
              </span>
            )}
            <span
              className="px-2.5 py-0.5 rounded-lg text-sm sm:text-base font-extrabold text-white font-mono shadow-xs"
              style={{ backgroundColor: band.color }}
            >
              {depth}
            </span>
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-wider mt-0.5"
            style={{ color: band.color }}
          >
            {band.label}
          </span>
        </div>
      </div>

      {/* Depth Score Visual Progress bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 relative overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${Math.min(100, (depth / 100) * 100)}%`,
            backgroundColor: band.color,
          }}
        />
      </div>

      {/* Players Ladder (Drag and Drop Supported) */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col gap-2">
        {players.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No active players assigned to this position.
          </div>
        ) : (
          players.map((player, idx) => (
            <PlayerRow
              key={player.id}
              player={player}
              rank={idx + 1}
              onChallenge={onChallengePlayer}
              isDraggable={Boolean(onReorderLadder)}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
              canMoveUp={idx > 0}
              canMoveDown={idx < players.length - 1}
              onMoveUp={() => handleMove(idx, 'up')}
              onMoveDown={() => handleMove(idx, 'down')}
            />
          ))
        )}
      </div>

      {/* Footer / Quick Add */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-850/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          {players.length} contenders listed (drag to rank)
        </span>

        <button
          onClick={() => onAddPlayer(position)}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#0D6938] dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 py-1 px-2 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Player</span>
        </button>
      </div>
    </div>
  );
};
