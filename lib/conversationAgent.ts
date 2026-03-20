import { SessionState, SessionAction, Correction } from '@/types/conversation';

export const initialSessionState: SessionState = {
  messages: [],
  isListening: false,
  isSpeaking: false,
  isLoading: false,
  sessionActive: false,
  sessionStartTime: null,
  interimTranscript: '',
  error: null,
};

let messageCounter = 0;

function generateId(): string {
  messageCounter++;
  return `msg-${Date.now()}-${messageCounter}`;
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        sessionActive: true,
        sessionStartTime: Date.now(),
        messages: [],
        error: null,
      };

    case 'END_SESSION':
      return {
        ...state,
        sessionActive: false,
        isListening: false,
        isSpeaking: false,
        isLoading: false,
      };

    case 'START_LISTENING':
      return { ...state, isListening: true, error: null };

    case 'STOP_LISTENING':
      return { ...state, isListening: false, interimTranscript: '' };

    case 'SET_INTERIM_TRANSCRIPT':
      return { ...state, interimTranscript: action.transcript };

    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: generateId(),
            role: 'user',
            content: action.content,
            corrections: [],
            timestamp: Date.now(),
          },
        ],
        interimTranscript: '',
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };

    case 'ADD_ASSISTANT_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: generateId(),
            role: 'assistant',
            content: action.content,
            corrections: action.corrections,
            timestamp: Date.now(),
          },
        ],
        isLoading: false,
      };

    case 'SET_SPEAKING':
      return { ...state, isSpeaking: action.speaking };

    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false };

    default:
      return state;
  }
}

export function getSessionDurationMinutes(state: SessionState): number {
  if (!state.sessionStartTime) return 0;
  return Math.round((Date.now() - state.sessionStartTime) / 60000);
}

export function getExchangeCount(state: SessionState): number {
  return state.messages.filter((m) => m.role === 'user').length;
}

export function getAllCorrections(state: SessionState): Correction[] {
  return state.messages
    .filter((m) => m.role === 'assistant')
    .flatMap((m) => m.corrections);
}
