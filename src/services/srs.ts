import { db } from './db';
import type { CombinedWordData, UserProgress, WordStatus } from '../types';

export const INITIAL_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;

const REPETITION_INTERVALS = [0.25, 1, 3, 7, 16, 35, 90];

export function calculateNextSRSState(
  currentProgress: UserProgress | undefined,
  firstTryCorrect: boolean
): Omit<UserProgress, 'wordId'> {
  const now = Date.now();
  const attempts = (currentProgress?.totalAttempts || 0) + 1;
  const correctFirst = (currentProgress?.correctFirstTry || 0) + (firstTryCorrect ? 1 : 0);

  if (firstTryCorrect) {
    const consecutive = (currentProgress?.consecutiveCorrect || 0) + 1;
    const reps = (currentProgress?.repetitions || 0) + 1;
    
    let easeFactor = (currentProgress?.easeFactor || INITIAL_EASE_FACTOR) + 0.1;
    if (easeFactor < MIN_EASE_FACTOR) easeFactor = MIN_EASE_FACTOR;

    let intervalDays: number;
    if (reps - 1 < REPETITION_INTERVALS.length) {
      intervalDays = REPETITION_INTERVALS[reps - 1];
    } else {
      const prevInterval = currentProgress?.intervalDays || 35;
      intervalDays = Math.round(prevInterval * easeFactor);
    }

    let status: WordStatus = 'learning';
    if (reps >= 4 && consecutive >= 3) {
      status = 'learned';
    }

    const nextReviewDate = now + intervalDays * 24 * 60 * 60 * 1000;

    return {
      status,
      repetitions: reps,
      easeFactor,
      intervalDays,
      nextReviewDate,
      lastReviewedDate: now,
      totalAttempts: attempts,
      correctFirstTry: correctFirst,
      consecutiveCorrect: consecutive
    };
  } else {
    let easeFactor = (currentProgress?.easeFactor || INITIAL_EASE_FACTOR) - 0.16;
    if (easeFactor < MIN_EASE_FACTOR) easeFactor = MIN_EASE_FACTOR;

    const intervalDays = 0.007; // ~10 mins
    const nextReviewDate = now + intervalDays * 24 * 60 * 60 * 1000;

    return {
      status: 'learning',
      repetitions: 0,
      easeFactor,
      intervalDays,
      nextReviewDate,
      lastReviewedDate: now,
      totalAttempts: attempts,
      correctFirstTry: correctFirst,
      consecutiveCorrect: 0
    };
  }
}

export async function recordCardAttempt(
  wordId: string,
  firstTryCorrect: boolean
): Promise<UserProgress> {
  const existingProg = await db.userProgress.get(wordId);
  const updatedState = calculateNextSRSState(existingProg, firstTryCorrect);

  const finalProgress: UserProgress = {
    wordId,
    ...updatedState
  };

  await db.userProgress.put(finalProgress);
  return finalProgress;
}

/**
 * Generate adaptive queue for daily session:
 * 1. Overdue cards (due for review)
 * 2. Unseen cards STRICTLY ordered by frequencyRank (most important Spanish words first!)
 */
export async function generateSessionQueue(sessionGoal: number = 50): Promise<CombinedWordData[]> {
  const now = Date.now();
  // Fetch words ordered strictly by frequency rank (1, 2, 3...)
  const allWords = await db.words.orderBy('frequencyRank').toArray();
  const allProgress = await db.userProgress.toArray();

  const progressMap = new Map<string, UserProgress>();
  allProgress.forEach(p => progressMap.set(p.wordId, p));

  const overdueCards: CombinedWordData[] = [];
  const learningCards: CombinedWordData[] = [];
  const unseenCards: CombinedWordData[] = [];

  for (const word of allWords) {
    const prog = progressMap.get(word.id);
    if (!prog || prog.status === 'unseen') {
      unseenCards.push({ ...word, progress: prog });
    } else if (prog.nextReviewDate <= now) {
      overdueCards.push({ ...word, progress: prog });
    } else {
      learningCards.push({ ...word, progress: prog });
    }
  }

  // Overdue review cards shuffled slightly
  overdueCards.sort(() => Math.random() - 0.5);

  // Unseen cards MUST be strictly ordered by frequencyRank ascending (1, 2, 3...)
  unseenCards.sort((a, b) => a.frequencyRank - b.frequencyRank);

  const queue: CombinedWordData[] = [];

  // 1. Add overdue review cards first
  queue.push(...overdueCards.slice(0, sessionGoal));

  // 2. Fill remaining session quota with top frequency unseen words
  if (queue.length < sessionGoal) {
    const needed = sessionGoal - queue.length;
    queue.push(...unseenCards.slice(0, needed));
  }

  // 3. Fallback to other learning cards if needed
  if (queue.length < sessionGoal) {
    const needed = sessionGoal - queue.length;
    queue.push(...learningCards.slice(0, needed));
  }

  return queue;
}
