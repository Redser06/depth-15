import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useDepthStore } from './store';
import { STORAGE_KEYS, clearStoredVoiceAudio, detachVoiceAudio } from './localPersist';
import { MAX_VOICE_NOTE_DATA_URL_CHARS } from './voiceNoteLimits';
import { BlogPost } from '../types/depth';

interface QuotaStorage {
  quotaFailures: number;
  seed: (key: string, value: string) => void;
}

function installQuotaStorage(quota: number): QuotaStorage {
  const memory = new Map<string, string>();
  let used = 0;
  let quotaFailures = 0;

  const api: Storage & { seed: (key: string, value: string) => void } = {
    get length() {
      return memory.size;
    },
    clear() {
      memory.clear();
      used = 0;
    },
    key(index: number) {
      return [...memory.keys()][index] ?? null;
    },
    getItem(key: string) {
      return memory.has(key) ? memory.get(key)! : null;
    },
    setItem(key: string, value: string) {
      const stringValue = String(value);
      const previous = memory.get(key)?.length ?? 0;
      const nextUsed = used - previous + stringValue.length;
      // Once the origin is already over quota, replacements throw until something
      // actually deletes bytes. That is the failure mode voice-note audio caused.
      if (used > quota || nextUsed > quota) {
        quotaFailures += 1;
        throw new DOMException(
          `Failed to execute 'setItem' on 'Storage': Setting the value of '${key}' exceeded the quota.`,
          'QuotaExceededError'
        );
      }
      memory.set(key, stringValue);
      used = nextUsed;
    },
    removeItem(key: string) {
      const previous = memory.get(key);
      if (previous === undefined) return;
      used -= previous.length;
      memory.delete(key);
    },
    seed(key: string, value: string) {
      const previous = memory.get(key)?.length ?? 0;
      memory.set(key, value);
      used += value.length - previous;
    },
  };

  const descriptor = { configurable: true, value: api };
  Object.defineProperty(window, 'localStorage', descriptor);
  Object.defineProperty(globalThis, 'localStorage', descriptor);

  return {
    seed: api.seed,
    get quotaFailures() {
      return quotaFailures;
    },
  };
}

function voiceNoteBlog(audioUrl: string): BlogPost[] {
  return [
    {
      id: 'blog-quota',
      slug: 'quota',
      title: 'Quota',
      subtitle: 'Storage pressure',
      category: 'Positional Deep-Dive',
      authorId: 'm-conor',
      authorName: 'Conor Redmond',
      authorRole: 'Lead Tactical Analyst',
      publishedAt: '2026-11-09T00:00:00Z',
      readTimeMinutes: 1,
      tags: [],
      linkedPositions: [10],
      spotlightPlayerNames: [],
      sections: [{ body: 'Body copy stays in the main save.' }],
      voiceNotes: [
        {
          id: 'vn-quota',
          authorId: 'm-conor',
          authorName: 'Conor Redmond',
          durationSeconds: 12,
          audioUrl,
          transcript: 'Keep this transcript',
          createdAt: '2026-11-09T00:00:00Z',
        },
      ],
      likes: [],
      comments: [],
    },
  ];
}

describe('voice note persistence', () => {
  const originalLocalStorage = window.localStorage;

  afterEach(async () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    });
    await clearStoredVoiceAudio();
    vi.restoreAllMocks();
  });

  it('keeps a squad edit when voice-note audio has already blown the localStorage quota', async () => {
    const quota = 400_000;
    const storage = installQuotaStorage(quota);
    const audioUrl = `data:audio/webm;base64,${'A'.repeat(700_000)}`;
    storage.seed(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(voiceNoteBlog(audioUrl)));

    const first = renderHook(() => useDepthStore());

    await waitFor(() => {
      expect(first.result.current.persistenceNotice?.message).toMatch(/voice-note audio was moved/i);
    });
    expect(storage.quotaFailures).toBeGreaterThan(0);
    const storedBlog = localStorage.getItem(STORAGE_KEYS.BLOG_POSTS);
    expect(storedBlog).toContain('Keep this transcript');
    expect(storedBlog).not.toContain('data:audio');

    act(() => {
      first.result.current.addPlayer({
        name: 'Quota Survivor',
        pos: 10,
        rating: 77,
        province: 'Munster',
      });
    });

    expect(localStorage.getItem(STORAGE_KEYS.PLAYERS)).toContain('Quota Survivor');
    first.unmount();

    const reloaded = renderHook(() => useDepthStore());
    expect(reloaded.result.current.players.some((player) => player.name === 'Quota Survivor')).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.BLOG_POSTS)).not.toContain('data:audio');

    await waitFor(() => {
      const note = reloaded.result.current.blogPosts
        .flatMap((post) => post.voiceNotes ?? [])
        .find((entry) => entry.id === 'vn-quota');
      expect(note?.transcript).toBe('Keep this transcript');
      expect(note?.audioUrl).toBe(audioUrl);
    });

    reloaded.unmount();
  });

  it('tells the user when a save fails and storage cannot be freed', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    installQuotaStorage(0);

    const hook = renderHook(() => useDepthStore());

    await waitFor(() => {
      expect(hook.result.current.persistenceNotice?.level).toBe('error');
    });
    expect(hook.result.current.persistenceNotice?.message).toMatch(/could not save your latest change/i);
    expect(error).toHaveBeenCalled();
    hook.unmount();
  });

  it('drops an oversized data URL before it can enter the squad save', () => {
    const posts = voiceNoteBlog(`data:audio/webm;base64,${'B'.repeat(MAX_VOICE_NOTE_DATA_URL_CHARS + 20)}`);
    const detached = detachVoiceAudio(posts);
    expect(detached.droppedOversized).toBe(true);
    expect(detached.extracted).toHaveLength(0);
    expect(detached.posts[0]?.voiceNotes?.[0]?.audioUrl).toBeUndefined();
    expect(detached.posts[0]?.voiceNotes?.[0]?.transcript).toBe('Keep this transcript');
  });
});
