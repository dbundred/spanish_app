import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, RefreshCw } from 'lucide-react';

interface SessionCompleteProps {
  cardsCompleted: number;
  correctFirstTryCount: number;
  onStartNewSession: () => void;
}

export const SessionComplete: React.FC<SessionCompleteProps> = ({
  cardsCompleted,
  correctFirstTryCount,
  onStartNewSession
}) => {
  const accuracy = Math.round((correctFirstTryCount / Math.max(1, cardsCompleted)) * 100);

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="session-complete-card">
      <div className="complete-icon-badge">
        <Award size={40} />
      </div>

      <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Session Completed! 🎉</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '360px' }}>
        Great work! You've strengthened your Spanish memory retention and moved closer to fluency.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', margin: '12px 0' }}>
        <div style={{ background: 'var(--bg-card-subtle)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-teal)' }}>
            {cardsCompleted}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Cards Reviewed</div>
        </div>

        <div style={{ background: 'var(--bg-card-subtle)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-green)' }}>
            {accuracy}%
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>1st-Try Accuracy</div>
        </div>
      </div>

      <button className="primary-btn" onClick={onStartNewSession}>
        <RefreshCw size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
        Start Next Session
      </button>
    </div>
  );
};
