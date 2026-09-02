import React, { useState } from 'react';
import { Snapshot, PlayerEntry, Position } from '../../types/depth';
import { GitCompare, ArrowRight, TrendingUp, Plus, Minus, UserMinus } from 'lucide-react';

interface SnapshotsDiffViewProps {
  snapshots: Snapshot[];
  currentPlayers: PlayerEntry[];
  positions: Position[];
}

export const SnapshotsDiffView: React.FC<SnapshotsDiffViewProps> = ({
  snapshots,
  currentPlayers,
  positions,
}) => {
  const currentSnapshot: Snapshot = {
    id: 'current-live',
    version: 'Current Live Consensus',
    title: 'Current Living Consensus',
    createdAt: new Date().toISOString(),
    createdBy: 'Active Group Debate',
    players: currentPlayers,
  };

  const allSnapshots = [currentSnapshot, ...snapshots];

  const [snapAId, setSnapAId] = useState<string>(snapshots[snapshots.length - 1]?.id ?? 'snapshot-2025-baseline');
  const [snapBId, setSnapBId] = useState<string>('current-live');

  const snapA = allSnapshots.find((s) => s.id === snapAId) ?? allSnapshots[allSnapshots.length - 1]!;
  const snapB = allSnapshots.find((s) => s.id === snapBId) ?? allSnapshots[0]!;

  const posMap = new Map(positions.map((p) => [p.id, p]));

  // Build diff map
  const mapA = new Map(snapA.players.map((p) => [`${p.pos}-${p.name.toLowerCase()}`, p]));
  const mapB = new Map(snapB.players.map((p) => [`${p.pos}-${p.name.toLowerCase()}`, p]));

  // Detect differences
  interface DiffItem {
    type: 'changed' | 'added' | 'removed' | 'retired';
    name: string;
    pos: number;
    posName: string;
    ratingA?: number;
    ratingB?: number;
    delta?: number;
  }

  const diffs: DiffItem[] = [];

  // Check items in B
  mapB.forEach((playerB, key) => {
    const playerA = mapA.get(key);
    const pos = posMap.get(playerB.pos);
    const posName = pos ? `${pos.num}. ${pos.name}` : `Pos ${playerB.pos}`;

    if (!playerA) {
      diffs.push({
        type: 'added',
        name: playerB.name,
        pos: playerB.pos,
        posName,
        ratingB: playerB.rating,
      });
    } else if (playerB.status === 'retired' || playerB.status === 'ineligible') {
      diffs.push({
        type: 'retired',
        name: playerB.name,
        pos: playerB.pos,
        posName,
        ratingA: playerA.rating,
      });
    } else if (playerA.rating !== playerB.rating) {
      diffs.push({
        type: 'changed',
        name: playerB.name,
        pos: playerB.pos,
        posName,
        ratingA: playerA.rating,
        ratingB: playerB.rating,
        delta: playerB.rating - playerA.rating,
      });
    }
  });

  // Check items removed in B
  mapA.forEach((playerA, key) => {
    if (!mapB.has(key)) {
      const pos = posMap.get(playerA.pos);
      const posName = pos ? `${pos.num}. ${pos.name}` : `Pos ${playerA.pos}`;
      diffs.push({
        type: 'removed',
        name: playerA.name,
        pos: playerA.pos,
        posName,
        ratingA: playerA.rating,
      });
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <GitCompare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Version History &amp; Diff Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare any two snapshots of the Ireland rugby squad consensus. Verify who rose, who fell, and what the group re-based.
          </p>
        </div>
      </div>

      {/* Snapshot Selectors */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-1/2 space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Baseline Version (A)
          </label>
          <select
            value={snapAId}
            onChange={(e) => setSnapAId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden"
          >
            {allSnapshots.map((s) => (
              <option key={`a-${s.id}`} value={s.id}>
                {s.version} — {s.title}
              </option>
            ))}
          </select>
        </div>

        <div className="shrink-0 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
          <ArrowRight className="w-4 h-4 hidden sm:block" />
        </div>

        <div className="w-full sm:w-1/2 space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Comparison Version (B)
          </label>
          <select
            value={snapBId}
            onChange={(e) => setSnapBId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden"
          >
            {allSnapshots.map((s) => (
              <option key={`b-${s.id}`} value={s.id}>
                {s.version} — {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diff Output List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Detected Diffs ({diffs.length} changes)
          </span>
        </div>

        {diffs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No differences found between these two versions.
          </div>
        ) : (
          <div className="space-y-2">
            {diffs.map((diff, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {diff.type === 'added' && (
                    <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <Plus className="w-4 h-4" />
                    </span>
                  )}
                  {diff.type === 'retired' && (
                    <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      <UserMinus className="w-4 h-4" />
                    </span>
                  )}
                  {diff.type === 'changed' && (
                    <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                  )}
                  {diff.type === 'removed' && (
                    <span className="p-1.5 rounded-lg bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                      <Minus className="w-4 h-4" />
                    </span>
                  )}

                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {diff.name}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                      ({diff.posName})
                    </span>
                  </div>
                </div>

                <div className="shrink-0 font-mono font-bold">
                  {diff.type === 'added' && (
                    <span className="text-[#0D6938] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                      NEW Entry (Rating {diff.ratingB})
                    </span>
                  )}
                  {diff.type === 'retired' && (
                    <span className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                      Archived / Retired
                    </span>
                  )}
                  {diff.type === 'changed' && (
                    <span className="flex items-center gap-1">
                      <span className="text-slate-400 line-through">{diff.ratingA}</span>
                      <span>→</span>
                      <span className="text-[#0D6938] dark:text-emerald-400">{diff.ratingB}</span>
                      <span className={`text-[11px] font-bold ${diff.delta && diff.delta > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        ({diff.delta && diff.delta > 0 ? `+${diff.delta}` : diff.delta})
                      </span>
                    </span>
                  )}
                  {diff.type === 'removed' && (
                    <span className="text-red-600">Removed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
