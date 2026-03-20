import { Correction, ErrorCategory } from '@/types/conversation';

interface ParsedResponse {
  spanishText: string;
  corrections: Correction[];
}

export function parseClaudeResponse(raw: string): ParsedResponse {
  const separatorIndex = raw.indexOf('\n---');
  if (separatorIndex === -1) {
    return { spanishText: raw.trim(), corrections: [] };
  }

  const spanishText = raw.slice(0, separatorIndex).trim();
  const correctionsBlock = raw.slice(separatorIndex + 4).trim();
  const corrections = parseCorrectionBlock(correctionsBlock);

  return { spanishText, corrections };
}

function parseCorrectionBlock(block: string): Correction[] {
  if (block.includes('¡Muy bien!') || block.includes('No hay correcciones')) {
    return [];
  }

  const corrections: Correction[] = [];
  const correctionPattern = /You said:\s*"([^"]+)"\s*\n\s*Better:\s*"([^"]+)"\s*\n\s*Why:\s*(.+?)\n\s*Category:\s*(\S+?)(?=\n\s*-\s*You said:|\n*$)/gs;

  let match;
  while ((match = correctionPattern.exec(block)) !== null) {
    const rawCategory = match[4].trim().toLowerCase();
    const validCategories: ErrorCategory[] = [
      'gender', 'ser_estar', 'verb_conjugation', 'subjunctive',
      'preposition', 'word_order', 'false_friend', 'vocabulary',
    ];
    const category = validCategories.includes(rawCategory as ErrorCategory)
      ? (rawCategory as ErrorCategory)
      : categorizeError({ original: match[1], corrected: match[2], explanation: match[3].trim() });

    corrections.push({
      original: match[1],
      corrected: match[2],
      explanation: match[3].trim(),
      category,
    });
  }

  // Fallback: if the new pattern didn't match (Claude omitted Category line), try without it
  if (corrections.length === 0) {
    const fallbackPattern = /You said:\s*"([^"]+)"\s*\n\s*Better:\s*"([^"]+)"\s*\n\s*Why:\s*(.+?)(?=\n\s*-\s*You said:|\n*$)/gs;
    let fallbackMatch;
    while ((fallbackMatch = fallbackPattern.exec(block)) !== null) {
      const correction: Correction = {
        original: fallbackMatch[1],
        corrected: fallbackMatch[2],
        explanation: fallbackMatch[3].trim(),
      };
      correction.category = categorizeError(correction);
      corrections.push(correction);
    }
  }

  return corrections;
}

export function categorizeError(correction: Correction): ErrorCategory {
  const explanation = correction.explanation.toLowerCase();
  const original = correction.original.toLowerCase();
  const corrected = correction.corrected.toLowerCase();

  if (explanation.includes('ser') && explanation.includes('estar') ||
      explanation.includes('ser/estar') || explanation.includes('ser vs estar')) {
    return 'ser_estar';
  }
  if (explanation.includes('gender') || explanation.includes('masculine') ||
      explanation.includes('feminine') || explanation.includes('género')) {
    return 'gender';
  }
  if (explanation.includes('subjunctive') || explanation.includes('subjuntivo')) {
    return 'subjunctive';
  }
  if (explanation.includes('conjugat') || explanation.includes('verb form') ||
      explanation.includes('tense') || explanation.includes('conjugación')) {
    return 'verb_conjugation';
  }
  if (explanation.includes('preposition') || explanation.includes('preposición')) {
    return 'preposition';
  }
  if (explanation.includes('word order') || explanation.includes('order of') ||
      explanation.includes('orden')) {
    return 'word_order';
  }
  if (explanation.includes('false friend') || explanation.includes('false cognate') ||
      explanation.includes('falso amigo')) {
    return 'false_friend';
  }

  // Check for common ser/estar swaps in the actual text
  const serEstarWords = ['soy', 'eres', 'es', 'somos', 'son', 'estoy', 'estás', 'está', 'estamos', 'están'];
  const origWords = original.split(/\s+/);
  const corrWords = corrected.split(/\s+/);
  for (const word of serEstarWords) {
    if ((origWords.includes(word) || corrWords.includes(word)) &&
        origWords.join(' ') !== corrWords.join(' ')) {
      const hasSer = origWords.some(w => ['soy', 'eres', 'es', 'somos', 'son'].includes(w)) ||
                     corrWords.some(w => ['soy', 'eres', 'es', 'somos', 'son'].includes(w));
      const hasEstar = origWords.some(w => ['estoy', 'estás', 'está', 'estamos', 'están'].includes(w)) ||
                       corrWords.some(w => ['estoy', 'estás', 'está', 'estamos', 'están'].includes(w));
      if (hasSer && hasEstar) return 'ser_estar';
    }
  }

  return 'vocabulary';
}

export function aggregateErrors(corrections: Correction[]): Record<ErrorCategory, number> {
  const counts: Record<ErrorCategory, number> = {
    gender: 0,
    ser_estar: 0,
    verb_conjugation: 0,
    subjunctive: 0,
    preposition: 0,
    word_order: 0,
    false_friend: 0,
    vocabulary: 0,
  };

  for (const correction of corrections) {
    const category = correction.category ?? categorizeError(correction);
    counts[category]++;
  }

  return counts;
}
