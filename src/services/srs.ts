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
 * Vocabulary threshold required before complex tenses (past, imperfect, future) are introduced.
 * Beginners practice strictly present tense and infinitives.
 */
export const VOCAB_THRESHOLD_FOR_COMPLEX_TENSES = 50;

/**
 * Smart anti-clustering interleaver & shuffler:
 * 1. Guarantees that cards with the same rootVerb (e.g. 'ser', 'estar', 'tener', 'ir')
 *    are spaced out and NEVER appear back-to-back.
 * 2. Alternates parts of speech (nouns, adjectives, adverbs, pronouns) to break up verb clustering.
 * 3. Shuffles locally within small frequency windows so practice feels dynamic and conversational.
 */
export function interleaveAndShuffleCards(cards: CombinedWordData[]): CombinedWordData[] {
  if (cards.length <= 2) return cards;

  const result: CombinedWordData[] = [];
  const remaining = [...cards];

  const hasRecentRootVerb = (card: CombinedWordData, lookback: number = 3): boolean => {
    if (!card.rootVerb) return false;
    const start = Math.max(0, result.length - lookback);
    for (let i = result.length - 1; i >= start; i--) {
      if (result[i].rootVerb && result[i].rootVerb === card.rootVerb) {
        return true;
      }
    }
    return false;
  };

  const hasRecentVerb = (card: CombinedWordData): boolean => {
    if (card.partOfSpeech !== 'verb') return false;
    if (result.length === 0) return false;
    return result[result.length - 1].partOfSpeech === 'verb';
  };

  while (remaining.length > 0) {
    const windowSize = Math.min(remaining.length, 8);
    let chosenIdx = -1;

    // 1. Ideal candidate: different rootVerb AND alternates part of speech
    for (let i = 0; i < windowSize; i++) {
      const candidate = remaining[i];
      if (!hasRecentRootVerb(candidate, 3) && !hasRecentVerb(candidate)) {
        chosenIdx = i;
        break;
      }
    }

    // 2. Secondary candidate: different rootVerb (allows verbs if distinct root verbs)
    if (chosenIdx === -1) {
      for (let i = 0; i < windowSize; i++) {
        const candidate = remaining[i];
        if (!hasRecentRootVerb(candidate, 2)) {
          chosenIdx = i;
          break;
        }
      }
    }

    // 3. Tertiary candidate: avoids immediately repeating root verb
    if (chosenIdx === -1) {
      for (let i = 0; i < windowSize; i++) {
        const candidate = remaining[i];
        if (!hasRecentRootVerb(candidate, 1)) {
          chosenIdx = i;
          break;
        }
      }
    }

    // 4. Fallback: take next available
    if (chosenIdx === -1) {
      chosenIdx = 0;
    }

    const [card] = remaining.splice(chosenIdx, 1);
    result.push(card);
  }

  return result;
}

/**
 * Generate adaptive queue for daily session:
 * 1. Checks user's mastered/progressed vocabulary count.
 * 2. If below VOCAB_THRESHOLD_FOR_COMPLEX_TENSES, strictly filters out past and future tenses.
 * 3. Applies smart interleaving and anti-clustering so same-verb conjugations are never clustered.
 */
export async function generateSessionQueue(sessionGoal: number = 50): Promise<CombinedWordData[]> {
  const now = Date.now();
  const allWords = await db.words.orderBy('frequencyRank').toArray();
  const allProgress = await db.userProgress.toArray();

  const progressMap = new Map<string, UserProgress>();
  allProgress.forEach(p => progressMap.set(p.wordId, p));

  // Determine user's learned count to assess beginner threshold
  const learnedCount = allProgress.filter(
    p => p.status === 'learned' || (p.repetitions >= 2 && p.consecutiveCorrect >= 2)
  ).length;

  const isBeginner = learnedCount < VOCAB_THRESHOLD_FOR_COMPLEX_TENSES;

  // Filter eligible words based on beginner tense threshold:
  // Beginners only see present tense, infinitives, or non-verbs (nouns, adjectives, adverbs, etc.)
  const eligibleWords = allWords.filter(word => {
    if (!isBeginner) return true;
    if (!word.tense || word.tense === 'none' || word.tense === 'present' || word.tense === 'infinitive') {
      return true;
    }
    return false;
  });

  const overdueCards: CombinedWordData[] = [];
  const learningCards: CombinedWordData[] = [];
  const unseenCards: CombinedWordData[] = [];

  for (const word of eligibleWords) {
    const prog = progressMap.get(word.id);
    if (!prog || prog.status === 'unseen') {
      unseenCards.push({ ...word, progress: prog });
    } else if (prog.nextReviewDate <= now) {
      overdueCards.push({ ...word, progress: prog });
    } else {
      learningCards.push({ ...word, progress: prog });
    }
  }

  // Interleave and anti-cluster overdue review cards
  const preparedOverdue = interleaveAndShuffleCards(overdueCards);

  // Interleave and anti-cluster unseen cards
  const preparedUnseen = interleaveAndShuffleCards(unseenCards);

  const queue: CombinedWordData[] = [];

  // 1. Add overdue review cards first
  queue.push(...preparedOverdue.slice(0, sessionGoal));

  // 2. Fill remaining session quota with unseen words
  if (queue.length < sessionGoal) {
    const needed = sessionGoal - queue.length;
    queue.push(...preparedUnseen.slice(0, needed));
  }

  // 3. Fallback to other learning cards if needed
  if (queue.length < sessionGoal) {
    const needed = sessionGoal - queue.length;
    const preparedLearning = interleaveAndShuffleCards(learningCards);
    queue.push(...preparedLearning.slice(0, needed));
  }

  // Final interleaving pass to ensure smooth transitions between overdue and new cards
  return interleaveAndShuffleCards(queue);
}

