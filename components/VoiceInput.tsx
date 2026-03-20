'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  SpeechRecognitionInstance,
} from '@/lib/speechRecognition';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onInterim: (text: string) => void;
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
  disabled: boolean;
}

export default function VoiceInput({
  onTranscript,
  onInterim,
  isListening,
  onListeningChange,
  disabled,
}: VoiceInputProps) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptRef = useRef('');
  const interimRef = useRef('');
  const [supported, setSupported] = useState(true);
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  const finishRecording = useCallback((submit: boolean) => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    // Use finalized text, fall back to interim (Safari doesn't finalize until after stop)
    const text = (transcriptRef.current || interimRef.current).trim();
    transcriptRef.current = '';
    interimRef.current = '';
    onInterim('');
    onListeningChange(false);

    if (text) {
      if (submit) {
        onTranscript(text);
      } else {
        setTextInput(text);
      }
    }
  }, [onListeningChange, onInterim, onTranscript]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    transcriptRef.current = '';
    onListeningChange(false);
    onInterim('');
  }, [onListeningChange, onInterim]);

  const startRecognition = useCallback(() => {
    if (disabled) return;

    const recognition = createSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    transcriptRef.current = '';

    recognition.onresult = (event) => {
      let finalSoFar = '';
      let interim = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalSoFar += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      transcriptRef.current = finalSoFar;
      interimRef.current = interim;
      onInterim((finalSoFar + ' ' + interim).trim());
    };

    recognition.onerror = () => {
      stopRecognition();
    };

    recognition.onend = () => {
      // Browser stopped unexpectedly — place text in input for review
      const text = (transcriptRef.current || interimRef.current).trim();
      transcriptRef.current = '';
      interimRef.current = '';
      onListeningChange(false);
      onInterim('');
      if (text) {
        setTextInput(text);
      }
    };

    recognition.start();
    onListeningChange(true);
  }, [disabled, onInterim, onListeningChange, stopRecognition]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      // Stop recording and place text in input for review
      finishRecording(false);
    } else {
      startRecognition();
    }
  }, [isListening, finishRecording, startRecognition]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && !disabled) {
      onTranscript(textInput.trim());
      setTextInput('');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {supported && (
        <button
          onClick={toggleListening}
          disabled={disabled}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            disabled
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : isListening
                ? 'bg-red-500 mic-pulse'
                : 'bg-green-600 hover:bg-green-500 active:scale-95'
          }`}
          aria-label={isListening ? 'Stop recording' : 'Start recording'}
        >
          {isListening ? (
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      )}

      {!supported && (
        <p className="text-sm text-yellow-400 text-center">
          Voice input requires Chrome. Use the text field below.
        </p>
      )}

      <form onSubmit={handleTextSubmit} className="flex gap-2 w-full max-w-md">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="O escribe en español..."
          disabled={disabled}
          className="flex-1 bg-gray-800 border border-gray-600 rounded-full px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-green-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !textInput.trim()}
          className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full px-4 py-2 text-sm transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
