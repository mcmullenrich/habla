export interface AudioRecorder {
  start: () => void;
  stop: () => Promise<Blob>;
  cancel: () => void;
  isRecording: () => boolean;
}

export function isMediaRecorderSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'MediaRecorder' in window && 'mediaDevices' in navigator;
}

export function getSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';

  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }

  return 'audio/webm';
}

export function getFileExtension(mimeType: string): string {
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'webm';
}

export async function createAudioRecorder(): Promise<AudioRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = getSupportedMimeType();
  const recorder = new MediaRecorder(stream, { mimeType });
  let chunks: Blob[] = [];
  let recording = false;
  let resolveStop: ((blob: Blob) => void) | null = null;

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mimeType });
    chunks = [];
    recording = false;
    if (resolveStop) {
      resolveStop(blob);
      resolveStop = null;
    }
  };

  const stopTracks = () => {
    stream.getTracks().forEach((track) => track.stop());
  };

  return {
    start() {
      chunks = [];
      recording = true;
      recorder.start();
    },

    stop(): Promise<Blob> {
      return new Promise((resolve) => {
        resolveStop = (blob) => {
          stopTracks();
          resolve(blob);
        };
        recorder.stop();
      });
    },

    cancel() {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
      chunks = [];
      recording = false;
      stopTracks();
    },

    isRecording() {
      return recording;
    },
  };
}
