import React, { useState } from 'react';
import { Proposal, Member, Position } from '../../types/depth';
import { ProposalCard } from './ProposalCard';
import { PlusCircle, MessageSquare } from 'lucide-react';

interface ProposalListProps {
  proposals: Proposal[];
  activeMember: Member;
  positions: Position[];
  onVote: (proposalId: string, choice: 'support' | 'challenge', counterValue?: number, rationale?: string) => void;
  onComment: (proposalId: string, text: string) => void;
  onResolveManually?: (proposalId: string) => void;
  onOpenCreateModal: () => void;
}

export const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  activeMember,
  positions,
  onVote,
  onComment,
  onResolveManually,
  onOpenCreateModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'open' | 'passed' | 'failed'>('open');

  const filtered = proposals.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const posMap = new Map(positions.map((pos) => [pos.id, pos]));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with Filters & Create Button */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#0D6938]" />
            <span>Squad Debates &amp; Votes</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Every rating change must be argued and voted on. Quorum is 50%; resolution is the median counter-value.
          </p>
        </div>

        {activeMember.role !== 'lurker' && (
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-emerald-800 text-white transition shadow-sm active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Proposal</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'open', label: `Open Votes (${proposals.filter((p) => p.status === 'open').length})` },
          { id: 'all', label: `All Proposals (${proposals.length})` },
          { id: 'passed', label: `Passed (${proposals.filter((p) => p.status === 'passed').length})` },
          { id: 'failed', label: `Contested (${proposals.filter((p) => p.status === 'failed').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              filter === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          No proposals found for this filter. Click "New Proposal" to challenge a rating or add a contender!
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((prop) => (
            <ProposalCard
              key={prop.id}
              proposal={prop}
              activeMember={activeMember}
              position={posMap.get(prop.pos)}
              onVote={onVote}
              onComment={onComment}
              onResolveManually={onResolveManually}
            />
          ))}
        </div>
      )}
    </div>
  );
};
