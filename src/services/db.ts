import Dexie, { type Table } from 'dexie';
import type { SpanishWord, UserProgress, CardSession, AppSettings } from '../types';
import { generateExpandedVocabulary } from '../data/spanishVocabulary';

export class SpanishAppDatabase extends Dexie {
  words!: Table<SpanishWord, string>;
  userProgress!: Table<UserProgress, string>;
  sessions!: Table<CardSession, number>;
  settings!: Table<AppSettings & { id: string }, string>;

  constructor() {
    super('LingvistSpanishDB');
    this.version(1).stores({
      words: 'id, spanish, cefr, partOfSpeech, frequencyRank',
      userProgress: 'wordId, status, nextReviewDate, lastReviewedDate',
      sessions: '++id, date, timestamp',
      settings: 'id'
    });
  }
}

export const db = new SpanishAppDatabase();

export async function initializeDatabase(): Promise<void> {
  const initialDeck = generateExpandedVocabulary();
  // Refresh words table so user gets the curated pronouns, conjugated verbs, and basic phrases
  await db.words.clear();
  await db.words.bulkPut(initialDeck);
  
  const existingSettings = await db.settings.get('main');
  if (!existingSettings) {
    await db.settings.put({
      id: 'main',
      dailyGoal: 50,
      autoPronounce: true,
      soundEffects: true,
      theme: 'light',
      accentToolbar: true
    });
  }
}

export interface DeckStats {
  totalWords: number;
  unseenCount: number;
  learningCount: number;
  learnedCount: number;
  cefrBreakdown: Record<string, { total: number; learned: number }>;
}

export async function getDeckStats(): Promise<DeckStats> {
  const allWords = await db.words.toArray();
  const allProgress = await db.userProgress.toArray();

  const progressMap = new Map<string, UserProgress>();
  allProgress.forEach(p => progressMap.set(p.wordId, p));

  let unseenCount = 0;
  let learningCount = 0;
  let learnedCount = 0;

  const cefrBreakdown: Record<string, { total: number; learned: number }> = {
    A1: { total: 0, learned: 0 },
    A2: { total: 0, learned: 0 },
    B1: { total: 0, learned: 0 },
    B2: { total: 0, learned: 0 },
    C1: { total: 0, learned: 0 }
  };

  allWords.forEach(word => {
    const prog = progressMap.get(word.id);
    const status = prog ? prog.status : 'unseen';

    if (status === 'unseen') unseenCount++;
    else if (status === 'learning') learningCount++;
    else if (status === 'learned') learnedCount++;

    if (!cefrBreakdown[word.cefr]) {
      cefrBreakdown[word.cefr] = { total: 0, learned: 0 };
    }
    cefrBreakdown[word.cefr].total++;
    if (status === 'learned') {
      cefrBreakdown[word.cefr].learned++;
    }
  });

  return {
    totalWords: allWords.length,
    unseenCount,
    learningCount,
    learnedCount,
    cefrBreakdown
  };
}

export async function getSettings(): Promise<AppSettings> {
  const settingsObj = await db.settings.get('main');
  if (settingsObj) {
    return settingsObj;
  }
  return {
    dailyGoal: 50,
    autoPronounce: true,
    soundEffects: true,
    theme: 'light',
    accentToolbar: true
  };
}

export async function updateSettings(newSettings: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  await db.settings.put({
    ...current,
    ...newSettings,
    id: 'main'
  });
}
