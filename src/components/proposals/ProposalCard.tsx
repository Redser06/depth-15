import React, { useState } from 'react';
import { Proposal, Member, Position } from '../../types/depth';
import { evaluateProposal } from '../../lib/consensusEngine';
import { ThumbsUp, ThumbsDown, MessageSquare, Clock, CheckCircle2, XCircle, Send, ShieldCheck, Scale, AlertCircle } from 'lucide-react';

interface ProposalCardProps {
  proposal: Proposal;
  activeMember: Member;
  position?: Position;
  onVote: (proposalId: string, choice: 'support' | 'challenge', counterValue?: number, rationale?: string) => void;
  onComment: (proposalId: string, text: string) => void;
  onResolveManually?: (proposalId: string) => void;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  activeMember,
  position,
  onVote,
  onComment,
  onResolveManually,
}) => {
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [voteChoice, setVoteChoice] = useState<'support' | 'challenge'>('support');
  const [counterValue, setCounterValue] = useState<number>(
    typeof proposal.proposedValue === 'number' ? proposal.proposedValue : 80
  );
  const [voteRationale, setVoteRationale] = useState('');
  const [commentText, setCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

  const evaluation = evaluateProposal(proposal, 6);
  const userVote = proposal.votes.find((v) => v.memberId === activeMember.id);

  const handleVoteSubmit = (choice: 'support' | 'challenge') => {
    onVote(proposal.id, choice, counterValue, voteRationale.trim() || undefined);
    setShowCounterInput(false);
    setVoteRationale('');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(proposal.id, commentText);
    setCommentText('');
  };

  const isResolved = proposal.status === 'passed' || proposal.status === 'failed';

  return (
    <div className={`rounded-2xl border transition shadow-sm overflow-hidden bg-white dark:bg-slate-900 ${
      proposal.status === 'passed'
        ? 'border-emerald-200 dark:border-emerald-800'
        : proposal.status === 'failed'
        ? 'border-red-200 dark:border-red-800'
        : 'border-slate-200 dark:border-slate-800'
    }`}>
      {/* Top Banner Status */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-500 dark:text-slate-400 font-bold">
            Pos {proposal.pos} {position ? `(${position.abbr})` : ''}
          </span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-slate-500 dark:text-slate-400">
            Proposed by <strong>{proposal.proposerName}</strong>
          </span>
        </div>

        {isResolved ? (
          <div className="flex items-center gap-1 font-bold">
            {proposal.status === 'passed' ? (
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Passed ({
                  typeof proposal.resolvedValue === 'number'
                    ? proposal.resolvedValue
                    : (proposal.type === 'retire'
                        ? 'Retired'
                        : proposal.type === 'reorder' || proposal.type === 'select_starter'
                        ? 'Ladder Reordered'
                        : (proposal.resolvedValue ?? 'Passed'))
                })
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <XCircle className="w-3.5 h-3.5" /> Contested
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Open for voting</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Proposal Title & Rating Change */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {proposal.targetPlayerName}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {proposal.type}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {position?.name ?? `Position ${proposal.pos}`}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <span className="text-sm text-slate-400 font-mono line-through font-bold">
              {proposal.currentValue}
            </span>
            <span className="text-xs text-slate-400">→</span>
            <span className="text-base sm:text-lg font-mono font-black text-[#0D6938] dark:text-emerald-400">
              {proposal.proposedValue}
            </span>
          </div>
        </div>

        {/* Mandatory Rationale Quote Block */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-850 border-l-4 border-[#0D6938] dark:border-emerald-500 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
          "{proposal.rationale}"
        </div>

        {/* Quorum Progress & Voting Stats */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#0D6938]" />
              <span>Quorum &amp; Votes ({proposal.votes.length}/3 votes)</span>
            </span>
            <span className="text-slate-500 text-[11px] font-mono">
              {evaluation.supports} Supports vs {evaluation.challenges} Challenges
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-600 h-full transition-all"
              style={{ width: `${(evaluation.supports / Math.max(1, proposal.votes.length)) * 100}%` }}
            />
            <div
              className="bg-red-500 h-full transition-all"
              style={{ width: `${(evaluation.challenges / Math.max(1, proposal.votes.length)) * 100}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {proposal.resolutionNote || evaluation.summary}
          </div>

          {/* Dissent Transparency Banner (Passed with Dissent) */}
          {proposal.status === 'passed' && evaluation.spread && (evaluation.spread.stdDev > 3 || (evaluation.spread.max - evaluation.spread.min >= 5) || evaluation.challenges > 0) && (
            <div
              data-testid="dissent-banner"
              className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-300 dark:border-amber-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-bold text-amber-950 dark:text-amber-200">
                  Passed with dissent — range {evaluation.spread.min}–{evaluation.spread.max} (stdDev ±{evaluation.spread.stdDev})
                </span>
              </div>
              {evaluation.challenges > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 shrink-0 self-start sm:self-auto">
                  {evaluation.challenges} challenge vote(s) recorded
                </span>
              )}
            </div>
          )}
        </div>

        {/* Voting Action Section (if still open) */}
        {!isResolved && activeMember.role !== 'lurker' && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {userVote ? `You voted: ${userVote.choice.toUpperCase()} (${userVote.counterValue ?? 'Agreed'})` : 'Cast your vote:'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setVoteChoice('support');
                    setShowCounterInput(true);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                    userVote?.choice === 'support'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Support</span>
                </button>

                <button
                  onClick={() => {
                    setVoteChoice('challenge');
                    setShowCounterInput(true);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                    userVote?.choice === 'challenge'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 hover:bg-red-100 border border-red-300'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Challenge</span>
                </button>
              </div>
            </div>

            {/* Counter Value & Rationale drawer */}
            {showCounterInput && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Your {voteChoice === 'support' ? 'Agreed' : 'Counter'} Rating Value:
                  </span>
                  <span className="text-base font-black font-mono text-[#0D6938] dark:text-emerald-400">
                    {counterValue}
                  </span>
                </div>

                <input
                  type="range"
                  min="50"
                  max="99"
                  value={counterValue}
                  onChange={(e) => setCounterValue(Number(e.target.value))}
                  className="w-full accent-[#0D6938]"
                />

                <input
                  type="text"
                  placeholder="Optional brief counter-argument..."
                  value={voteRationale}
                  onChange={(e) => setVoteRationale(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowCounterInput(false)}
                    className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleVoteSubmit(voteChoice)}
                    className="px-4 py-1 rounded-lg text-xs font-bold bg-[#0D6938] hover:bg-emerald-800 text-white transition"
                  >
                    Confirm Vote
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Owner Fast-Track Resolution Button for pub sessions */}
        {!isResolved && activeMember.role === 'owner' && onResolveManually && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onResolveManually(proposal.id)}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition"
              title="Owner resolution authority for pub tie-breaks"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0D6938]" />
              <span>Owner Fast-Resolve via Current Median</span>
            </button>
          </div>
        )}

        {/* Threaded Debate Comments */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Pub Debate ({proposal.comments.length} comments)</span>
            </span>
            {proposal.comments.length > 2 && (
              <button
                onClick={() => setShowAllComments(!showAllComments)}
                className="text-[11px] text-[#0D6938] dark:text-emerald-400 hover:underline"
              >
                {showAllComments ? 'Show Less' : `Show all ${proposal.comments.length}`}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {(showAllComments ? proposal.comments : proposal.comments.slice(-2)).map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {c.memberName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{c.text}</p>
              </div>
            ))}
          </div>

          {/* Quick Comment Input */}
          {activeMember.role !== 'lurker' && (
            <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Argue your case in the pub..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0D6938]"
              />
              <button
                type="submit"
                className="p-1.5 rounded-xl bg-[#0D6938] hover:bg-emerald-800 text-white transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
