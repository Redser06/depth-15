import React from 'react';
import { Position, PlayerEntry, Proposal } from '../../types/depth';
import { calculateDepthScore, getDepthBand } from '../../lib/depthCalc';
import { PlayerRow } from '../chart/PlayerRow';
import {
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  PlusCircle,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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

interface PubModeViewProps {
  positions: Position[];
  playersByPos: Record<number, PlayerEntry[]>;
  selectedPosId: number;
  onSelectPosId: (posId: number) => void;
  onChallengePlayer: (player: PlayerEntry) => void;
  onAddPlayer: (pos: Position) => void;
  openProposals: Proposal[];
  onViewProposal: (proposal: Proposal) => void;
  onReorderLadder?: (posId: number, orderedPlayerIds: string[]) => void;
  unresolvedPositions?: number[];
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

const SortablePlayerRow: React.FC<SortablePlayerRowProps> = ({ player, ...rest }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <PlayerRow
        {...rest}
        player={player}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export const PubModeView: React.FC<PubModeViewProps> = ({
  positions,
  playersByPos,
  selectedPosId,
  onSelectPosId,
  onChallengePlayer,
  onAddPlayer,
  openProposals,
  onViewProposal,
  onReorderLadder,
  unresolvedPositions = [],
}) => {
  const currentPos = positions.find((p) => p.id === selectedPosId) ?? positions[0]!;
  const players = playersByPos[currentPos.id] ?? [];
  const depth = calculateDepthScore(players);
  const band = getDepthBand(depth);
  const isVacant = unresolvedPositions.includes(currentPos.id);

  const prevPos = () => {
    const nextId = selectedPosId === 1 ? 15 : selectedPosId - 1;
    onSelectPosId(nextId);
  };

  const nextPos = () => {
    const nextId = selectedPosId === 15 ? 1 : selectedPosId + 1;
    onSelectPosId(nextId);
  };

  const posProposals = openProposals.filter((p) => p.pos === currentPos.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorderLadder) {
      const oldIndex = players.findIndex((p) => p.id === active.id);
      const newIndex = players.findIndex((p) => p.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(players, oldIndex, newIndex);
        onReorderLadder(currentPos.id, reordered.map((p) => p.id));
      }
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!onReorderLadder) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= players.length) return;

    const reordered = arrayMove(players, index, targetIndex);
    onReorderLadder(currentPos.id, reordered.map((p) => p.id));
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Pub Position Quick Stepper Carousel Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm flex items-center justify-between gap-2">
        <button
          onClick={prevPos}
          className="p-2.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1 active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Center Position Selector Dropdown / Name */}
        <div className="flex-1 text-center min-w-0">
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-[#0D6938] text-white text-xs font-bold flex items-center justify-center font-mono">
              {currentPos.num}
            </span>
            <select
              value={selectedPosId}
              onChange={(e) => onSelectPosId(Number(e.target.value))}
              aria-label="Current position"
              className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white bg-transparent text-center focus:outline-hidden cursor-pointer"
            >
              {positions.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {p.num}. {p.name} ({p.abbr})
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {currentPos.group} · {players.length} in ladder
          </p>
        </div>

        <button
          onClick={nextPos}
          className="p-2.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1 active:scale-95 transition"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Position Depth Score Banner */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {currentPos.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {currentPos.abbr}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked ladder &amp; consensus quality ratings (touch drag or arrows)
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              {depth < 70 && (
                <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
              )}
              <span
                className="text-2xl sm:text-3xl font-black font-mono px-3 py-1 rounded-xl text-white shadow-xs"
                style={{ backgroundColor: band.color }}
              >
                {depth}
              </span>
            </div>
            <span
              className="text-[11px] font-bold uppercase tracking-wider mt-1"
              style={{ color: band.color }}
            >
              {band.label} Depth
            </span>
          </div>
        </div>

        {/* Live debate notice if active proposals exist */}
        {posProposals.length > 0 && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="text-xs text-amber-900 dark:text-amber-200 font-medium truncate">
                <strong>Live Dispute:</strong> {posProposals[0]?.targetPlayerName} ({posProposals[0]?.currentValue} → {posProposals[0]?.proposedValue})
              </div>
            </div>
            <button
              onClick={() => onViewProposal(posProposals[0]!)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 shrink-0 transition"
            >
              Vote
            </button>
          </div>
        )}

        {/* Vacated Shirt Warning in Pub Mode */}
        {isVacant && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-300 dark:border-amber-700/80 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-xs text-amber-950 dark:text-amber-200">
                ⚠ Position Shirt Vacant
              </h4>
              <p className="text-[11px] text-amber-900/90 dark:text-amber-300/90 mt-0.5">
                Every contender in this position is currently starting in another shirt. No eligible #1 starter available.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Players Ladder List with Touch & Pointer Drag and Drop */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Position Ladder ({players.length}) — Touch Drag or Arrows
          </span>
          <button
            onClick={() => onAddPlayer(currentPos)}
            className="flex items-center gap-1 text-xs font-bold text-[#0D6938] dark:text-emerald-400 hover:underline"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Contender</span>
          </button>
        </div>

        {players.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 font-medium bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
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
    </div>
  );
};
