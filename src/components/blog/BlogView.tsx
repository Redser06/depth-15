import React, { useState, useMemo } from 'react';
import {
  BLOG_CATEGORIES,
  BlogCategory,
  BlogHotTake,
  BlogPost,
  BlogSection,
  Member,
  PlayerEntry,
  Position,
} from '../../types/depth';
import { calculateDepthScore, getDepthBand, getRatingTier } from '../../lib/depthCalc';
import { filterBlogPosts } from '../../lib/blogGenerator';
import { CreateBlogPostModal } from './CreateBlogPostModal';
import { VoiceNotePlayer, VoiceNoteRecorder } from './VoiceNoteWidget';
import {
  BookOpen,
  Sparkles,
  PenTool,
  Clock,
  ThumbsUp,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Search,
  Mail,
  CheckCircle2,
  Flame,
  Smartphone,
  MessageSquarePlus,
  Send,
  Layers,
  Mic,
  Volume2,
} from 'lucide-react';

interface BlogViewProps {
  posts: BlogPost[];
  positions: Position[];
  players: PlayerEntry[];
  playersByPos: Record<number, PlayerEntry[]>;
  activeMember: Member;
  newsletterSubscribers: string[];
  onChallengePlayer: (player: PlayerEntry) => void;
  onStartHotTakeDebate: (playerName: string, posId: number, rationale: string) => void;
  onOpenPubView: (posId: number) => void;
  onCreatePost: (data: {
    title: string;
    subtitle: string;
    category: BlogCategory;
    tags: string[];
    linkedPositions: number[];
    spotlightPlayerNames: string[];
    hotTake?: BlogHotTake;
    sections: BlogSection[];
    featured?: boolean;
    voiceNote?: { durationSeconds: number; audioUrl?: string; transcript: string };
  }) => BlogPost;
  onGenerateDigest: () => BlogPost;
  onToggleLike: (postId: string) => void;
  onAddVoiceNoteToPost?: (
    postId: string,
    note: { durationSeconds: number; audioUrl?: string; transcript: string }
  ) => void;
  onAddComment: (
    postId: string,
    text: string,
    voiceNote?: { durationSeconds: number; audioUrl?: string; transcript: string }
  ) => void;
  onSubscribeNewsletter: (email: string) => boolean;
}

const CATEGORY_STYLES: Record<BlogCategory, string> = {
  'Positional Deep-Dive':
    'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  'Matchday Analysis':
    'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
  'U20 & Breakthrough Watch':
    'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
  'Consensus Digest':
    'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
};

export const BlogView: React.FC<BlogViewProps> = ({
  posts,
  positions,
  players,
  playersByPos,
  activeMember,
  newsletterSubscribers,
  onChallengePlayer,
  onStartHotTakeDebate,
  onOpenPubView,
  onCreatePost,
  onGenerateDigest,
  onToggleLike,
  onAddVoiceNoteToPost,
  onAddComment,
  onSubscribeNewsletter,
}) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | BlogCategory>('all');
  const [positionFilter, setPositionFilter] = useState<'all' | number>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Article audio dispatch recording state
  const [isRecordingArticleDispatch, setIsRecordingArticleDispatch] = useState(false);

  // Comment input and attached voice note for open article
  const [commentDraft, setCommentDraft] = useState('');
  const [isRecordingCommentVoice, setIsRecordingCommentVoice] = useState(false);
  const [stagedCommentVoiceNote, setStagedCommentVoiceNote] = useState<{
    durationSeconds: number;
    audioUrl?: string;
    transcript: string;
  } | null>(null);

  // Newsletter state
  const [emailInput, setEmailInput] = useState('');
  const [digestCadence, setDigestCadence] = useState<'weekly' | 'instant'>('weekly');
  const [subFeedback, setSubFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const filteredPosts = useMemo(
    () =>
      filterBlogPosts(posts, {
        category: categoryFilter,
        positionId: positionFilter,
        searchQuery,
      }),
    [posts, categoryFilter, positionFilter, searchQuery]
  );

  const selectedPost = useMemo(
    () => (selectedPostId ? posts.find((p) => p.id === selectedPostId) ?? null : null),
    [posts, selectedPostId]
  );

  const leadStory = useMemo(
    () => filteredPosts.find((p) => p.featured) ?? filteredPosts[0] ?? null,
    [filteredPosts]
  );

  const handleGenerateDigestClick = () => {
    const newDigest = onGenerateDigest();
    setSelectedPostId(newDigest.id);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onSubscribeNewsletter(emailInput);
    if (!ok) {
      setSubFeedback({
        ok: false,
        msg: 'Please enter a valid email address to receive the Clubhouse Digest.',
      });
      return;
    }
    setSubFeedback({
      ok: true,
      msg: `Subscribed (${emailInput.trim()}) to ${
        digestCadence === 'weekly' ? 'the Weekly Matchday Digest' : 'Instant Consensus Shifts'
      }!`,
    });
    setEmailInput('');
  };

  const handleCommentSubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentDraft.trim() && !stagedCommentVoiceNote) return;
    onAddComment(postId, commentDraft, stagedCommentVoiceNote ?? undefined);
    setCommentDraft('');
    setStagedCommentVoiceNote(null);
    setIsRecordingCommentVoice(false);
  };

  const renderEmbeddedLadder = (posId: number) => {
    const pos = positions.find((p) => p.id === posId);
    if (!pos) return null;
    const ladder = (playersByPos[posId] ?? []).filter((p) => p.status === 'active');
    const depthScore = calculateDepthScore(ladder);
    const band = getDepthBand(depthScore);

    return (
      <div className="my-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#0D6938] text-white font-mono text-xs font-black flex items-center justify-center">
              {pos.num}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  Live Depth Ladder · {pos.name}
                </h4>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                  style={{
                    backgroundColor: band.bgLight,
                    color: band.textDark,
                    borderColor: band.border,
                  }}
                >
                  Depth {depthScore} · {band.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Real-time squad rankings synced with the interactive Depth 15 chart
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenPubView(pos.id)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Move Chips in Pub Mode</span>
          </button>
        </div>

        {ladder.length === 0 ? (
          <div className="p-4 text-xs text-slate-500 dark:text-slate-400 italic">
            No active contenders currently assigned to #{pos.num} {pos.name}.
          </div>
        ) : (
          <div className="divide-y divide-slate-200/70 dark:divide-slate-700/60">
            {ladder.slice(0, 5).map((pl, idx) => {
              const tierInfo = getRatingTier(pl.rating);
              return (
                <div
                  key={pl.id}
                  className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-white/80 dark:hover:bg-slate-800/80 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-md text-[11px] font-mono font-black flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? 'bg-[#0D6938] text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {pl.name}
                    </span>
                    {pl.province && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {pl.province}
                      </span>
                    )}
                    {pl.isContested && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        Contested
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-mono font-black border ${tierInfo.pillClass}`}
                    >
                      {pl.rating}
                    </span>
                    <button
                      type="button"
                      onClick={() => onChallengePlayer(pl)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                    >
                      <MessageSquarePlus className="w-3 h-3" />
                      <span>Challenge</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ARTICLE READER VIEW
  if (selectedPost) {
    const isLiked = selectedPost.likes.includes(activeMember.id);
    const hotTake = selectedPost.hotTake;
    const liveHotTakePlayer = hotTake
      ? players.find(
          (p) =>
            p.name.toLowerCase() === hotTake.targetPlayerName.toLowerCase() &&
            p.pos === hotTake.pos
        ) ??
        players.find(
          (p) => p.name.toLowerCase() === hotTake.targetPlayerName.toLowerCase()
        )
      : undefined;

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Back navigation bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSelectedPostId(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Clubhouse Articles</span>
          </button>

          <div className="flex items-center gap-2">
            {selectedPost.linkedPositions.map((posId) => {
              const pos = positions.find((p) => p.id === posId);
              if (!pos) return null;
              return (
                <button
                  key={posId}
                  type="button"
                  onClick={() => onOpenPubView(posId)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                >
                  #{pos.num} {pos.name} →
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Article Card */}
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  CATEGORY_STYLES[selectedPost.category]
                }`}
              >
                {selectedPost.category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {selectedPost.readTimeMinutes} min read
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(selectedPost.publishedAt).toLocaleDateString('en-IE', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {selectedPost.title}
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedPost.subtitle}
            </p>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0D6938] text-white font-bold text-xs flex items-center justify-center">
                  {selectedPost.authorName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedPost.authorName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedPost.authorRole}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleLike(selectedPost.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  isLiked
                    ? 'bg-[#0D6938] text-white border-[#0D6938]'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Endorse Analysis ({selectedPost.likes.length})</span>
              </button>
            </div>
          </div>

          {/* Tactical Audio Briefings & Voice Notes */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/50 dark:from-emerald-950/20 dark:via-slate-850 dark:to-emerald-950/10 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3.5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#0D6938] text-white">
                  <Volume2 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                    Tactical Audio Briefings &amp; Voice Notes
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Press box dispatches, player insights, and spoken editorial commentary
                  </p>
                </div>
              </div>

              {!isRecordingArticleDispatch && (
                <button
                  type="button"
                  onClick={() => setIsRecordingArticleDispatch(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-[#0a522c] text-white transition cursor-pointer shadow-2xs"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>+ Record Voice Dispatch</span>
                </button>
              )}
            </div>

            {isRecordingArticleDispatch && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>Record Tactical Voice Dispatch as {activeMember.name}</span>
                  <button
                    type="button"
                    onClick={() => setIsRecordingArticleDispatch(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer font-normal"
                  >
                    Cancel
                  </button>
                </div>
                <VoiceNoteRecorder
                  authorName={activeMember.name}
                  onSaveVoiceNote={(note) => {
                    onAddVoiceNoteToPost?.(selectedPost.id, note);
                    setIsRecordingArticleDispatch(false);
                  }}
                  placeholder="Record an audio dispatch or dictate spoken tactical analysis for this article..."
                  compact
                />
              </div>
            )}

            {selectedPost.voiceNotes && selectedPost.voiceNotes.length > 0 ? (
              <div className="space-y-2.5 pt-1">
                {selectedPost.voiceNotes.map((vn) => (
                  <VoiceNotePlayer key={vn.id} voiceNote={vn} />
                ))}
              </div>
            ) : (
              !isRecordingArticleDispatch && (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  No audio notes recorded for this column yet. Hit &ldquo;Record Voice Dispatch&rdquo; to attach a spoken brief.
                </p>
              )
            )}
          </div>

          {/* Article Sections + Embedded Position Ladders */}
          <div className="space-y-6">
            {selectedPost.sections.map((sec, idx) => (
              <div key={idx} className="space-y-3">
                {sec.heading && (
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    {sec.heading}
                  </h2>
                )}
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {sec.body}
                </p>
                {sec.callout && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border-l-4 border-[#0D6938] text-xs font-semibold text-emerald-950 dark:text-emerald-200">
                    {sec.callout}
                  </div>
                )}
                {sec.embeddedPosId !== undefined && renderEmbeddedLadder(sec.embeddedPosId)}
              </div>
            ))}
          </div>

          {/* Interactive Hot Take Box */}
          {hotTake && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 dark:from-amber-950/30 dark:via-slate-800 dark:to-amber-950/20 border border-amber-200 dark:border-amber-800/70 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950">
                    <Flame className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      Interactive Columnist Hot Take · Position #{hotTake.pos}
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {hotTake.targetPlayerName}: Current Chart Rating{' '}
                      <span className="font-mono underline">
                        {liveHotTakePlayer?.rating ?? '—'}
                      </span>{' '}
                      → Proposed{' '}
                      <span className="font-mono text-[#0D6938] dark:text-emerald-400">
                        {hotTake.proposedRating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onStartHotTakeDebate(
                        hotTake.targetPlayerName,
                        hotTake.pos,
                        hotTake.rationale
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-[#0a522c] text-white shadow-xs transition cursor-pointer"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>Challenge or Back This Take</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                &ldquo;{hotTake.rationale}&rdquo;
              </p>
            </div>
          )}

          {/* Clubhouse Discussion Thread */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0D6938]" />
              <span>Clubhouse Reader Debate ({selectedPost.comments.length})</span>
            </h3>

            {selectedPost.comments.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No reader comments yet. Start the debate below!
              </p>
            ) : (
              <div className="space-y-2.5">
                {selectedPost.comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {c.memberName}
                        </span>
                        {c.voiceNote && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                            <Mic className="w-2.5 h-2.5" />
                            <span>Voice Note</span>
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400">
                        {new Date(c.timestamp).toLocaleDateString('en-IE', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    {c.voiceNote && (
                      <VoiceNotePlayer voiceNote={c.voiceNote} compact />
                    )}

                    {c.text && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {c.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2.5 pt-1">
              {stagedCommentVoiceNote && (
                <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                    <span className="flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      <span>Attached Reader Voice Note</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setStagedCommentVoiceNote(null)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 hover:underline cursor-pointer text-xs"
                    >
                      Remove voice note
                    </button>
                  </div>
                  <VoiceNotePlayer
                    voiceNote={{
                      id: 'staged-comment-vn',
                      authorId: activeMember.id,
                      authorName: activeMember.name,
                      durationSeconds: stagedCommentVoiceNote.durationSeconds,
                      audioUrl: stagedCommentVoiceNote.audioUrl,
                      transcript: stagedCommentVoiceNote.transcript,
                      createdAt: new Date().toISOString(),
                    }}
                    compact
                  />
                </div>
              )}

              {isRecordingCommentVoice && !stagedCommentVoiceNote && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>Record Reader Voice Note as {activeMember.name}</span>
                    <button
                      type="button"
                      onClick={() => setIsRecordingCommentVoice(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer font-normal"
                    >
                      Cancel
                    </button>
                  </div>
                  <VoiceNoteRecorder
                    authorName={activeMember.name}
                    onSaveVoiceNote={(note) => {
                      setStagedCommentVoiceNote(note);
                      setIsRecordingCommentVoice(false);
                    }}
                    onDictateToText={(text) => {
                      setCommentDraft((prev) => (prev ? `${prev} ${text}` : text));
                    }}
                    placeholder="Speak your clubhouse debate take or dictate comment..."
                    compact
                  />
                </div>
              )}

              <form
                onSubmit={(e) => handleCommentSubmit(e, selectedPost.id)}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder={`Add your take as ${activeMember.name}...`}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0D6938]"
                />
                <button
                  type="button"
                  onClick={() => setIsRecordingCommentVoice((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    isRecordingCommentVoice || stagedCommentVoiceNote
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-[#0D6938] text-[#0D6938] dark:text-emerald-400'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                  title="Record or dictate voice note comment"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Voice Note</span>
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-[#0a522c] text-white transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </form>
            </div>
          </div>
        </article>
      </div>
    );
  }

  // EDITORIAL FEED VIEW
  return (
    <div className="space-y-6">
      {/* Top Editorial Banner & Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#0D6938] dark:text-emerald-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>The 15th Man · Ireland Squad Editorial & Weekly Digest</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Long-Form Positional Analysis & Live Consensus Dispatches
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Every article embeds live Depth 15 position ladders so you can inspect the ratings, challenge an analyst’s hot take, or jump straight into Pub Mode to move the chips.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleGenerateDigestClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition cursor-pointer"
            title="Synthesize a fresh Weekly Consensus Digest from current live ratings and debates"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Generate Live Digest</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-[#0a522c] text-white shadow-xs transition cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>+ Write Column</span>
          </button>
        </div>
      </div>

      {/* Category & Position Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-[#0D6938] text-white shadow-2xs'
                : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Columns ({posts.length})
          </button>
          {BLOG_CATEGORIES.map((cat) => {
            const count = posts.filter((p) => p.category === cat).length;
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(active ? 'all' : cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  active
                    ? 'bg-[#0D6938] text-white border-[#0D6938] shadow-2xs'
                    : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {cat} <span className="opacity-70 font-mono text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Filter articles by position"
            value={positionFilter}
            onChange={(e) =>
              setPositionFilter(
                e.target.value === 'all' ? 'all' : Number(e.target.value)
              )
            }
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="all">All 15 Positions</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.num} {p.name}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player or topic..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Lead Story Hero Card */}
      {leadStory && (
        <div
          onClick={() => setSelectedPostId(leadStory.id)}
          className="group cursor-pointer rounded-2xl bg-gradient-to-br from-[#073A1E] via-[#0D6938] to-emerald-900 text-white p-6 sm:p-7 shadow-md border border-emerald-700/50 transition hover:shadow-lg"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Featured Lead Column
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-emerald-100">
                  {leadStory.category}
                </span>
                <span className="text-xs text-emerald-200 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {leadStory.readTimeMinutes} min read
                </span>
                {leadStory.voiceNotes && leadStory.voiceNotes.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/25">
                    <Mic className="w-3 h-3 text-emerald-300" />
                    <span>Audio Dispatch Included</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black leading-snug group-hover:underline">
                {leadStory.title}
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                {leadStory.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-emerald-100">
                <span className="font-bold">{leadStory.authorName}</span>
                <span>·</span>
                <span>{leadStory.authorRole}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  Embedded Ladders:{' '}
                  {leadStory.linkedPositions.map((id) => `#${id}`).join(', ')}
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-2">
              {leadStory.hotTake && (
                <div className="p-3 rounded-xl bg-black/25 border border-white/15 text-xs space-y-0.5">
                  <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                    Inside Hot Take
                  </div>
                  <div className="font-bold text-white">
                    {leadStory.hotTake.targetPlayerName} →{' '}
                    <span className="font-mono text-amber-300 font-black">
                      {leadStory.hotTake.proposedRating}
                    </span>
                  </div>
                </div>
              )}

              <span className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-white text-[#0D6938] group-hover:bg-emerald-50 transition">
                <span>Read & Inspect Ladders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Article Grid */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No articles match your current filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('all');
              setPositionFilter('all');
              setSearchQuery('');
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0D6938] text-white cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts
            .filter((p) => p.id !== leadStory?.id)
            .map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPostId(post.id)}
                className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#0D6938] dark:hover:border-emerald-600 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-2xs transition"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        CATEGORY_STYLES[post.category]
                      }`}
                    >
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      {post.voiceNotes && post.voiceNotes.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <Mic className="w-2.5 h-2.5 text-[#0D6938] dark:text-emerald-400" />
                          <span>Audio Note</span>
                        </span>
                      )}
                      <Clock className="w-3 h-3" />
                      <span>{post.readTimeMinutes}m read</span>
                      <span>·</span>
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString('en-IE', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#0D6938] dark:group-hover:text-emerald-400 transition leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {post.subtitle}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {post.linkedPositions.map((posId) => {
                      const pos = positions.find((p) => p.id === posId);
                      return (
                        <span
                          key={posId}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                        >
                          #{pos?.num ?? posId} {pos?.abbr ?? ''} Ladder
                        </span>
                      );
                    })}
                    {post.spotlightPlayerNames.slice(0, 2).map((name) => (
                      <span
                        key={name}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        {name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {post.authorName}
                    </span>
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {post.likes.length}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {post.comments.length}
                      </span>
                      <span className="font-bold text-[#0D6938] dark:text-emerald-400 inline-flex items-center gap-1">
                        Read <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Recurring Digest & Newsletter Subscription Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#0D6938] dark:text-emerald-400">
              <Mail className="w-4 h-4" />
              <span>Recurring Weekly Clubhouse Dispatch</span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Get the Friday Matchday Depth Chart & Consensus Movers in Your Inbox
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Every week we publish positional deep-dives, U20 breakthrough tracking, and the biggest rating swings voted by the panel. Join{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {142 + newsletterSubscribers.length} rugby analysts
              </span>{' '}
              getting the recurring digest.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              aria-label="Digest frequency"
              value={digestCadence}
              onChange={(e) => setDigestCadence(e.target.value as 'weekly' | 'instant')}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="weekly">Weekly Friday Digest</option>
              <option value="instant">Instant Consensus Shifts</option>
            </select>

            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@rugbyclub.ie"
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white min-w-[210px]"
            />

            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-[#0a522c] text-white transition cursor-pointer shrink-0"
            >
              Subscribe Free
            </button>
          </form>
        </div>

        {subFeedback && (
          <div
            className={`mt-3 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              subFeedback.ok
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{subFeedback.msg}</span>
          </div>
        )}
      </div>

      {/* Authoring Modal */}
      <CreateBlogPostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        positions={positions}
        players={players}
        onSubmit={(data) => {
          const created = onCreatePost(data);
          setSelectedPostId(created.id);
        }}
      />
    </div>
  );
};
