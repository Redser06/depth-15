import { BlogPost, VoiceNote } from '../types/depth';
import { clearVoiceAudio, loadVoiceAudio, storeVoiceAudio } from './voiceAudioStore';
import { MAX_VOICE_NOTE_DATA_URL_CHARS } from './voiceNoteLimits';

export { loadVoiceAudio };

export const STORAGE_KEYS = {
  PLAYERS: 'depth15_players_v1',
  PROPOSALS: 'depth15_proposals_v1',
  SNAPSHOTS: 'depth15_snapshots_v1',
  ACTIVE_MEMBER: 'depth15_active_member_v1',
  REBASE: 'depth15_rebase_v1',
  DARK_MODE: 'depth15_dark_mode_v1',
  STARTER_ASSIGNMENTS: 'depth15_starters_v1',
  POSITION_ORDERS: 'depth15_orders_v1',
  BLOG_POSTS: 'depth15_blog_posts_v1',
  NEWSLETTER_SUBSCRIBERS: 'depth15_newsletter_v1',
} as const;

export interface PersistenceNotice {
  level: 'warning' | 'error';
  message: string;
}

export interface PersistResult {
  ok: boolean;
  recovered: boolean;
  notice: PersistenceNotice | null;
}

export const VOICE_NOTE_TOO_LARGE_NOTICE: PersistenceNotice = {
  level: 'warning',
  message:
    'A voice note was too large to store. The transcript was kept, and squad data was left untouched.',
};

const NOTICE_RECOVERED: PersistenceNotice = {
  level: 'warning',
  message:
    'Browser storage was full, so voice-note audio was moved out of the main save. Your latest change was kept.',
};

const NOTICE_FAILED: PersistenceNotice = {
  level: 'error',
  message:
    'Could not save your latest change because browser storage is full. It may be lost on reload.',
};

const NOTICE_AUDIO_STORE: PersistenceNotice = {
  level: 'warning',
  message:
    'Voice-note audio could not be stored separately. The transcript was kept so squad data is safe.',
};

interface DetachedAudio {
  id: string;
  dataUrl: string;
}

interface DetachResult {
  posts: BlogPost[];
  extracted: DetachedAudio[];
  droppedOversized: boolean;
}

function stripDataAudio(note: VoiceNote, extracted: DetachedAudio[], dropped: { value: boolean }): VoiceNote {
  const audioUrl = note.audioUrl;
  if (!audioUrl || !audioUrl.startsWith('data:')) return note;
  if (audioUrl.length > MAX_VOICE_NOTE_DATA_URL_CHARS) {
    dropped.value = true;
    const copy = { ...note };
    delete copy.audioUrl;
    return copy;
  }
  extracted.push({ id: note.id, dataUrl: audioUrl });
  const copy = { ...note };
  delete copy.audioUrl;
  return copy;
}

export function detachVoiceAudio(posts: BlogPost[]): DetachResult {
  const extracted: DetachedAudio[] = [];
  const dropped = { value: false };
  const next = posts.map((post) => {
    const voiceNotes = post.voiceNotes?.map((note) => stripDataAudio(note, extracted, dropped));
    const comments = post.comments.map((comment) => {
      if (!comment.voiceNote) return comment;
      return {
        ...comment,
        voiceNote: stripDataAudio(comment.voiceNote, extracted, dropped),
      };
    });
    return {
      ...post,
      voiceNotes,
      comments,
    };
  });
  return { posts: next, extracted, droppedOversized: dropped.value };
}

export function collectVoiceNoteIds(posts: BlogPost[]): string[] {
  const ids: string[] = [];
  for (const post of posts) {
    for (const note of post.voiceNotes ?? []) ids.push(note.id);
    for (const comment of post.comments) {
      if (comment.voiceNote) ids.push(comment.voiceNote.id);
    }
  }
  return ids;
}

export function attachVoiceAudio(posts: BlogPost[], audio: Record<string, string>): BlogPost[] {
  if (Object.keys(audio).length === 0) return posts;
  let changed = false;
  const next = posts.map((post) => {
    const voiceNotes = post.voiceNotes?.map((note) => {
      const stored = audio[note.id];
      if (!stored || note.audioUrl) return note;
      changed = true;
      return { ...note, audioUrl: stored };
    });
    const comments = post.comments.map((comment) => {
      const note = comment.voiceNote;
      const stored = note ? audio[note.id] : undefined;
      if (!note || !stored || note.audioUrl) return comment;
      changed = true;
      return { ...comment, voiceNote: { ...note, audioUrl: stored } };
    });
    return { ...post, voiceNotes, comments };
  });
  return changed ? next : posts;
}

function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const name = 'name' in error ? String(error.name) : '';
  return name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED';
}

function blogJsonHasInlineAudio(raw: string): boolean {
  return raw.includes('"audioUrl":"data:') || raw.includes('"audioUrl": "data:');
}

let strippingBlogAudio = false;

/**
 * Drop inline data-URL audio from the blog localStorage record and keep the bytes
 * in IndexedDB. Returns true when it actually removed inline audio (quota can recover).
 */
function emergencyStripBlogAudio(): boolean {
  if (strippingBlogAudio) return false;
  strippingBlogAudio = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOG_POSTS);
    if (!raw || !blogJsonHasInlineAudio(raw)) return false;

    let stored = '[]';
    let extracted: DetachedAudio[] = [];
    try {
      const detached = detachVoiceAudio(JSON.parse(raw) as BlogPost[]);
      stored = JSON.stringify(detached.posts);
      extracted = detached.extracted;
    } catch (error) {
      console.error(error);
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.BLOG_POSTS);
    } catch (error) {
      console.error(error);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, stored);
    } catch (error) {
      console.error(error);
      try {
        localStorage.removeItem(STORAGE_KEYS.BLOG_POSTS);
      } catch {
        // The oversized record is already gone; squad writes can proceed.
      }
    }

    if (extracted.length > 0) {
      void storeVoiceAudio(extracted).catch((error) => {
        console.error(error);
      });
    }
    return true;
  } finally {
    strippingBlogAudio = false;
  }
}

export function persistRaw(key: string, value: string): PersistResult {
  try {
    localStorage.setItem(key, value);
    return { ok: true, recovered: false, notice: null };
  } catch (error) {
    if (!isQuotaError(error)) {
      console.error(error);
      return { ok: false, recovered: false, notice: NOTICE_FAILED };
    }
    const freed = emergencyStripBlogAudio();
    if (!freed) {
      console.error(error);
      return { ok: false, recovered: false, notice: NOTICE_FAILED };
    }
    try {
      localStorage.setItem(key, value);
      return { ok: true, recovered: true, notice: NOTICE_RECOVERED };
    } catch (retryError) {
      console.error(retryError);
      return { ok: false, recovered: false, notice: NOTICE_FAILED };
    }
  }
}

export function persistBlogPosts(
  posts: BlogPost[],
  onNotice?: (notice: PersistenceNotice) => void
): PersistResult {
  const { posts: stored, extracted, droppedOversized } = detachVoiceAudio(posts);
  const result = persistRaw(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(stored));
  if (droppedOversized) onNotice?.(VOICE_NOTE_TOO_LARGE_NOTICE);
  if (extracted.length > 0) {
    void storeVoiceAudio(extracted).catch((error) => {
      console.error(error);
      onNotice?.(NOTICE_AUDIO_STORE);
    });
  }
  if (droppedOversized && !result.notice) {
    return { ...result, notice: VOICE_NOTE_TOO_LARGE_NOTICE };
  }
  return result;
}

export function clearStoredVoiceAudio(): Promise<void> {
  return clearVoiceAudio();
}

export function clampVoiceAudioUrl(url: string | undefined): {
  url: string | undefined;
  dropped: boolean;
} {
  if (!url) return { url: undefined, dropped: false };
  if (url.startsWith('data:') && url.length > MAX_VOICE_NOTE_DATA_URL_CHARS) {
    return { url: undefined, dropped: true };
  }
  return { url, dropped: false };
}
