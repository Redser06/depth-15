import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { VoiceNoteRecorder } from './VoiceNoteWidget';
import { MAX_VOICE_NOTE_BLOB_BYTES } from '../../lib/voiceNoteLimits';

function invokeOnClick(element: HTMLElement) {
  const propsKey = Object.keys(element).find((key) => key.startsWith('__reactProps'));
  if (!propsKey) throw new Error('React props not found on element');
  const props = (element as unknown as Record<string, { onClick?: () => void }>)[propsKey];
  if (!props?.onClick) throw new Error('onClick missing');
  props.onClick();
}

class RecordingDouble {
  state: RecordingState = 'inactive';
  mimeType = 'audio/webm';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  start() {
    this.state = 'recording';
    this.ondataavailable?.({ data: new Blob(['mic'], { type: 'audio/webm' }) });
  }

  stop() {
    this.ondataavailable?.({ data: new Blob(['tail'], { type: 'audio/webm' }) });
    this.state = 'inactive';
    this.onstop?.();
  }
}

describe('VoiceNoteRecorder', () => {
  const mediaDevicesDescriptor = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices');

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    if (mediaDevicesDescriptor) {
      Object.defineProperty(navigator, 'mediaDevices', mediaDevicesDescriptor);
    } else {
      Reflect.deleteProperty(navigator, 'mediaDevices');
    }
  });

  it('does not start the recorder when Stop wins the permission prompt', async () => {
    const trackStop = vi.fn();
    let resolveStream: ((stream: MediaStream) => void) | null = null;
    const constructed: RecordingDouble[] = [];

    class GuardedRecorder extends RecordingDouble {
      constructor() {
        super();
        constructed.push(this);
      }
    }

    vi.stubGlobal('MediaRecorder', GuardedRecorder);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn(
          () =>
            new Promise<MediaStream>((resolve) => {
              resolveStream = resolve;
            })
        ),
      },
    });

    render(<VoiceNoteRecorder authorName="Conor Redmond" onSaveVoiceNote={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }));
    fireEvent.click(screen.getByRole('button', { name: /Stop/i }));

    await act(async () => {
      resolveStream?.({
        getTracks: () => [{ stop: trackStop } as unknown as MediaStreamTrack],
      } as MediaStream);
      await Promise.resolve();
    });

    expect(trackStop).toHaveBeenCalled();
    expect(constructed).toHaveLength(0);
    expect(screen.queryByText(/Recording Voice Note/i)).toBeNull();
  });

  it('starts recording only after permission resolves', async () => {
    const trackStop = vi.fn();
    const constructed: RecordingDouble[] = [];

    class LiveRecorder extends RecordingDouble {
      constructor() {
        super();
        constructed.push(this);
      }
    }

    vi.stubGlobal('MediaRecorder', LiveRecorder);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn(async () => ({
          getTracks: () => [{ stop: trackStop } as unknown as MediaStreamTrack],
        })),
      },
    });

    render(<VoiceNoteRecorder authorName="Conor Redmond" onSaveVoiceNote={vi.fn()} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }));
    });

    expect(constructed).toHaveLength(1);
    expect(constructed[0]?.state).toBe('recording');
    expect(trackStop).not.toHaveBeenCalled();
  });

  it('waits for base64 conversion before posting the voice note', async () => {
    const onSave = vi.fn();
    let pendingReader: {
      result: string | null;
      onloadend: (() => void) | null;
    } | null = null;

    class DeferredReader {
      result: string | null = null;
      onloadend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readAsDataURL() {
        pendingReader = this;
      }
    }

    vi.stubGlobal('MediaRecorder', RecordingDouble);
    vi.stubGlobal('FileReader', DeferredReader);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn(async () => ({
          getTracks: () => [{ stop: vi.fn() } as unknown as MediaStreamTrack],
        })),
      },
    });

    render(<VoiceNoteRecorder authorName="Conor Redmond" onSaveVoiceNote={onSave} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }));
    });
    fireEvent.click(screen.getByRole('button', { name: /Stop/i }));

    const preparing = screen.getByRole('button', { name: /Preparing audio/i });
    expect((preparing as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(preparing);
    expect(onSave).not.toHaveBeenCalled();

    // The button is disabled, so invoke the handler directly. Removing the wait
    // branch would post immediately with no audio URL.
    invokeOnClick(preparing);
    expect(onSave).not.toHaveBeenCalled();

    await act(async () => {
      pendingReader!.result = 'data:audio/webm;base64,QUJD';
      pendingReader!.onloadend?.();
      await Promise.resolve();
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        audioUrl: 'data:audio/webm;base64,QUJD',
      })
    );
  });

  it('does not attach a discarded recording when its conversion finishes later', async () => {
    const onSave = vi.fn();
    let pendingReader: {
      result: string | null;
      onloadend: (() => void) | null;
    } | null = null;

    class DeferredReader {
      result: string | null = null;
      onloadend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readAsDataURL() {
        pendingReader = this;
      }
    }

    vi.stubGlobal('MediaRecorder', RecordingDouble);
    vi.stubGlobal('FileReader', DeferredReader);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn(async () => ({
          getTracks: () => [{ stop: vi.fn() } as unknown as MediaStreamTrack],
        })),
      },
    });

    render(<VoiceNoteRecorder authorName="Conor Redmond" onSaveVoiceNote={onSave} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }));
    });
    fireEvent.click(screen.getByRole('button', { name: /Stop/i }));
    fireEvent.click(screen.getByTitle('Discard voice note'));

    await act(async () => {
      pendingReader!.result = 'data:audio/webm;base64,DISCARDED';
      pendingReader!.onloadend?.();
      await Promise.resolve();
    });
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText(/Speak into your mic/i), {
      target: { value: 'Typed after discard' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Post Voice Note/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        transcript: 'Typed after discard',
        audioUrl: undefined,
      })
    );
  });

  it('does not encode a recording past the byte cap', async () => {
    class OversizeRecorder extends RecordingDouble {
      override stop() {
        this.ondataavailable?.({
          data: new Blob([new Uint8Array(MAX_VOICE_NOTE_BLOB_BYTES + 1)]),
        });
        this.state = 'inactive';
        this.onstop?.();
      }
    }

    vi.stubGlobal('MediaRecorder', OversizeRecorder);
    vi.stubGlobal(
      'FileReader',
      class {
        readAsDataURL() {
          throw new Error('oversized audio should not be encoded');
        }
      }
    );
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn(async () => ({
          getTracks: () => [{ stop: vi.fn() } as unknown as MediaStreamTrack],
        })),
      },
    });

    const onSave = vi.fn();
    render(<VoiceNoteRecorder authorName="Conor Redmond" onSaveVoiceNote={onSave} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Stop/i }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByText(/too large to store/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Post Voice Note/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        audioUrl: undefined,
      })
    );
  });

  it('stops a recording at the duration cap', () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: undefined,
    });
    render(<VoiceNoteRecorder authorName="Conor Redmond" onSaveVoiceNote={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }));
    expect(screen.getByText(/Recording Voice Note/i)).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(89_000);
    });
    expect(screen.getByText(/Recording Voice Note/i)).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(screen.queryByText(/Recording Voice Note/i)).toBeNull();
    expect(screen.getByText(/limited to 90 seconds/i)).toBeTruthy();
  });
});
