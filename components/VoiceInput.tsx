'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createAudioRecorder,
  isMediaRecorderSupported,
  getFileExtension,
  getSupportedMimeType,
  AudioRecorder,
} from '@/lib/audioRecorder';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onStatusChange: (status: string) => void;
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
  disabled: boolean;
}

type RecordingState = 'idle' | 'recording' | 'transcribing';

export default function VoiceInput({
  onTranscript,
  onStatusChange,
  isRecording,
  onRecordingChange,
  disabled,
}: VoiceInputProps) {
  const recorderRef = useRef<AudioRecorder | null>(null);
  const [supported, setSupported] = useState(true);
  const [internalState, setInternalState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported(isMediaRecorderSupported());
  }, []);

  const startRecording = useCallback(async () => {
    if (disabled || internalState !== 'idle') return;

    setError(null);

    try {
      const recorder = await createAudioRecorder();
      recorderRef.current = recorder;
      recorder.start();
      setInternalState('recording');
      onRecordingChange(true);
      onStatusChange('🎙️ Recording...');
    } catch {
      setError('Microphone access denied. Please allow microphone in browser settings.');
    }
  }, [disabled, internalState, onRecordingChange, onStatusChange]);

  const stopAndTranscribe = useCallback(async () => {
    if (!recorderRef.current || internalState !== 'recording') return;

    setInternalState('transcribing');
    onRecordingChange(false);
    onStatusChange('Transcribing...');

    try {
      const blob = await recorderRef.current.stop();
      recorderRef.current = null;

      const mimeType = getSupportedMimeType();
      const ext = getFileExtension(mimeType);
      const formData = new FormData();
      formData.append('audio', blob, `recording.${ext}`);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Transcription failed');
      }

      const transcript: string = data.transcript;

      // Show transcript preview briefly before sending
      onStatusChange(transcript);
      setTimeout(() => {
        onStatusChange('');
        onTranscript(transcript);
      }, 1500);
    } catch (err) {
      onStatusChange('');
      setError(err instanceof Error ? err.message : 'Could not transcribe audio. Please try again.');
    } finally {
      setInternalState('idle');
    }
  }, [internalState, onRecordingChange, onStatusChange, onTranscript]);

  const toggleRecording = useCallback(() => {
    if (internalState === 'recording') {
      stopAndTranscribe();
    } else if (internalState === 'idle') {
      startRecording();
    }
  }, [internalState, startRecording, stopAndTranscribe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.cancel();
      }
    };
  }, []);

  const isDisabled = disabled || internalState === 'transcribing';

  return (
    <div className="flex flex-col items-center gap-3">
      {supported ? (
        <button
          onClick={toggleRecording}
          disabled={isDisabled}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isDisabled
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : isRecording
                ? 'bg-red-500 mic-pulse'
                : 'bg-green-600 hover:bg-green-500 active:scale-95'
          }`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : internalState === 'transcribing' ? (
            <svg className="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      ) : (
        <p className="text-sm text-yellow-400 text-center">
          Audio recording is not supported on this browser.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-400 text-center max-w-xs">{error}</p>
      )}
    </div>
  );
}
