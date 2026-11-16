import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';

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

describe('voice audio IndexedDB', () => {
  afterEach(async () => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
    const { clearVoiceAudio } = await import('./voiceAudioStore');
    await clearVoiceAudio();
    vi.resetModules();
  });

  it('reads a note from IndexedDB after the in-memory session cache is gone', async () => {
    const first = await import('./voiceAudioStore');
    await first.storeVoiceAudio([{ id: 'vn-1', dataUrl: 'data:audio/webm;base64,QQ' }]);

    vi.resetModules();
    const second = await import('./voiceAudioStore');
    await expect(second.loadVoiceAudio(['vn-1'])).resolves.toEqual({
      'vn-1': 'data:audio/webm;base64,QQ',
    });
    await expect(second.loadVoiceAudio(['missing'])).resolves.toEqual({});
  });

  it('rejects a write IndexedDB cannot accept and keeps the session copy', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.resetModules();
    vi.stubGlobal('indexedDB', failingIndexedDb());
    const { storeVoiceAudio, loadVoiceAudio } = await import('./voiceAudioStore');

    await expect(
      storeVoiceAudio([{ id: 'vn-err', dataUrl: 'data:audio/webm;base64,QUJD' }])
    ).rejects.toThrow(/blocked|voice-note database|Failed to open/i);
    await expect(loadVoiceAudio(['vn-err'])).resolves.toEqual({
      'vn-err': 'data:audio/webm;base64,QUJD',
    });
  });

  it('returns nothing when a read fails and the session cache is empty', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.resetModules();
    vi.stubGlobal('indexedDB', failingIndexedDb());
    const { loadVoiceAudio } = await import('./voiceAudioStore');
    await expect(loadVoiceAudio(['vn-missing'])).resolves.toEqual({});
  });
});
