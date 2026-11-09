import React, { useState, useRef, useEffect } from 'react';
import { VoiceNote } from '../../types/depth';
import { MAX_VOICE_NOTE_BLOB_BYTES, MAX_VOICE_NOTE_SECONDS } from '../../lib/voiceNoteLimits';
import {
  Mic,
  Square,
  Play,
  Pause,
  Volume2,
  Sparkles,
  Check,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const WAVE_BARS = [35, 65, 45, 85, 55, 95, 70, 40, 80, 90, 50, 75, 60, 85, 45, 65, 50, 40];

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

interface VoiceNotePlayerProps {
  voiceNote: VoiceNote;
  compact?: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  voiceNote,
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.25 | 1.5 | 2>(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const stopPlayback = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopPlayback();
      return;
    }

    setElapsed(0);
    setIsPlaying(true);

    if (voiceNote.audioUrl) {
      const audio = new Audio(voiceNote.audioUrl);
      audio.playbackRate = speed;
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        setElapsed(Math.min(voiceNote.durationSeconds, audio.currentTime));
      };
      audio.onended = () => {
        stopPlayback();
        setElapsed(voiceNote.durationSeconds);
      };
      audio.onerror = () => {
        stopPlayback();
      };
      audio.play().catch(() => {
        stopPlayback();
      });
      return;
    }

    // Fallback for seeded or transcript-backed voice notes: Web Speech Synthesis + synced progress timer
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && voiceNote.transcript) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(voiceNote.transcript);
        utterance.lang = 'en-IE';
        utterance.rate = speed;
        utterance.onend = () => {
          stopPlayback();
          setElapsed(voiceNote.durationSeconds);
        };
        window.speechSynthesis.speak(utterance);
      } catch {
        // Continue with visual timer even if headless browser blocks speechSynthesis
      }
    }

    const stepMs = 250;
    timerRef.current = window.setInterval(() => {
      setElapsed((prev) => {
        const next = prev + (stepMs / 1000) * speed;
        if (next >= voiceNote.durationSeconds) {
          stopPlayback();
          return voiceNote.durationSeconds;
        }
        return next;
      });
    }, stepMs);
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const order: Array<1 | 1.25 | 1.5 | 2> = [1, 1.25, 1.5, 2];
    const next = order[(order.indexOf(speed) + 1) % order.length] ?? 1;
    setSpeed(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  };

  const progressRatio =
    voiceNote.durationSeconds > 0
      ? Math.min(1, elapsed / voiceNote.durationSeconds)
      : 0;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`rounded-2xl border transition ${
        compact
          ? 'p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/70'
          : 'p-4 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-emerald-50/80 dark:from-emerald-950/40 dark:via-slate-800/90 dark:to-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 shadow-2xs'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-[#0D6938] hover:bg-[#0a522c] text-white flex items-center justify-center shrink-0 shadow-xs transition cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <Volume2 className="w-3.5 h-3.5 text-[#0D6938] dark:text-emerald-400 shrink-0" />
                <span className="font-black text-slate-900 dark:text-white">
                  {voiceNote.authorName}
                </span>
                {voiceNote.authorRole && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                    {voiceNote.authorRole}
                  </span>
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  · Voice Note
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {formatDuration(elapsed)} / {formatDuration(voiceNote.durationSeconds)}
                </span>
                <button
                  type="button"
                  onClick={cycleSpeed}
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-emerald-800 dark:text-emerald-300 cursor-pointer"
                  title="Change voice note playback speed"
                >
                  {speed}x
                </button>
              </div>
            </div>

            {/* Waveform Progress Bars */}
            <div className="flex items-end gap-1 h-5 pt-0.5" aria-hidden="true">
              {WAVE_BARS.map((heightPct, idx) => {
                const barProgress = (idx + 1) / WAVE_BARS.length;
                const active = isPlaying
                  ? barProgress <= progressRatio || idx === Math.floor(progressRatio * WAVE_BARS.length)
                  : barProgress <= progressRatio;
                return (
                  <div
                    key={idx}
                    style={{ height: `${heightPct}%` }}
                    className={`flex-1 rounded-full transition-all duration-150 ${
                      active
                        ? 'bg-[#0D6938] dark:bg-emerald-400'
                        : 'bg-emerald-300/60 dark:bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {voiceNote.transcript && (
        <p className="mt-2.5 text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed pl-12">
          &ldquo;{voiceNote.transcript}&rdquo;
        </p>
      )}
    </div>
  );
};

interface VoiceNoteRecorderProps {
  authorName: string;
  onSaveVoiceNote: (note: {
    durationSeconds: number;
    audioUrl?: string;
    transcript: string;
  }) => void;
  onDictateToText?: (transcribedText: string) => void;
  placeholder?: string;
  compact?: boolean;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  authorName,
  onSaveVoiceNote,
  onDictateToText,
  placeholder = 'Speak into your mic or type a voice-note summary (e.g. "Watch Prendergast on 3rd phase...")',
  compact = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [micNotice, setMicNotice] = useState<string | null>(null);

  const [isEncodingAudio, setIsEncodingAudio] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const speechRecRef = useRef<SpeechRecognitionInstance | null>(null);
  const startTokenRef = useRef(0);
  const elapsedRef = useRef(0);
  const overLimitRef = useRef(false);
  const audioSettleRef = useRef<Promise<string | undefined>>(Promise.resolve(undefined));
  // undefined = no captured audio, null = capture is still encoding.
  const audioReadyRef = useRef<string | undefined | null>(undefined);

  const cleanupRecording = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {
        // ignore
      }
      speechRecRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      startTokenRef.current += 1;
      cleanupRecording();
    };
  }, []);

  const startRecording = async () => {
    const token = ++startTokenRef.current;
    setMicNotice(null);
    setDurationSeconds(0);
    setIsEncodingAudio(false);
    setIsRecording(true);
    elapsedRef.current = 0;
    overLimitRef.current = false;
    audioReadyRef.current = undefined;
    audioSettleRef.current = Promise.resolve(undefined);

    // Start elapsed timer
    timerRef.current = window.setInterval(() => {
      elapsedRef.current += 1;
      if (elapsedRef.current >= MAX_VOICE_NOTE_SECONDS) {
        setDurationSeconds(MAX_VOICE_NOTE_SECONDS);
        setMicNotice(
          `Voice notes are limited to ${MAX_VOICE_NOTE_SECONDS} seconds so they cannot fill browser storage.`
        );
        stopRecording();
        return;
      }
      setDurationSeconds(elapsedRef.current);
    }, 1000);

    // Start Web Speech Recognition if available for live auto-transcription
    if (typeof window !== 'undefined') {
      const win = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
      };
      const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-IE';
          rec.onresult = (event) => {
            const parts: string[] = [];
            for (let i = 0; i < event.results.length; i++) {
              const item = event.results[i]?.[0];
              if (item?.transcript) parts.push(item.transcript);
            }
            if (parts.length > 0) {
              setTranscript(parts.join(' ').trim());
            }
          };
          rec.start();
          speechRecRef.current = rec;
        } catch {
          // SpeechRecognition optional
        }
      }
    }

    // Start MediaRecorder for real microphone capture if available.
    // Permission can outlive a cancelled start: if Stop already won, release
    // the tracks and never call MediaRecorder.start.
    if (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined'
    ) {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (token !== startTokenRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        chunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        if (token !== startTokenRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          return;
        }
        mediaRecorderRef.current = recorder;

        let resolveAudio: (url: string | undefined) => void = () => {};
        audioReadyRef.current = null;
        audioSettleRef.current = new Promise((resolve) => {
          resolveAudio = resolve;
        });
        const finishAudio = (url: string | undefined) => {
          audioReadyRef.current = url;
          resolveAudio(url);
          resolveAudio = () => {};
        };

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
          const total = chunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
          if (total > MAX_VOICE_NOTE_BLOB_BYTES && !overLimitRef.current) {
            overLimitRef.current = true;
            setMicNotice('This voice note is too large to store. The transcript was kept.');
            window.setTimeout(() => stopRecording(), 0);
          }
        };

        recorder.onstop = () => {
          if (chunksRef.current.length === 0) {
            setIsEncodingAudio(false);
            finishAudio(undefined);
            return;
          }
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          });
          if (blob.size > MAX_VOICE_NOTE_BLOB_BYTES) {
            setIsEncodingAudio(false);
            setMicNotice('This voice note is too large to store. The transcript was kept.');
            finishAudio(undefined);
            return;
          }
          setIsEncodingAudio(true);
          const reader = new FileReader();
          reader.onloadend = () => {
            const url = typeof reader.result === 'string' ? reader.result : undefined;
            setIsEncodingAudio(false);
            finishAudio(url);
          };
          reader.onerror = () => {
            setIsEncodingAudio(false);
            setMicNotice('Could not read the recording. The transcript was kept.');
            finishAudio(undefined);
          };
          reader.readAsDataURL(blob);
        };

        recorder.start(250);
      } catch {
        stream?.getTracks().forEach((track) => track.stop());
        if (token !== startTokenRef.current) return;
        setMicNotice(
          'Microphone permission unavailable—recording timed voice memo with spoken transcript synthesis.'
        );
      }
    } else if (token === startTokenRef.current) {
      setMicNotice(
        'Browser audio capture unavailable—recording timed voice memo with spoken transcript synthesis.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setIsEncodingAudio(true);
    }
    startTokenRef.current += 1;
    cleanupRecording();
    setDurationSeconds((prev) => Math.max(3, prev));
  };

  const publishVoiceNote = (audioUrl: string | undefined) => {
    const cleanTranscript =
      transcript.trim() ||
      `${authorName} recorded a ${Math.max(4, durationSeconds || 8)}-second Clubhouse voice note.`;
    const finalDuration =
      durationSeconds > 0
        ? durationSeconds
        : Math.max(5, Math.round(cleanTranscript.split(/\s+/).length / 2.5));

    onSaveVoiceNote({
      durationSeconds: finalDuration,
      audioUrl,
      transcript: cleanTranscript,
    });

    audioReadyRef.current = undefined;
    audioSettleRef.current = Promise.resolve(undefined);
    setTranscript('');
    setDurationSeconds(0);
    setIsEncodingAudio(false);
    setMicNotice(null);
  };

  const handleSave = () => {
    if (audioReadyRef.current === null) {
      void audioSettleRef.current.then((audioUrl) => {
        publishVoiceNote(audioUrl);
      });
      return;
    }
    publishVoiceNote(audioReadyRef.current);
  };

  const handleReset = () => {
    startTokenRef.current += 1;
    cleanupRecording();
    audioReadyRef.current = undefined;
    audioSettleRef.current = Promise.resolve(undefined);
    setIsEncodingAudio(false);
    setTranscript('');
    setDurationSeconds(0);
    setMicNotice(null);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/90 dark:bg-slate-800/60 ${
        compact ? 'p-3 space-y-2.5' : 'p-4 space-y-3'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isRecording ? 'bg-red-500 animate-ping' : 'bg-[#0D6938]'
            }`}
          />
          <span className="text-xs font-black text-slate-900 dark:text-white">
            {isRecording
              ? `Recording Voice Note (${formatDuration(durationSeconds)})...`
              : durationSeconds > 0
              ? `Voice Note Ready (${formatDuration(durationSeconds)})`
              : 'Record Clubhouse Voice Note'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-2xs transition cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{durationSeconds > 0 ? 'Re-record Mic' : 'Start Recording'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>Stop ({formatDuration(durationSeconds)})</span>
            </button>
          )}

          {(durationSeconds > 0 || transcript.trim().length > 0) && !isRecording && (
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition cursor-pointer"
              title="Discard voice note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {micNotice && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/60">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{micNotice}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0D6938]"
        />

        <div className="flex items-center gap-1.5 shrink-0">
          {onDictateToText && transcript.trim().length > 0 && (
            <button
              type="button"
              onClick={() => {
                onDictateToText(transcript.trim());
                setTranscript('');
              }}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Insert into Article</span>
            </button>
          )}

          <button
            type="button"
            disabled={isRecording || isEncodingAudio || (durationSeconds === 0 && !transcript.trim())}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-[#0a522c] disabled:opacity-40 text-white transition cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isEncodingAudio ? 'Preparing audio…' : 'Post Voice Note'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
