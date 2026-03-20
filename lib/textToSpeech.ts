let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

function loadVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const updateVoices = () => {
    cachedVoice = getSpanishVoice();
    voicesLoaded = true;
  };

  // Voices may already be loaded
  if (window.speechSynthesis.getVoices().length > 0) {
    updateVoices();
  }

  // Chrome loads voices asynchronously
  window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
}

function getSpanishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();

  // Prefer specific voices
  const preferred = ['Paulina', 'Google español'];
  for (const name of preferred) {
    const voice = voices.find((v) => v.name.includes(name));
    if (voice) return voice;
  }

  // Fall back to any es-MX voice
  const esMX = voices.find((v) => v.lang === 'es-MX');
  if (esMX) return esMX;

  // Fall back to any Spanish voice
  const esAny = voices.find((v) => v.lang.startsWith('es'));
  if (esAny) return esAny;

  return null;
}

export function isTTSSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

export function initTTS(): void {
  loadVoices();
}

export function speak(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (!isTTSSupported()) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-MX';
  utterance.rate = 0.85;

  if (voicesLoaded && cachedVoice) {
    utterance.voice = cachedVoice;
  }

  let ended = false;
  const safeEnd = () => {
    if (ended) return;
    ended = true;
    clearTimeout(fallbackTimer);
    onEnd?.();
  };

  if (onStart) utterance.onstart = onStart;
  utterance.onend = safeEnd;
  utterance.onerror = safeEnd;

  // Safety timeout — browser TTS sometimes never fires onend
  const estimatedMs = Math.max(text.length * 100, 3000);
  const fallbackTimer = setTimeout(safeEnd, estimatedMs);

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (!isTTSSupported()) return;
  window.speechSynthesis.cancel();
}
