import React, { useState, useEffect } from 'react';
import { db, getDeckStats, type DeckStats } from '../services/db';
import type { CombinedWordData, UserProgress } from '../types';
import { audioService } from '../services/audio';
import { Search, Volume2, Sparkles, Target, ShieldCheck } from 'lucide-react';

interface WordsTabProps {
  onSelectWordDetail: (word: CombinedWordData) => void;
}

export const WordsTab: React.FC<WordsTabProps> = ({ onSelectWordDetail }) => {
  const [wordsList, setWordsList] = useState<CombinedWordData[]>([]);
  const [stats, setStats] = useState<DeckStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('unseen');
  const [cefrFilter, setCefrFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'frequency' | 'alphabetical'>('frequency');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const deckStats = await getDeckStats();
    setStats(deckStats);

    const allWords = await db.words.orderBy('frequencyRank').toArray();
    const allProgress = await db.userProgress.toArray();

    const progMap = new Map<string, UserProgress>();
    allProgress.forEach(p => progMap.set(p.wordId, p));

    const combined: CombinedWordData[] = allWords.map(w => ({
      ...w,
      progress: progMap.get(w.id)
    }));

    setWordsList(combined);
    setLoading(false);
  };

  const filteredWords = wordsList
    .filter(item => {
      const status = item.progress?.status || 'unseen';

      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (cefrFilter !== 'all' && item.cefr !== cefrFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchEs = item.spanish.toLowerCase().includes(q);
        const matchEn = item.english.toLowerCase().includes(q);
        if (!matchEs && !matchEn) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'frequency') {
        return a.frequencyRank - b.frequencyRank;
      } else {
        return a.spanish.localeCompare(b.spanish);
      }
    });

  return (
    <div className="words-tab-container">
      {/* 6,000 Words Benchmark Overview Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(2, 132, 199, 0.1))',
          border: '1px solid var(--accent-teal)',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '17px', color: 'var(--accent-teal-dark)' }}>
            <Target size={22} />
            <span>Target Fluency Benchmark: 6,000 Words</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> Progress Auto-Saved
          </span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          Linguists estimate that mastering the <strong>top ~6,000 words</strong> provides 98% comprehension of spoken and written Spanish. Lingvist introduces vocabulary in strict real-world frequency order (starting with core pronouns and high-frequency conjugated verbs).
        </p>
      </div>

      {/* Top Deck Stats Counter Cards */}
      <div className="stats-summary-grid">
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--text-primary)' }}>6,000</span>
          <span className="stat-label">Fluency Goal</span>
        </div>
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderColor: statusFilter === 'all' ? 'var(--accent-teal)' : undefined }}
          onClick={() => setStatusFilter('all')}
        >
          <span className="stat-value" style={{ color: 'var(--text-secondary)' }}>
            {stats?.totalWords || 0}
          </span>
          <span className="stat-label">In Curriculum</span>
        </div>
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderColor: statusFilter === 'learning' ? 'var(--accent-blue)' : undefined }}
          onClick={() => setStatusFilter('learning')}
        >
          <span className="stat-value" style={{ color: 'var(--accent-blue)' }}>
            {stats?.learningCount || 0}
          </span>
          <span className="stat-label">Learning</span>
        </div>
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderColor: statusFilter === 'learned' ? 'var(--accent-green)' : undefined }}
          onClick={() => setStatusFilter('learned')}
        >
          <span className="stat-value" style={{ color: 'var(--accent-green)' }}>
            {stats?.learnedCount || 0}
          </span>
          <span className="stat-label">Learned</span>
        </div>
      </div>

      {/* Unseen Importance Banner */}
      {statusFilter === 'unseen' && (
        <div
          style={{
            background: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <Sparkles style={{ color: 'var(--accent-teal)', flexShrink: 0 }} size={18} />
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Showing remaining <strong>Unseen Words</strong> sorted by Spanish frequency rank (#1 most essential first).
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search Spanish or English..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="unseen">⭐ Unseen (Most Important First)</option>
          <option value="all">All Words in Curriculum</option>
          <option value="learning">Learning Deck</option>
          <option value="learned">Learned Deck</option>
        </select>

        <select
          className="filter-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'frequency' | 'alphabetical')}
        >
          <option value="frequency">Sort by Frequency Rank (#1, #2...)</option>
          <option value="alphabetical">Sort Alphabetically (A-Z)</option>
        </select>

        <select
          className="filter-select"
          value={cefrFilter}
          onChange={e => setCefrFilter(e.target.value)}
        >
          <option value="all">All Levels</option>
          <option value="A1">A1 Beginner</option>
          <option value="A2">A2 Elementary</option>
          <option value="B1">B1 Intermediate</option>
          <option value="B2">B2 Upper Int</option>
          <option value="C1">C1 Advanced</option>
        </select>
      </div>

      {/* Word List Table */}
      <div className="word-list-container">
        <div className="word-row word-row-header" style={{ gridTemplateColumns: '70px 1.5fr 1.5fr 80px 100px 40px' }}>
          <span>Rank</span>
          <span>Spanish</span>
          <span>English</span>
          <span>Level</span>
          <span>Status</span>
          <span>Audio</span>
        </div>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading dictionary database...
          </div>
        ) : filteredWords.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No matching words found.
          </div>
        ) : (
          filteredWords.slice(0, 100).map(item => {
            const status = item.progress?.status || 'unseen';
            return (
              <div
                key={item.id}
                className="word-row"
                style={{ gridTemplateColumns: '70px 1.5fr 1.5fr 80px 100px 40px', cursor: 'pointer' }}
                onClick={() => onSelectWordDetail(item)}
              >
                <span style={{ fontWeight: 800, color: 'var(--accent-teal)', fontSize: '13px' }}>
                  #{item.frequencyRank}
                </span>
                <span className="spanish-term">{item.spanish}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{item.english}</span>
                <span style={{ fontWeight: 600, fontSize: '12px' }}>{item.cefr}</span>
                <div>
                  <span className={`status-badge ${status}`}>{status}</span>
                </div>
                <button
                  className="header-btn"
                  style={{ width: '32px', height: '32px' }}
                  onClick={e => {
                    e.stopPropagation();
                    audioService.speakSpanish(item.spanish);
                  }}
                  title="Pronounce"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
