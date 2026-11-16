/**
 * Voice-note audio lives outside the main localStorage document.
 * localStorage is a single small quota shared with squad data; IndexedDB is not.
 * When IndexedDB is missing (tests, very old browsers) an in-memory map keeps
 * playback working for the session without touching that quota.
 */

interface VoiceAudioEntry {
  id: string;
  dataUrl: string;
}

const DB_NAME = 'depth15-voice-notes';
const STORE_NAME = 'audio';
const DB_VERSION = 1;

const memoryAudio = new Map<string, string>();
let dbPromise: Promise<IDBDatabase> | null = null;

function idbAvailable(): boolean {
  return typeof indexedDB !== 'undefined' && indexedDB !== null;
}

function openDb(): Promise<IDBDatabase> {
  if (!idbAvailable()) {
    return Promise.reject(new Error('IndexedDB is not available'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        reject(request.error ?? new Error('Failed to open voice-note database'));
      };
    });
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

async function storeInIdb(entries: VoiceAudioEntry[]): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const entry of entries) {
      store.put(entry.dataUrl, entry.id);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Failed to store voice note'));
    tx.onabort = () => reject(tx.error ?? new Error('Voice note store aborted'));
  });
}

async function readFromIdb(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const result: Record<string, string> = {};
    let remaining = ids.length;
    for (const id of ids) {
      const request = store.get(id);
      request.onsuccess = () => {
        if (typeof request.result === 'string') {
          result[id] = request.result;
        }
        remaining -= 1;
        if (remaining === 0) resolve(result);
      };
      request.onerror = () => reject(request.error ?? new Error('Failed to read voice note'));
    }
  });
}

function rememberInMemory(entries: VoiceAudioEntry[]): void {
  for (const entry of entries) {
    memoryAudio.set(entry.id, entry.dataUrl);
  }
}

export async function storeVoiceAudio(entries: VoiceAudioEntry[]): Promise<void> {
  if (entries.length === 0) return;
  // Keep a session copy first so a reload of this page can play the note even
  // while the IndexedDB write is still in flight.
  rememberInMemory(entries);
  if (!idbAvailable()) return;
  await storeInIdb(entries);
}

export async function loadVoiceAudio(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const result: Record<string, string> = {};
  const missing: string[] = [];
  for (const id of ids) {
    const cached = memoryAudio.get(id);
    if (cached) result[id] = cached;
    else missing.push(id);
  }
  if (missing.length === 0 || !idbAvailable()) return result;
  try {
    const stored = await readFromIdb(missing);
    const restored = Object.entries(stored).map(([id, dataUrl]) => ({ id, dataUrl }));
    rememberInMemory(restored);
    Object.assign(result, stored);
  } catch (error) {
    console.error(error);
  }
  return result;
}

export async function clearVoiceAudio(): Promise<void> {
  memoryAudio.clear();
  if (!idbAvailable()) return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Failed to clear voice notes'));
      tx.onabort = () => reject(tx.error ?? new Error('Voice note clear aborted'));
    });
  } catch (error) {
    console.error(error);
  }
}
