import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { BlogPost } from '../types/depth';
import { MAX_VOICE_NOTE_DATA_URL_CHARS } from './voiceNoteLimits';

const BLOG_KEY = 'depth15_blog_posts_v1';
const DB_NAME = 'depth15-voice-notes';

function legacyPost(audioUrl: string): BlogPost[] {
  return [
    {
      id: 'blog-legacy',
      slug: 'legacy',
      title: 'Legacy',
      subtitle: 'Recorded before the cap',
      category: 'Positional Deep-Dive',
      authorId: 'm-conor',
      authorName: 'Conor Redmond',
      authorRole: 'Lead Tactical Analyst',
      publishedAt: '2026-11-01T00:00:00Z',
      readTimeMinutes: 1,
      tags: [],
      linkedPositions: [],
      spotlightPlayerNames: [],
      sections: [{ body: 'Keep the article.' }],
      voiceNotes: [
        {
          id: 'vn-legacy',
          authorId: 'm-conor',
          authorName: 'Conor Redmond',
          durationSeconds: 140,
          audioUrl,
          transcript: 'Keep this transcript',
          createdAt: '2026-11-01T00:00:00Z',
        },
      ],
      likes: [],
      comments: [],
    },
  ];
}

function readIndexedDbAudio(id: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('audio', 'readonly');
      const get = tx.objectStore('audio').get(id);
      get.onerror = () => reject(get.error);
      get.onsuccess = () => resolve(typeof get.result === 'string' ? get.result : undefined);
    };
  });
}

function failingIndexedDb(): IDBFactory {
  return {
    open() {
      const request = {
        error: new DOMException('blocked', 'UnknownError'),
        onsuccess: null,
        onerror: null as ((this: IDBRequest, ev: Event) => void) | null,
        onupgradeneeded: null,
      };
      queueMicrotask(() => {
        request.onerror?.call(request as unknown as IDBRequest, new Event('error'));
      });
      return request as unknown as IDBOpenDBRequest;
    },
  } as unknown as IDBFactory;
}

describe('legacy voice-note migration', () => {
  afterEach(async () => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    vi.resetModules();
    const { clearStoredVoiceAudio } = await import('./localPersist');
    await clearStoredVoiceAudio();
    vi.resetModules();
  });

  it('keeps an over-cap legacy data URL in IndexedDB and the transcript in localStorage', async () => {
    const audioUrl = `data:audio/webm;base64,${'C'.repeat(MAX_VOICE_NOTE_DATA_URL_CHARS + 80_000)}`;
    expect(audioUrl.length).toBeGreaterThan(MAX_VOICE_NOTE_DATA_URL_CHARS);
    localStorage.setItem(BLOG_KEY, JSON.stringify(legacyPost(audioUrl)));

    const firstMod = await import('./store');
    const first = renderHook(() => firstMod.useDepthStore());
    await waitFor(() => {
      const saved = localStorage.getItem(BLOG_KEY) ?? '';
      expect(saved).toContain('Keep this transcript');
      expect(saved).not.toContain('data:audio');
    });
    await expect(readIndexedDbAudio('vn-legacy')).resolves.toBe(audioUrl);
    first.unmount();

    vi.resetModules();
    const secondMod = await import('./store');
    const second = renderHook(() => secondMod.useDepthStore());
    await waitFor(() => {
      const note = second.result.current.blogPosts
        .flatMap((post) => post.voiceNotes ?? [])
        .find((entry) => entry.id === 'vn-legacy');
      expect(note?.transcript).toBe('Keep this transcript');
      expect(note?.audioUrl).toBe(audioUrl);
    });
    expect(localStorage.getItem(BLOG_KEY)).not.toContain('data:audio');
    second.unmount();
  });

  it('leaves the legacy data URL in localStorage when IndexedDB rejects the write', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.resetModules();
    vi.stubGlobal('indexedDB', failingIndexedDb());
    const audioUrl = 'data:audio/webm;base64,QUJDRA';
    localStorage.setItem(BLOG_KEY, JSON.stringify(legacyPost(audioUrl)));

    const storeMod = await import('./store');
    const hook = renderHook(() => storeMod.useDepthStore());
    await waitFor(() => {
      expect(hook.result.current.persistenceNotice?.message).toMatch(/could not be stored separately/i);
    });
    const saved = localStorage.getItem(BLOG_KEY) ?? '';
    expect(saved).toContain(audioUrl);
    expect(saved).toContain('Keep this transcript');
    hook.unmount();
  });
});
