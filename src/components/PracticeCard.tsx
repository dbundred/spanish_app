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
  const [showHint, setShowHint] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserInput('');
    setFirstTry(true);
    setIsWrongState(false);
    setIsCorrectState(false);
    setIsAccentWarning(false);
    setShowHint(false);

    if (inputRef.current) {
      inputRef.current.focus();
    }

    if (settings.autoPronounce) {
      audioService.speakSpanish(card.sentenceEs, settings.preferredVoice, settings.speechRate);
    }
  }, [card, settings.autoPronounce, settings.preferredVoice, settings.speechRate]);

  const cleanTarget = card.spanish.trim().toLowerCase();
  const cleanInput = userInput.trim().toLowerCase();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!cleanInput) return;

    if (cleanInput === cleanTarget) {
      // 1. Exact match with correct accents
      setIsCorrectState(true);
      setIsWrongState(false);
      setIsAccentWarning(false);

      if (settings.autoPronounce) {
        audioService.speakSpanish(card.spanish, settings.preferredVoice, settings.speechRate);
      }

      setTimeout(() => {
        onCardSubmit(firstTry, userInput);
      }, 400);
    } else if (stripAccents(cleanInput) === stripAccents(cleanTarget)) {
      // 2. Correct word without accents -> treated as correct, flashes orange with correct accent
      setIsAccentWarning(true);
      setIsCorrectState(false);
      setIsWrongState(false);

      if (settings.autoPronounce) {
        audioService.speakSpanish(card.spanish, settings.preferredVoice, settings.speechRate);
      }

      setTimeout(() => {
        onCardSubmit(firstTry, userInput);
      }, 1300);
    } else {
      // 3. Completely wrong attempt
      setIsWrongState(true);
      setIsAccentWarning(false);
      setFirstTry(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    if (isWrongState) {
      setIsWrongState(false);
    }
  };

  const insertAccentChar = (char: string) => {
    setUserInput(prev => prev + char);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const playAudio = () => {
    audioService.speakSpanish(card.sentenceEs, settings.preferredVoice, settings.speechRate);
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
            <span>✨ Correct! Check the accent mark:</span>
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
                isCorrectState ? 'correct-try' : ''
              } ${isAccentWarning ? 'accent-warning' : ''}`}
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="..."
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

          <button className="audio-btn" onClick={playAudio} title="Listen to Spanish sentence">
            <Volume2 size={16} /> Listen
          </button>
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
