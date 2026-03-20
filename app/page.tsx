'use client';

import { useReducer, useCallback, useState } from 'react';
import ConversationView from '@/components/ConversationView';
import VoiceInput from '@/components/VoiceInput';
import VoiceOutput from '@/components/VoiceOutput';
import CorrectionCard from '@/components/CorrectionCard';
import SessionSummary from '@/components/SessionSummary';
import ScenarioPicker, { Scenario } from '@/components/ScenarioPicker';
import { sessionReducer, initialSessionState } from '@/lib/conversationAgent';
import { ChatResponse } from '@/types/conversation';

export default function Home() {
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState);
  const [showSummary, setShowSummary] = useState(false);
  const [scenario, setScenario] = useState<Scenario | null>(null);

  const lastAssistantMessage = state.messages
    .filter((m) => m.role === 'assistant')
    .at(-1);

  const handleTranscript = useCallback(
    async (text: string) => {
      if (!state.sessionActive) {
        dispatch({ type: 'START_SESSION' });
      }

      dispatch({ type: 'ADD_USER_MESSAGE', content: text });
      dispatch({ type: 'SET_LOADING', loading: true });

      try {
        const history = state.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: text,
            history,
            scenarioPrompt: scenario?.prompt,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to get response');
        }

        const data: ChatResponse = await res.json();
        dispatch({
          type: 'ADD_ASSISTANT_MESSAGE',
          content: data.spanishResponse,
          corrections: data.corrections,
        });
      } catch {
        dispatch({
          type: 'SET_ERROR',
          error: 'Could not get a response. Please try again.',
        });
      }
    },
    [state.sessionActive, state.messages, scenario]
  );

  const handleSelectScenario = useCallback((selected: Scenario) => {
    setScenario(selected);
    dispatch({ type: 'START_SESSION' });
  }, []);

  const handleEndSession = useCallback(() => {
    dispatch({ type: 'END_SESSION' });
    setShowSummary(true);
  }, []);

  const handleNewSession = useCallback(() => {
    setShowSummary(false);
    setScenario(null);
  }, []);

  const handleCloseSummary = useCallback(() => {
    setShowSummary(false);
    setScenario(null);
  }, []);

  // Show scenario picker when no scenario is selected and no active session
  const showPicker = !scenario && !state.sessionActive && !showSummary;

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Habla</h1>
        {state.sessionActive && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{scenario?.title}</span>
            <button
              onClick={handleEndSession}
              className="text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 rounded-full px-4 py-1.5 transition-colors"
            >
              End Session
            </button>
          </div>
        )}
      </header>

      {showPicker ? (
        <ScenarioPicker onSelect={handleSelectScenario} />
      ) : (
        <>
          {/* Conversation */}
          <ConversationView
            messages={state.messages}
            interimTranscript={state.interimTranscript}
            isLoading={state.isLoading}
          />

          {/* Corrections for latest message */}
          {lastAssistantMessage && (
            <CorrectionCard corrections={lastAssistantMessage.corrections} />
          )}

          {/* Error banner */}
          {state.error && (
            <div className="mx-4 mb-2 p-3 bg-red-900/30 border border-red-700/50 rounded-xl">
              <p className="text-red-400 text-sm text-center">{state.error}</p>
            </div>
          )}

          {/* Voice controls */}
          {state.sessionActive && (
            <div className="border-t border-gray-800 px-4 py-4">
              <div className="flex items-center justify-center gap-4">
                <VoiceOutput
                  text={lastAssistantMessage?.content ?? null}
                  onSpeakingChange={(speaking) =>
                    dispatch({ type: 'SET_SPEAKING', speaking })
                  }
                  autoPlay={true}
                />
              </div>
              <div className="mt-3">
                <VoiceInput
                  onTranscript={handleTranscript}
                  onInterim={(transcript) =>
                    dispatch({ type: 'SET_INTERIM_TRANSCRIPT', transcript })
                  }
                  isListening={state.isListening}
                  onListeningChange={(listening) =>
                    dispatch({
                      type: listening ? 'START_LISTENING' : 'STOP_LISTENING',
                    })
                  }
                  disabled={state.isLoading || state.isSpeaking}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Session summary modal */}
      {showSummary && (
        <SessionSummary
          state={state}
          onClose={handleCloseSummary}
          onNewSession={handleNewSession}
        />
      )}
    </div>
  );
}
