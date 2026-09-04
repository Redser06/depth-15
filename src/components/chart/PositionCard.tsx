import React from 'react';
import { Position, PlayerEntry } from '../../types/depth';
import { calculateDepthScore, getDepthBand } from '../../lib/depthCalc';
import { PlayerRow } from './PlayerRow';
import { PlusCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PositionCardProps {
  position: Position;
  players: PlayerEntry[];
  onChallengePlayer: (player: PlayerEntry) => void;
  onAddPlayer: (pos: Position) => void;
  onOpenPubView?: (posId: number) => void;
  onReorderLadder?: (posId: number, orderedPlayerIds: string[]) => void;
  isVacant?: boolean;
}

interface SortablePlayerRowProps {
  player: PlayerEntry;
  rank: number;
  onChallenge: (player: PlayerEntry) => void;
  isDraggable: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const SortablePlayerRow: React.FC<SortablePlayerRowProps> = ({ player, isDraggable, ...rest }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id, disabled: !isDraggable });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isDraggable ? attributes : {})}
      {...(isDraggable ? listeners : {})}
      className={isDraggable ? 'touch-manipulation' : ''}
    >
      <PlayerRow
        {...rest}
        player={player}
        isDraggable={isDraggable}
      />
    </div>
  );
};

export const PositionCard: React.FC<PositionCardProps> = ({
  position,
  players,
  onChallengePlayer,
  onAddPlayer,
  onOpenPubView,
  onReorderLadder,
  isVacant = false,
}) => {
  const depth = calculateDepthScore(players);
  const band = getDepthBand(depth);
  const isVulnerable = depth < 70;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorderLadder) {
      const oldIndex = players.findIndex((p) => p.id === active.id);
      const newIndex = players.findIndex((p) => p.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(players, oldIndex, newIndex);
        onReorderLadder(position.id, reordered.map((p) => p.id));
      }
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!onReorderLadder) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= players.length) return;

    const reordered = arrayMove(players, index, targetIndex);
    onReorderLadder(position.id, reordered.map((p) => p.id));
  };

  return (
    <div className={`rounded-2xl border transition-all shadow-sm overflow-hidden flex flex-col ${
      isVacant
        ? 'border-amber-400 dark:border-amber-500 bg-white dark:bg-slate-900 ring-2 ring-amber-400/30'
        : isVulnerable
        ? 'border-red-300 dark:border-red-900 bg-white dark:bg-slate-900 ring-1 ring-red-400/20'
        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
    }`}>
      {/* Vacant Shirt Warning Banner */}
      {isVacant && (
        <div className="bg-amber-500/15 border-b border-amber-300 dark:border-amber-700/80 px-3.5 py-2 flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>⚠ Shirt Vacant: No eligible starter — all contenders assigned elsewhere</span>
        </div>
      )}

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
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                {position.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${band.border} ${band.color} bg-white dark:bg-slate-800`}>
                {band.label}
              </span>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                Score: <strong className="text-slate-700 dark:text-slate-300">{depth}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {onOpenPubView && (
            <button
              onClick={() => onOpenPubView(position.id)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Focus in Pub Mode"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Players Depth Ladder */}
      <div className="p-3 space-y-2 flex-1">
        {players.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 font-medium">
            No active players assigned to this position.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={players.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              {players.map((player, idx) => (
                <SortablePlayerRow
                  key={player.id}
                  player={player}
                  rank={idx + 1}
                  onChallenge={onChallengePlayer}
                  isDraggable={Boolean(onReorderLadder)}
                  canMoveUp={idx > 0}
                  canMoveDown={idx < players.length - 1}
                  onMoveUp={() => handleMove(idx, 'up')}
                  onMoveDown={() => handleMove(idx, 'down')}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Footer / Quick Add */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-850/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          {players.length} contenders listed (touch drag or arrows)
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
