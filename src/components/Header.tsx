import React from 'react';
import { Home, Settings, BookOpen, BarChart2, User, RefreshCw } from 'lucide-react';
import type { SyncStatus } from '../services/sync';

interface HeaderProps {
  currentTab: 'practice' | 'words' | 'analytics';
  setCurrentTab: (tab: 'practice' | 'words' | 'analytics') => void;
  sessionCurrentCount: number;
  sessionTotalGoal: number;
  openSettings: () => void;
  openProfile: () => void;
  syncStatus: SyncStatus;
  profileName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  sessionCurrentCount,
  sessionTotalGoal,
  openSettings,
  openProfile,
  syncStatus,
  profileName
}) => {
  const progressPercent = Math.min(
    100,
    Math.round((sessionCurrentCount / Math.max(1, sessionTotalGoal)) * 100)
  );

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          className={`header-btn ${currentTab === 'practice' ? 'active' : ''}`}
          onClick={() => setCurrentTab('practice')}
          title="Practice / Game"
        >
          <Home size={22} />
        </button>

        <button
          className={`header-btn ${currentTab === 'words' ? 'active' : ''}`}
          onClick={() => setCurrentTab('words')}
          title="Words Database"
        >
          <BookOpen size={20} />
        </button>

        <button
          className={`header-btn ${currentTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setCurrentTab('analytics')}
          title="Progress Stats"
        >
          <BarChart2 size={20} />
        </button>
      </div>

      {currentTab === 'practice' ? (
        <div className="session-progress-bar-container">
          <span className="progress-text">
            {sessionCurrentCount}/{sessionTotalGoal}
          </span>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : (
        <div style={{ flex: 1 }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          className="header-btn"
          onClick={openProfile}
          title={`Profile: ${profileName} (${syncStatus})`}
          style={{ position: 'relative' }}
        >
          {syncStatus === 'syncing' ? (
            <RefreshCw size={18} className="spin-animation" style={{ color: 'var(--accent-teal)' }} />
          ) : (
            <User size={20} />
          )}
          {syncStatus === 'synced' && (
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-green)',
                border: '1.5px solid var(--bg-card)'
              }}
            />
          )}
        </button>

        <button className="header-btn" onClick={openSettings} title="Settings">
          <Settings size={22} />
        </button>
      </div>
    </header>
  );
};
