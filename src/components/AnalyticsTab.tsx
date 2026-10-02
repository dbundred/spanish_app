import { useState, useEffect } from 'react';
import { getDeckStats, type DeckStats } from '../services/db';
import { Brain } from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const [stats, setStats] = useState<DeckStats | null>(null);

  useEffect(() => {
    getDeckStats().then(setStats);
  }, []);

  const total = stats?.totalWords || 1;
  const learnedPercent = Math.round(((stats?.learnedCount || 0) / total) * 100);
  const learningPercent = Math.round(((stats?.learningCount || 0) / total) * 100);
  const unseenPercent = Math.round(((stats?.unseenCount || 0) / total) * 100);

  return (
    <div className="words-tab-container">
      <div className="lingvist-card">
        <h2 style={{ fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Brain style={{ color: 'var(--accent-teal)' }} /> Spanish Memory Progress
        </h2>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 700 }}>
            <span>Target Mastery (Goal: ~6,000 words)</span>
            <span>{stats?.learnedCount || 0} / 6,000 learned</span>
          </div>

          <div className="progress-track" style={{ height: '14px' }}>
            <div
              className="progress-fill"
              style={{
                width: `${Math.max(2, (stats?.learnedCount || 0) / 60)}%`,
                background: 'var(--accent-green)'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', height: '12px', borderRadius: '6px', overflow: 'hidden', margin: '16px 0' }}>
          <div style={{ width: `${learnedPercent}%`, backgroundColor: 'var(--accent-green)' }} title="Learned" />
          <div style={{ width: `${learningPercent}%`, backgroundColor: 'var(--accent-blue)' }} title="Learning" />
          <div style={{ width: `${unseenPercent}%`, backgroundColor: 'var(--bg-input)' }} title="Unseen" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '13px', fontWeight: 600 }}>
          <span style={{ color: 'var(--accent-green)' }}>● Learned ({learnedPercent}%)</span>
          <span style={{ color: 'var(--accent-blue)' }}>● Learning ({learningPercent}%)</span>
          <span style={{ color: 'var(--text-muted)' }}>● Unseen ({unseenPercent}%)</span>
        </div>
      </div>

      <div className="lingvist-card">
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
          CEFR Level Mastery Breakdown
        </h3>

        {stats &&
          Object.entries(stats.cefrBreakdown).map(([level, data]) => {
            const levelPct = data.total > 0 ? Math.round((data.learned / data.total) * 100) : 0;
            return (
              <div key={level} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
                  <span>{level} Level ({data.learned}/{data.total} words)</span>
                  <span>{levelPct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${levelPct}%` }} />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
