'use client';

import { useEffect, useRef, useCallback } from 'react';
import { speak, stopSpeaking, initTTS, isTTSSupported } from '@/lib/textToSpeech';

interface VoiceOutputProps {
  text: string | null;
  onSpeakingChange: (speaking: boolean) => void;
  autoPlay: boolean;
}

export default function VoiceOutput({
  text,
  onSpeakingChange,
  autoPlay,
}: VoiceOutputProps) {
  const lastSpokenRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initTTS();
      initializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (text && autoPlay && text !== lastSpokenRef.current) {
      lastSpokenRef.current = text;
      speak(
        text,
        () => onSpeakingChange(true),
        () => onSpeakingChange(false)
      );
    }
  }, [text, autoPlay, onSpeakingChange]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleReplay = useCallback(() => {
    if (!text) return;
    speak(
      text,
      () => onSpeakingChange(true),
      () => onSpeakingChange(false)
    );
  }, [text, onSpeakingChange]);

  const handleStop = useCallback(() => {
    stopSpeaking();
    onSpeakingChange(false);
  }, [onSpeakingChange]);

  if (!isTTSSupported() || !text) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleReplay}
        className="text-gray-400 hover:text-white transition-colors p-1"
        aria-label="Replay"
        title="Replay response"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
      <button
        onClick={handleStop}
        className="text-gray-400 hover:text-white transition-colors p-1"
        aria-label="Stop"
        title="Stop speaking"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="1" />
        </svg>
      </button>
    </div>
  );
}
