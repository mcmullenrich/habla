export type ErrorCategory =
  | 'gender'
  | 'ser_estar'
  | 'verb_conjugation'
  | 'subjunctive'
  | 'preposition'
  | 'word_order'
  | 'false_friend'
  | 'vocabulary';

export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
  category?: ErrorCategory;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  corrections: Correction[];
  timestamp: number;
}

export interface SessionState {
  messages: Message[];
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  sessionActive: boolean;
  sessionStartTime: number | null;
  interimTranscript: string;
  error: string | null;
}

export interface ChatRequest {
  transcript: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  scenarioPrompt?: string;
}

export interface ChatResponse {
  spanishResponse: string;
  corrections: Correction[];
  rawResponse: string;
}

export interface SessionSummaryData {
  duration: number;
  exchangeCount: number;
  allCorrections: Correction[];
  summaryText: string;
}

export type SessionAction =
  | { type: 'START_SESSION' }
  | { type: 'END_SESSION' }
  | { type: 'START_LISTENING' }
  | { type: 'STOP_LISTENING' }
  | { type: 'SET_INTERIM_TRANSCRIPT'; transcript: string }
  | { type: 'ADD_USER_MESSAGE'; content: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'ADD_ASSISTANT_MESSAGE'; content: string; corrections: Correction[] }
  | { type: 'SET_SPEAKING'; speaking: boolean }
  | { type: 'SET_ERROR'; error: string | null };
