import React, { useState } from 'react';
import { Position, PlayerEntry, Proposal } from '../../types/depth';
import { calculateDepthScore, getDepthBand } from '../../lib/depthCalc';
import { PlayerRow } from '../chart/PlayerRow';
import { ChevronLeft, ChevronRight, MessageSquare, PlusCircle, ShieldAlert } from 'lucide-react';

interface PubModeViewProps {
  positions: Position[];
  playersByPos: Record<number, PlayerEntry[]>;
  selectedPosId: number;
  onSelectPosId: (id: number) => void;
  onChallengePlayer: (player: PlayerEntry) => void;
  onAddPlayer: (pos: Position) => void;
  openProposals: Proposal[];
  onViewProposal: (prop: Proposal) => void;
  onReorderLadder?: (posId: number, playerIds: string[]) => void;
}

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
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const currentPos = positions.find((p) => p.id === selectedPosId) ?? positions[0]!;
  const players = playersByPos[currentPos.id] ?? [];
  const depth = calculateDepthScore(players);
  const band = getDepthBand(depth);

  const prevPos = () => {
    const nextId = selectedPosId === 1 ? 15 : selectedPosId - 1;
    onSelectPosId(nextId);
  };

  const nextPos = () => {
    const nextId = selectedPosId === 15 ? 1 : selectedPosId + 1;
    onSelectPosId(nextId);
  };

  const posProposals = openProposals.filter((p) => p.pos === currentPos.id);

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
      onReorderLadder(currentPos.id, reordered.map((p) => p.id));
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
              Ranked ladder &amp; consensus quality ratings (drag to rank)
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
      </div>

      {/* Players Ladder List with Drag and Drop */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Position Ladder ({players.length}) — Drag to Rank
          </span>
          <button
            onClick={() => onAddPlayer(currentPos)}
            className="flex items-center gap-1 text-xs font-bold text-[#0D6938] dark:text-emerald-400 hover:underline"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Contender</span>
          </button>
        </div>

        {players.map((player, idx) => (
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
        ))}
      </div>
    </div>
  );
};
