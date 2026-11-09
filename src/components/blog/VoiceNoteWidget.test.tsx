import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { VoiceNoteRecorder } from './VoiceNoteWidget';

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

    await act(async () => {
      pendingReader!.result = 'data:audio/webm;base64,QUJD';
      pendingReader!.onloadend?.();
    });

    const post = screen.getByRole('button', { name: /Post Voice Note/i });
    expect((post as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(post);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        audioUrl: 'data:audio/webm;base64,QUJD',
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
