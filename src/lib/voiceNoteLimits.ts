/** Spoken memos are capped so one recording cannot exhaust browser storage. */
export const MAX_VOICE_NOTE_SECONDS = 90;

/** Raw recorded bytes before base64 expansion. */
export const MAX_VOICE_NOTE_BLOB_BYTES = 800 * 1024;

/**
 * Max length of a `data:` URL we will keep. Base64 expands bytes by 4/3,
 * plus a short mime prefix.
 */
export const MAX_VOICE_NOTE_DATA_URL_CHARS =
  Math.ceil((MAX_VOICE_NOTE_BLOB_BYTES * 4) / 3) + 128;
