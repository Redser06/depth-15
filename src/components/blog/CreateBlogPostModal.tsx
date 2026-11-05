import React, { useState } from 'react';
import {
  BLOG_CATEGORIES,
  BlogCategory,
  BlogHotTake,
  BlogSection,
  PlayerEntry,
  Position,
} from '../../types/depth';
import { VoiceNotePlayer, VoiceNoteRecorder } from './VoiceNoteWidget';
import { X, PenTool, Sparkles, AlertCircle, Check } from 'lucide-react';

interface CreateBlogPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  positions: Position[];
  players: PlayerEntry[];
  onSubmit: (data: {
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
  }) => void;
}

export const CreateBlogPostModal: React.FC<CreateBlogPostModalProps> = ({
  isOpen,
  onClose,
  positions,
  players,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<BlogCategory>('Positional Deep-Dive');
  const [linkedPositions, setLinkedPositions] = useState<number[]>([10]);
  const [section1Heading, setSection1Heading] = useState('The Tactical Picture');
  const [section1Body, setSection1Body] = useState('');
  const [section1Callout, setSection1Callout] = useState('');
  const [section2Heading, setSection2Heading] = useState('What Moves the Chip Next');
  const [section2Body, setSection2Body] = useState('');
  const [includeHotTake, setIncludeHotTake] = useState(true);
  const [hotTakePlayer, setHotTakePlayer] = useState('Sam Prendergast');
  const [hotTakeRating, setHotTakeRating] = useState(86);
  const [hotTakeRationale, setHotTakeRationale] = useState('');
  const [featured, setFeatured] = useState(false);
  const [stagedVoiceNote, setStagedVoiceNote] = useState<{
    durationSeconds: number;
    audioUrl?: string;
    transcript: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const primaryPosId = linkedPositions[0] ?? 10;
  const posPlayers = players.filter(
    (p) => p.status === 'active' && linkedPositions.includes(p.pos)
  );

  const togglePosition = (posId: number) => {
    setLinkedPositions((curr) =>
      curr.includes(posId) ? curr.filter((id) => id !== posId) : [...curr, posId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a headline for your article.');
      return;
    }
    if (!section1Body.trim()) {
      setError('Please write the main analysis body for Section 1.');
      return;
    }

    const finalLinked = linkedPositions.length > 0 ? linkedPositions : [10];
    const sections: BlogSection[] = [
      {
        heading: section1Heading.trim() || undefined,
        body: section1Body.trim(),
        callout: section1Callout.trim() || undefined,
        embeddedPosId: finalLinked[0],
      },
    ];

    if (section2Body.trim()) {
      sections.push({
        heading: section2Heading.trim() || undefined,
        body: section2Body.trim(),
        embeddedPosId: finalLinked[1],
      });
    }

    const matchedPlayer = players.find(
      (p) => p.name.toLowerCase() === hotTakePlayer.trim().toLowerCase()
    );

    const hotTake: BlogHotTake | undefined =
      includeHotTake && hotTakePlayer.trim()
        ? {
            targetPlayerName: hotTakePlayer.trim(),
            pos: matchedPlayer?.pos ?? primaryPosId,
            proposedRating: hotTakeRating,
            rationale:
              hotTakeRationale.trim() ||
              `Editorial Take: ${hotTakePlayer.trim()} warrants a ${hotTakeRating} consensus rating based on recent test and European form.`,
          }
        : undefined;

    const posTags = finalLinked
      .map((id) => positions.find((p) => p.id === id))
      .filter((p): p is Position => Boolean(p))
      .map((p) => `Pos ${p.num}`);

    const spotlightNames = Array.from(
      new Set([
        ...(hotTake ? [hotTake.targetPlayerName] : []),
        ...posPlayers.slice(0, 3).map((p) => p.name),
      ])
    );

    onSubmit({
      title: title.trim(),
      subtitle:
        subtitle.trim() ||
        section1Body.trim().slice(0, 140) + (section1Body.trim().length > 140 ? '…' : ''),
      category,
      tags: [category, ...posTags],
      linkedPositions: finalLinked,
      spotlightPlayerNames: spotlightNames,
      hotTake,
      sections,
      featured,
      voiceNote: stagedVoiceNote ?? undefined,
    });

    setTitle('');
    setSubtitle('');
    setSection1Body('');
    setSection1Callout('');
    setSection2Body('');
    setStagedVoiceNote(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0D6938] to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/15">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">
                Publish Clubhouse Editorial Column
              </h3>
              <p className="text-[11px] text-emerald-100">
                Embed live Depth 15 position ladders and attach a challengeable rating take
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs text-red-700 dark:text-red-300 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Category & Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label
                htmlFor="blog-category"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
              >
                Editorial Desk / Category
              </label>
              <select
                id="blog-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as BlogCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {BLOG_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0D6938] focus:ring-[#0D6938]"
                />
                <span>Pin as Lead Story</span>
              </label>
            </div>
          </div>

          {/* Headline & Standfirst */}
          <div className="space-y-3">
            <div>
              <label
                htmlFor="blog-title"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
              >
                Article Headline
              </label>
              <input
                id="blog-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Why Ireland's Back-Row Balance Hinges on the #6 Jersey"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="blog-subtitle"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
              >
                Standfirst / Sub-headline
              </label>
              <input
                id="blog-subtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Brief 1-sentence hook summarizing the tactical argument..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Linked Positions to Embed */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Embed Live Position Ladders in Article (select 1 or more)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {positions.map((pos) => {
                const active = linkedPositions.includes(pos.id);
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => togglePosition(pos.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                      active
                        ? 'bg-[#0D6938] text-white border-[#0D6938]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    #{pos.num} {pos.abbr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Author Voice Note & Voice-to-Text Dictation */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Author Voice Note &amp; Dictation (Record an audio briefing or dictate into Section 1)
            </label>
            {stagedVoiceNote ? (
              <div className="space-y-1.5">
                <VoiceNotePlayer
                  voiceNote={{
                    id: 'staged-vn',
                    authorId: 'author',
                    authorName: 'Attached Author Voice Note',
                    durationSeconds: stagedVoiceNote.durationSeconds,
                    audioUrl: stagedVoiceNote.audioUrl,
                    transcript: stagedVoiceNote.transcript,
                    createdAt: new Date().toISOString(),
                  }}
                  compact
                />
                <button
                  type="button"
                  onClick={() => setStagedVoiceNote(null)}
                  className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Remove attached voice note
                </button>
              </div>
            ) : (
              <VoiceNoteRecorder
                authorName="Columnist"
                onSaveVoiceNote={(note) => setStagedVoiceNote(note)}
                onDictateToText={(text) =>
                  setSection1Body((prev) => (prev ? `${prev}\n\n${text}` : text))
                }
                placeholder="Record a voice note to embed at the top of your post, or click 'Insert into Article'..."
                compact
              />
            )}
          </div>

          {/* Section 1 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <input
              type="text"
              value={section1Heading}
              onChange={(e) => setSection1Heading(e.target.value)}
              placeholder="Section 1 Subheading"
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            />
            <textarea
              rows={4}
              value={section1Body}
              onChange={(e) => setSection1Body(e.target.value)}
              placeholder="Write your main analysis here..."
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
            <input
              type="text"
              value={section1Callout}
              onChange={(e) => setSection1Callout(e.target.value)}
              placeholder="Optional Key Metric / Stat Callout box..."
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-emerald-800 dark:text-emerald-300"
            />
          </div>

          {/* Section 2 (Optional) */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <input
              type="text"
              value={section2Heading}
              onChange={(e) => setSection2Heading(e.target.value)}
              placeholder="Section 2 Subheading (Optional)"
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            />
            <textarea
              rows={3}
              value={section2Body}
              onChange={(e) => setSection2Body(e.target.value)}
              placeholder="Second section or conclusion (Optional)..."
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Interactive Hot Take Attachment */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-amber-900 dark:text-amber-300">
                <input
                  type="checkbox"
                  checked={includeHotTake}
                  onChange={(e) => setIncludeHotTake(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600"
                />
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Attach Interactive &ldquo;Challenge This Take&rdquo; Proposal Box</span>
              </label>
            </div>

            {includeHotTake && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Spotlight Player Name
                  </label>
                  <input
                    type="text"
                    value={hotTakePlayer}
                    onChange={(e) => setHotTakePlayer(e.target.value)}
                    placeholder="e.g. Sam Prendergast"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Editorial Target Rating: <span className="font-mono font-black">{hotTakeRating}</span>
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={99}
                    value={hotTakeRating}
                    onChange={(e) => setHotTakeRating(Number(e.target.value))}
                    className="w-full accent-[#0D6938]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={hotTakeRationale}
                    onChange={(e) => setHotTakeRationale(e.target.value)}
                    placeholder="1-line thesis readers can vote for or challenge..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-[#0a522c] text-white shadow-sm transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Publish to Clubhouse</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
