import React, { useState, useEffect, useRef } from 'react';
import type { CombinedWordData, AppSettings } from '../types';
import { audioService } from '../services/audio';
import { Volume2, Lock, Unlock, ChevronRight } from 'lucide-react';

interface PracticeCardProps {
  card: CombinedWordData;
  settings: AppSettings;
  onCardSubmit: (firstTryCorrect: boolean, userTyped: string) => void;
}

function stripAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export const PracticeCard: React.FC<PracticeCardProps> = ({
  card,
  settings,
  onCardSubmit
}) => {
  const [userInput, setUserInput] = useState('');
  const [firstTry, setFirstTry] = useState(true);
  const [isWrongState, setIsWrongState] = useState(false);
  const [isCorrectState, setIsCorrectState] = useState(false);
  const [isAccentWarning, setIsAccentWarning] = useState(false);
  const [isPlayingSentence, setIsPlayingSentence] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const hasAdvancedRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    hasAdvancedRef.current = false;
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    audioService.stop();

    setUserInput('');
    setFirstTry(true);
    setIsWrongState(false);
    setIsCorrectState(false);
    setIsAccentWarning(false);
    setIsPlayingSentence(false);
    setShowHint(false);

    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
      audioService.stop();
    };
  }, [card]);

  const cleanTarget = card.spanish.trim().toLowerCase();
  const cleanInput = userInput.trim().toLowerCase();

  const advanceCard = (wasFirstTry: boolean, typedText: string) => {
    if (hasAdvancedRef.current) return;
    hasAdvancedRef.current = true;
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    audioService.stop();
    onCardSubmit(wasFirstTry, typedText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    // 1. If card is already marked correct/warning and sentence is playing,
    // hitting Enter allows user to advance immediately!
    if (isCorrectState || isAccentWarning) {
      advanceCard(firstTry, userInput || card.spanish);
      return;
    }

    // 2. If user presses Enter without typing anything (default response to not knowing)
    if (!cleanInput) {
      setIsWrongState(true);
      setIsAccentWarning(false);
      setFirstTry(false);

      if (settings.autoPronounce) {
        audioService.speakSpanish(card.spanish, settings.preferredVoice, settings.speechRate);
      }

      if (inputRef.current) {
        inputRef.current.focus();
      }
      return;
    }

    const fullSentence = card.sentenceEs.replace('___', card.spanish);

    if (cleanInput === cleanTarget) {
      // 3. Exact match with correct accents
      setIsCorrectState(true);
      setIsWrongState(false);
      setIsAccentWarning(false);
      setIsPlayingSentence(true);

      if (settings.autoPronounce) {
        // Read out the FULL sentence and wait for speech to finish before advancing
        audioService.speakSpanish(
          fullSentence,
          settings.preferredVoice,
          settings.speechRate,
          1.0,
          () => {
            advanceTimerRef.current = setTimeout(() => {
              advanceCard(firstTry, userInput);
            }, 350);
          }
        );

        // Safety fallback timer if TTS drops the onend event on mobile browsers
        const wordCount = fullSentence.split(/\s+/).length;
        const maxDurationMs = Math.max(3200, wordCount * 650);
        advanceTimerRef.current = setTimeout(() => {
          advanceCard(firstTry, userInput);
        }, maxDurationMs);
      } else {
        advanceTimerRef.current = setTimeout(() => {
          advanceCard(firstTry, userInput);
        }, 600);
      }
    } else if (stripAccents(cleanInput) === stripAccents(cleanTarget)) {
      // 4. Correct word without accents -> treated as correct, flashes orange with correct accent
      setIsAccentWarning(true);
      setIsCorrectState(true);
      setIsWrongState(false);
      setIsPlayingSentence(true);
      setUserInput(card.spanish); // Show correct accent in the blank

      if (settings.autoPronounce) {
        // Read out the FULL sentence and wait for speech to finish before advancing
        audioService.speakSpanish(
          fullSentence,
          settings.preferredVoice,
          settings.speechRate,
          1.0,
          () => {
            advanceTimerRef.current = setTimeout(() => {
              advanceCard(firstTry, card.spanish);
            }, 500);
          }
        );

        const wordCount = fullSentence.split(/\s+/).length;
        const maxDurationMs = Math.max(3500, wordCount * 650);
        advanceTimerRef.current = setTimeout(() => {
          advanceCard(firstTry, card.spanish);
        }, maxDurationMs);
      } else {
        advanceTimerRef.current = setTimeout(() => {
          advanceCard(firstTry, card.spanish);
        }, 1200);
      }
    } else {
      // 5. Completely wrong attempt
      setIsWrongState(true);
      setIsAccentWarning(false);
      setFirstTry(false);

      if (settings.autoPronounce) {
        audioService.speakSpanish(card.spanish, settings.preferredVoice, settings.speechRate);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCorrectState || isAccentWarning) return;
    setUserInput(e.target.value);
    if (isWrongState) {
      setIsWrongState(false);
    }
  };

  const insertAccentChar = (char: string) => {
    if (isCorrectState || isAccentWarning) return;
    setUserInput(prev => prev + char);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const playAudio = () => {
    const textToSpeak = (isCorrectState || !firstTry)
      ? card.sentenceEs.replace('___', card.spanish)
      : card.sentenceEs.replace('___', '...');
    audioService.speakSpanish(textToSpeak, settings.preferredVoice, settings.speechRate);
  };

  const parts = card.sentenceEs.split('___');
  const repetitions = card.progress?.repetitions || 0;
  const masteryLevel = Math.min(5, Math.max(card.progress?.status === 'unseen' ? 0 : 1, repetitions));

  return (
    <div className="practice-card-wrapper">
      <div className="lingvist-card">
        <div className="mastery-pills-row" title={`Mastery Level: ${masteryLevel}/5`}>
          {[1, 2, 3, 4, 5].map(step => (
            <div
              key={step}
              className={`mastery-pill ${step <= masteryLevel ? 'filled' : ''}`}
            />
          ))}
        </div>

        {isAccentWarning ? (
          <div className="accent-warning-banner">
            <span>✨ Correct! Notice accent mark:</span>
            <span className="answer-reveal-word" style={{ color: '#b45309', fontWeight: 800 }}>{card.spanish}</span>
          </div>
        ) : (!firstTry || isWrongState) ? (
          <div className="answer-reveal-banner">
            <span>Type the correct Spanish word to proceed:</span>
            <span className="answer-reveal-word">{card.spanish}</span>
          </div>
        ) : null}

        <div className="sentence-container">
          {parts[0]}
          <span className="blank-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className={`blank-input ${isWrongState ? 'incorrect-try' : ''} ${
                isCorrectState && !isAccentWarning ? 'correct-try' : ''
              } ${isAccentWarning ? 'accent-warning' : ''}`}
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="..."
              readOnly={isCorrectState || isAccentWarning}
              style={{ width: `${Math.max(100, card.spanish.length * 20)}px` }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </span>
          {parts[1] || ''}
        </div>

        <div className="pos-pill-container">
          <div className="pos-pill">
            <span>{card.partOfSpeech}</span>
            <ChevronRight size={14} />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className={`audio-btn ${isPlayingSentence ? 'audio-playing' : ''}`} onClick={playAudio} title="Listen to Spanish sentence">
              <Volume2 size={16} /> {isPlayingSentence ? 'Playing...' : 'Listen'}
            </button>

            {(isCorrectState || isAccentWarning) && (
              <button
                className="advance-early-btn"
                onClick={() => advanceCard(firstTry, userInput || card.spanish)}
                title="Next card (or press Enter)"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="translation-bottom-card">
        <div className="translation-header">
          <div className="english-target-word">{card.english}</div>
          {card.hint && (
            <button
              className="hint-toggle-btn"
              onClick={() => setShowHint(!showHint)}
              title={showHint ? 'Hide hint' : 'Show hint'}
            >
              {showHint ? <Unlock size={20} /> : <Lock size={20} />}
            </button>
          )}
        </div>

        <div className="english-sentence-context">
          {card.sentenceEn.replace(
            new RegExp(card.english, 'gi'),
            match => `<strong>${match}</strong>`
          )}
          {card.sentenceEnLiteral && (
            <span style={{ fontStyle: 'italic', display: 'block', marginTop: '4px' }}>
              ({card.sentenceEnLiteral} <em>literal</em>)
            </span>
          )}
        </div>

        {showHint && card.hint && (
          <div className="hint-box">
            💡 <strong>Hint:</strong> {card.hint}
          </div>
        )}
      </div>

      {settings.accentToolbar && (
        <div className="accent-toolbar">
          {['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü'].map(char => (
            <button
              key={char}
              className="accent-btn"
              onClick={() => insertAccentChar(char)}
            >
              {char}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
