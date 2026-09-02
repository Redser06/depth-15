import React from 'react';
import { RatingSpread } from '../../types/depth';
import { AlertCircle } from 'lucide-react';

interface SpreadBarProps {
  rating: number;
  spread?: RatingSpread;
  isContested?: boolean;
  disputeCount?: number;
  barColor?: string;
  compact?: boolean;
}

export const SpreadBar: React.FC<SpreadBarProps> = ({
  rating,
  spread,
  isContested,
  disputeCount,
  barColor = '#16A34A',
  compact = false,
}) => {
  const min = spread?.min ?? Math.max(40, rating - 2);
  const max = spread?.max ?? Math.min(99, rating + 2);
  const spreadWidth = max - min;
  const isWideSpread = spreadWidth >= 8;

  // Percentage within the 40-100 rating spectrum for the visual track
  const minPercent = Math.max(0, Math.min(100, ((min - 40) / 60) * 100));
  const maxPercent = Math.max(0, Math.min(100, ((max - 40) / 60) * 100));
  const ratingPercent = Math.max(0, Math.min(100, ((rating - 40) / 60) * 100));

  if (compact) {
    return (
      <div className="flex items-center gap-1.5" title={`Spread: ${min}–${max} (±${Math.round(spreadWidth / 2)})`}>
        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden">
          {/* Spread zone */}
          <div
            className={`absolute top-0 bottom-0 rounded-full ${isContested ? 'bar-contested' : 'bg-emerald-300 dark:bg-emerald-700 opacity-60'}`}
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(8, maxPercent - minPercent)}%`,
            }}
          />
          {/* Central consensus dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white dark:border-slate-900"
            style={{
              left: `calc(${ratingPercent}% - 4px)`,
              backgroundColor: barColor,
            }}
          />
        </div>
        <span className={`text-[10px] font-mono ${isWideSpread || isContested ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}`}>
          ±{Math.round(spreadWidth / 2)}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Consensus Spread:</span>
          <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
            {min} — {max}
          </span>
          {isWideSpread && (
            <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
              High Variance (±{Math.round(spreadWidth / 2)})
            </span>
          )}
          {isContested && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-slate-950 shadow-xs">
              <AlertCircle className="w-2.5 h-2.5" />
              Contested ({disputeCount ?? 1} disputes)
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {spread?.voteCount ?? 5} votes
        </span>
      </div>

      {/* Visual Error Bar Track */}
      <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
        {/* Whisker line from min to max */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full ${
            isContested
              ? 'bar-contested'
              : isWideSpread
              ? 'bg-amber-400/70 dark:bg-amber-600/70'
              : 'bg-emerald-400/80 dark:bg-emerald-600/80'
          }`}
          style={{
            left: `${minPercent}%`,
            width: `${Math.max(6, maxPercent - minPercent)}%`,
          }}
        />

        {/* Left bracket (min) */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-500 dark:bg-slate-400"
          style={{ left: `${minPercent}%` }}
        />

        {/* Right bracket (max) */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-500 dark:bg-slate-400"
          style={{ left: `${maxPercent}%` }}
        />

        {/* Center marker (Rating) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center -translate-x-1/2 z-10"
          style={{
            left: `${ratingPercent}%`,
            backgroundColor: barColor,
          }}
        >
          <div className="w-1 h-1 rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
};
