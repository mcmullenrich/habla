# Habla — Spanish Conversation Practice Agent

## Project Vision
An AI-powered voice conversation partner that helps intermediate Spanish learners break through the plateau by providing patient, adaptive, judgment-free speaking practice with intelligent feedback.

## The Problem
Intermediate Spanish learners (1-3 years of study) get stuck because they have no affordable, always-available conversation partner who will:
- Let them speak without interruption
- Correct mistakes gently after they finish
- Adapt to their level
- Track patterns in their errors

## Target User
- Intermediate Spanish learner (B1-B2 level)
- Can read/write but freezes when speaking
- Tried Duolingo (too gamified), tutors (too expensive), language exchanges (too inconsistent)
- Wants daily practice in flexible session lengths (5-30 min)

---

## Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Framework | Next.js 14 (App Router) | Modern React, good DX, Vercel-native |
| Styling | Tailwind CSS | Rapid UI development |
| Voice Input | Web Speech API | Free, browser-native, no API costs |
| Conversation AI | Claude API (claude-sonnet-4-20250514) | Superior nuance for language correction |
| Voice Output | Browser SpeechSynthesis (V1) | Free; upgrade to ElevenLabs in V2 |
| Hosting | Vercel | Free tier, instant deploys |
| State | React useState/useReducer (V1) | No backend until we need persistence |

---

## Architecture

### Core Flow
```
User speaks → Web Speech API → Transcript → Claude API → Spanish response + corrections → Browser TTS → Audio playback
```

### Agent Design
This is not just an API call — it's an agent with:

1. **State Management**: Tracks conversation history, user mistakes, session duration
2. **Tools**: Speech-to-text, text-to-speech, error categorization
3. **Decision Logic**: Adjusts response complexity based on user performance
4. **Goal**: Help user complete a conversation and improve one specific thing

### Key Components
```
/app
  /page.tsx                 # Main conversation interface
  /layout.tsx               # App shell
  /api
    /chat/route.ts          # Claude API endpoint
/components
  /ConversationView.tsx     # Displays conversation history
  /VoiceInput.tsx           # Microphone button + speech recognition
  /VoiceOutput.tsx          # TTS playback controls
  /CorrectionCard.tsx       # Shows corrections after each turn
  /SessionSummary.tsx       # End-of-session feedback
/lib
  /claude.ts                # Claude API wrapper
  /speechRecognition.ts     # Web Speech API wrapper
  /textToSpeech.ts          # Browser TTS wrapper
  /conversationAgent.ts     # Agent state + logic
  /errorAnalyzer.ts         # Categorizes Spanish mistakes
/types
  /conversation.ts          # TypeScript types
```

---

## MVP Scope (Week 1)

### In Scope ✅
- [ ] Voice input via Web Speech API (Spanish locale: 'es-MX')
- [ ] Send transcript to Claude, receive Spanish response
- [ ] Claude responds in Spanish, adapts to intermediate level
- [ ] Voice output via browser SpeechSynthesis
- [ ] End-of-turn corrections displayed (not spoken)
- [ ] Session summary when user clicks "End Session"
- [ ] Single mode: casual conversation
- [ ] Responsive design (mobile-friendly for on-the-go practice)

### Out of Scope ❌ (V2+)
- User accounts / authentication
- Progress tracking across sessions
- Multiple conversation modes (scenarios, debates, lessons)
- Pronunciation scoring
- Custom voice (ElevenLabs)
- Spaced repetition for mistakes
- Payment / monetization

---

## Claude API System Prompt

Use this system prompt for the conversation agent:

```
You are a patient Spanish conversation partner for intermediate learners (B1-B2 level).

CONVERSATION RULES:
- Respond ONLY in Spanish unless the user explicitly asks for English
- Use vocabulary and grammar appropriate for intermediate level
- Keep responses conversational (2-4 sentences typically)
- If the user struggles, simplify — don't switch to English
- Be warm and encouraging, never condescending

CORRECTION RULES:
- Let the user finish their thought before noting errors
- After your Spanish response, add a "---" separator
- Then provide corrections in this format:
  📝 Corrections:
  - You said: "[incorrect phrase]"
    Better: "[corrected phrase]"
    Why: [brief explanation in English]
- Only correct 1-3 significant errors per turn (prioritize communication-breaking mistakes)
- If the user made no significant errors, say "✓ ¡Muy bien! No hay correcciones."

ADAPTATION:
- If user gives short, hesitant responses → ask simpler questions, speak slower
- If user is flowing well → introduce more complex vocabulary, ask deeper questions
- Mirror the user's energy — casual if they're casual, focused if they're focused

CONVERSATION STATE:
You will receive the conversation history. Use it to:
- Reference earlier topics naturally
- Notice repeated mistakes
- Build on what the user has shared
```

---

## Voice Configuration

### Speech Recognition (Web Speech API)
```typescript
const recognition = new webkitSpeechRecognition();
recognition.lang = 'es-MX';        // Mexican Spanish
recognition.continuous = false;    // Stop after user pauses
recognition.interimResults = true; // Show partial results
```

### Text-to-Speech (Browser SpeechSynthesis)
```typescript
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = 'es-MX';
utterance.rate = 0.85;  // Slightly slower for learners
// Prefer voices: "Paulina" (macOS), "Google español" (Chrome)
```

---

## Error Categories

Track these mistake types for session summary:

| Category | Examples |
|----------|----------|
| `gender` | "el problema" vs "la problema" |
| `ser_estar` | "estoy alto" vs "soy alto" |
| `verb_conjugation` | "yo teno" vs "yo tengo" |
| `subjunctive` | "quiero que vienes" vs "quiero que vengas" |
| `preposition` | "pienso de" vs "pienso en" |
| `word_order` | "rojo carro" vs "carro rojo" |
| `false_friend` | "embarazada" ≠ "embarrassed" |
| `vocabulary` | Using English word or wrong Spanish word |

---

## Session Summary Format

At end of session, generate:

```
## Session Summary — [date]

**Duration**: 12 minutes
**Exchanges**: 8 turns

### What Went Well ✓
- Good use of past tense
- Natural conversation flow
- Attempted subjunctive (even if imperfect)

### Patterns to Work On
1. **ser vs estar** (3 occurrences)
   - "Estoy cansado" ✓ but "Estoy alto" ✗
   - Focus: ser = permanent traits, estar = states/conditions

2. **Gender agreement** (2 occurrences)
   - Remember: words ending in -ión are feminine

### Suggested Focus for Next Session
Practice describing people (physical traits vs. emotional states) to reinforce ser/estar distinction.
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

## Environment Variables

Create `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
```

**Never commit API keys.** The `.env.local` file is gitignored by default in Next.js.

---

## Coding Conventions

- **TypeScript**: Strict mode, no `any` types
- **Components**: Functional components with hooks only
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Files**: One component per file, named same as component
- **Imports**: Absolute imports using `@/` alias
- **Error handling**: Try-catch with user-friendly error messages
- **Comments**: Explain *why*, not *what* — code should be self-documenting

---

## Testing Strategy (Post-MVP)

- **Manual**: Dogfood daily — use the app yourself
- **Unit**: Test error categorization logic
- **Integration**: Test Claude API response parsing
- **E2E**: Test full voice → response → correction flow

---

## Future Roadmap (V2+)

1. **Week 2-3**: User accounts + session history (Supabase)
2. **Week 4**: Multiple conversation modes (scenarios, topics)
3. **Week 5**: Pronunciation feedback (Whisper API comparison)
4. **Week 6**: Spaced repetition for persistent mistakes
5. **Week 7**: Mobile app (React Native or PWA)
6. **Week 8**: Monetization (free tier + paid unlimited)

---

## Key Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Voice vs Text | Voice-first | Text is a crutch; speaking is the bottleneck |
| Corrections timing | After user finishes | Interrupting kills flow and confidence |
| Starting complexity | Intermediate only | Beginners have Duolingo; advanced have tutors |
| Spanish dialect | Mexican (es-MX) | Largest Spanish-speaking population, neutral accent |
| V1 state management | React only | No auth = no need for backend yet |
