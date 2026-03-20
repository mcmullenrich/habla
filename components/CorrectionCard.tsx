'use client';

import { Correction } from '@/types/conversation';

interface CorrectionCardProps {
  corrections: Correction[];
}

export default function CorrectionCard({ corrections }: CorrectionCardProps) {
  if (corrections.length === 0) {
    return (
      <div className="mx-4 mb-3 p-3 bg-green-900/30 border border-green-700/50 rounded-xl">
        <p className="text-green-400 text-sm text-center">
          ✓ ¡Muy bien! No hay correcciones.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-3 p-4 bg-amber-900/20 border border-amber-700/40 rounded-xl space-y-3">
      <p className="text-amber-400 text-sm font-medium">📝 Corrections</p>
      {corrections.map((correction, i) => (
        <div key={i} className="space-y-1 text-sm">
          <p>
            <span className="text-red-400 line-through">{correction.original}</span>
          </p>
          <p>
            <span className="text-green-400">{correction.corrected}</span>
          </p>
          <p className="text-gray-400 text-xs">{correction.explanation}</p>
        </div>
      ))}
    </div>
  );
}
