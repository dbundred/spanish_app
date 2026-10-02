import React from 'react';
import type { CombinedWordData } from '../types';
import { audioService } from '../services/audio';
import { X, Volume2 } from 'lucide-react';

interface WordDetailModalProps {
  word: CombinedWordData | null;
  onClose: () => void;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({ word, onClose }) => {
  if (!word) return null;

  const status = word.progress?.status || 'unseen';
  const attempts = word.progress?.totalAttempts || 0;
  const correctFirst = word.progress?.correctFirstTry || 0;
  const accuracy = attempts > 0 ? Math.round((correctFirst / attempts) * 100) : 0;
  const repetitions = word.progress?.repetitions || 0;
  const nextReview = word.progress?.nextReviewDate
    ? new Date(word.progress.nextReviewDate).toLocaleDateString()
    : 'Not scheduled';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        className="lingvist-card"
        style={{ maxWidth: '480px', width: '100%', position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="header-btn"
          style={{ position: 'absolute', top: '16px', right: '16px' }}
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800 }}>{word.spanish}</h2>
          <button
            className="audio-btn"
            onClick={() => audioService.speakSpanish(word.spanish)}
          >
            <Volume2 size={18} />
          </button>
        </div>

        <div style={{ fontSize: '18px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {word.english} ({word.partOfSpeech}) • {word.cefr}
        </div>

        <div
          style={{
            background: 'var(--bg-card-subtle)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            fontStyle: 'italic',
            fontSize: '16px'
          }}
        >
          "{word.sentenceEs}"
          <div style={{ fontStyle: 'normal', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            "{word.sentenceEn}"
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="stat-card">
            <span className="stat-label">Status</span>
            <span className={`status-badge ${status}`} style={{ width: 'fit-content', marginTop: '4px' }}>
              {status}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">1st-Try Accuracy</span>
            <span className="stat-value">{accuracy}%</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Consecutive Correct</span>
            <span className="stat-value">{repetitions}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Next SRS Review</span>
            <span style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>{nextReview}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
