'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types/conversation';

interface ConversationViewProps {
  messages: Message[];
  interimTranscript: string;
  isLoading: boolean;
}

export default function ConversationView({
  messages,
  interimTranscript,
  isLoading,
}: ConversationViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript, isLoading]);

  if (messages.length === 0 && !interimTranscript && !isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div>
          <p className="text-2xl mb-2">👋</p>
          <p className="text-lg text-gray-400">
            ¡Hola! Presiona el micrófono para comenzar.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Press the microphone to start a conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-gray-700 text-gray-100 rounded-bl-sm'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}

      {interimTranscript && (
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-blue-600/50 text-white/70 rounded-br-sm">
            <p className="whitespace-pre-wrap">{interimTranscript}</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-700 rounded-2xl px-4 py-3 rounded-bl-sm">
            <div className="flex space-x-1.5">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
