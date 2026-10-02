export type WordStatus = 'unseen' | 'learning' | 'learned';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type PartOfSpeech = 
  | 'verb' 
  | 'noun' 
  | 'adjective' 
  | 'adverb' 
  | 'preposition' 
  | 'pronoun' 
  | 'conjunction' 
  | 'expression';

export interface SpanishWord {
  id: string;
  spanish: string; // Target Spanish word (e.g. "aquí")
  english: string; // Target English translation (e.g. "here")
  partOfSpeech: PartOfSpeech;
  cefr: CEFRLevel;
  sentenceEs: string; // Spanish sentence with blank placeholder (e.g. "Este objeto está ___.")
  sentenceEn: string; // English sentence translation (e.g. "The object is here.")
  sentenceEnLiteral?: string; // Literal English translation if helpful
  hint?: string; // Context clue or grammar note
  frequencyRank: number; // 1 to 6000
}

export interface UserProgress {
  wordId: string;
  status: WordStatus;
  repetitions: number; // Consecutive correct reviews
  easeFactor: number; // SRS ease factor (default 2.5)
  intervalDays: number; // Next review interval in days
  nextReviewDate: number; // Timestamp (ms)
  lastReviewedDate?: number; // Timestamp (ms)
  totalAttempts: number;
  correctFirstTry: number;
  consecutiveCorrect: number;
}

export interface SessionCardResult {
  wordId: string;
  firstTryCorrect: boolean;
  userTyped: string;
  timestamp: number;
}

export interface CardSession {
  id?: number;
  date: string; // YYYY-MM-DD
  cardsCompleted: number;
  correctFirstTryCount: number;
  durationSeconds: number;
  timestamp: number;
}

export interface AppSettings {
  dailyGoal: number; // Default 50
  autoPronounce: boolean; // Auto play Spanish speech on answer submit
  soundEffects: boolean; // Subtle sound feedback
  theme: 'light' | 'dark' | 'system';
  accentToolbar: boolean; // Show Spanish accent helper buttons (á, é, í, ó, ú, ñ)
  preferredVoice?: string; // Selected TTS voice URI / name
  speechRate?: number; // Pitch/Rate (default 0.9)
}

export interface CombinedWordData extends SpanishWord {
  progress?: UserProgress;
}
