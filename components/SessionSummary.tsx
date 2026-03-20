'use client';

import { useMemo } from 'react';
import { SessionState } from '@/types/conversation';
import {
  getSessionDurationMinutes,
  getExchangeCount,
  getAllCorrections,
} from '@/lib/conversationAgent';
import { aggregateErrors } from '@/lib/errorAnalyzer';

const CATEGORY_LABELS: Record<string, string> = {
  gender: 'Gender Agreement',
  ser_estar: 'Ser vs Estar',
  verb_conjugation: 'Verb Conjugation',
  subjunctive: 'Subjunctive Mood',
  preposition: 'Prepositions',
  word_order: 'Word Order',
  false_friend: 'False Friends',
  vocabulary: 'Vocabulary',
};

interface SessionSummaryProps {
  state: SessionState;
  onClose: () => void;
  onNewSession: () => void;
}

export default function SessionSummary({
  state,
  onClose,
  onNewSession,
}: SessionSummaryProps) {
  const duration = getSessionDurationMinutes(state);
  const exchanges = getExchangeCount(state);
  const allCorrections = getAllCorrections(state);
  const errorCounts = useMemo(() => aggregateErrors(allCorrections), [allCorrections]);

  const topErrors = useMemo(() => {
    return Object.entries(errorCounts)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  }, [errorCounts]);

  const correctionsForCategory = (category: string) => {
    return allCorrections.filter((c) => c.category === category);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
        <h2 className="text-xl font-bold text-white">Session Summary</h2>

        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-gray-400">Duration</p>
            <p className="text-white text-lg font-medium">
              {duration < 1 ? '<1' : duration} min
            </p>
          </div>
          <div>
            <p className="text-gray-400">Exchanges</p>
            <p className="text-white text-lg font-medium">{exchanges}</p>
          </div>
          <div>
            <p className="text-gray-400">Corrections</p>
            <p className="text-white text-lg font-medium">{allCorrections.length}</p>
          </div>
        </div>

        {allCorrections.length === 0 ? (
          <div className="p-4 bg-green-900/30 border border-green-700/50 rounded-xl">
            <p className="text-green-400">
              ✓ Great session! No significant errors detected.
            </p>
          </div>
        ) : (
          <>
            {topErrors.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400">
                  Patterns to Work On
                </h3>
                {topErrors.map(([category, count]) => (
                  <div
                    key={category}
                    className="p-3 bg-gray-700/50 rounded-xl space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-white font-medium text-sm">
                        {CATEGORY_LABELS[category] ?? category}
                      </p>
                      <span className="text-xs text-gray-400">
                        {count} {count === 1 ? 'occurrence' : 'occurrences'}
                      </span>
                    </div>
                    {correctionsForCategory(category).slice(0, 2).map((c, i) => (
                      <div key={i} className="text-xs space-y-0.5">
                        <p>
                          <span className="text-red-400">{c.original}</span>
                          {' → '}
                          <span className="text-green-400">{c.corrected}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onNewSession}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-full py-2.5 text-sm font-medium transition-colors"
          >
            New Session
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-full py-2.5 text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
