import { useState, useEffect } from 'react';
import type { CombinedWordData, AppSettings } from './types';
import { initializeDatabase, getSettings } from './services/db';
import { generateSessionQueue, recordCardAttempt } from './services/srs';
import { syncService, type SyncStatus } from './services/sync';
import { Header } from './components/Header';
import { PracticeCard } from './components/PracticeCard';
import { SessionComplete } from './components/SessionComplete';
import { WordsTab } from './components/WordsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { WordDetailModal } from './components/WordDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfileSyncModal } from './components/ProfileSyncModal';
import './index.css';

export function App() {
  const [currentTab, setCurrentTab] = useState<'practice' | 'words' | 'analytics'>('practice');
  const [settings, setSettings] = useState<AppSettings>({
    dailyGoal: 50,
    autoPronounce: true,
    soundEffects: true,
    theme: 'light',
    accentToolbar: true
  });

  const [queue, setQueue] = useState<CombinedWordData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsCompletedSession, setCardsCompletedSession] = useState(0);
  const [correctFirstTrySession, setCorrectFirstTrySession] = useState(0);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedWord, setSelectedWord] = useState<CombinedWordData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [profile, setProfile] = useState(syncService.getActiveProfile());

  useEffect(() => {
    initApp();
    const unsub = syncService.subscribeStatus(setSyncStatus);
    return () => unsub();
  }, []);

  const initApp = async () => {
    setLoading(true);
    await initializeDatabase();
    
    // Attempt background sync with server
    await syncService.syncBidirectional();
    setProfile(syncService.getActiveProfile());

    const appSettings = await getSettings();
    setSettings(appSettings);

    await loadNewSession(appSettings.dailyGoal);
    setLoading(false);
  };

  const loadNewSession = async (goal: number) => {
    const newQueue = await generateSessionQueue(goal);
    setQueue(newQueue);
    setCurrentIndex(0);
    setCardsCompletedSession(0);
    setCorrectFirstTrySession(0);
    setIsSessionFinished(false);
  };

  const handleCardSubmit = async (firstTryCorrect: boolean) => {
    if (currentIndex >= queue.length) return;

    const currentCard = queue[currentIndex];
    await recordCardAttempt(currentCard.id, firstTryCorrect);

    // Trigger debounced cross-device push to server
    syncService.triggerDebouncedPush();

    setCardsCompletedSession(prev => prev + 1);
    if (firstTryCorrect) {
      setCorrectFirstTrySession(prev => prev + 1);
    }

    const nextIdx = currentIndex + 1;
    if (nextIdx >= queue.length) {
      setIsSessionFinished(true);
    } else {
      setCurrentIndex(nextIdx);
    }
  };

  const currentCard = queue[currentIndex];

  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🇪🇸</div>
          <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Initializing Lingvist Spanish...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        sessionCurrentCount={cardsCompletedSession}
        sessionTotalGoal={settings.dailyGoal}
        openSettings={() => setIsSettingsOpen(true)}
        openProfile={() => setIsProfileModalOpen(true)}
        syncStatus={syncStatus}
        profileName={profile.name}
      />

      {currentTab === 'practice' && (
        <main style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {isSessionFinished ? (
            <SessionComplete
              cardsCompleted={cardsCompletedSession}
              correctFirstTryCount={correctFirstTrySession}
              onStartNewSession={() => loadNewSession(settings.dailyGoal)}
            />
          ) : currentCard ? (
            <PracticeCard
              key={currentCard.id + '-' + currentIndex}
              card={currentCard}
              settings={settings}
              onCardSubmit={handleCardSubmit}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No cards remaining in queue right now!</h3>
            </div>
          )}
        </main>
      )}

      {currentTab === 'words' && (
        <WordsTab onSelectWordDetail={word => setSelectedWord(word)} />
      )}

      {currentTab === 'analytics' && <AnalyticsTab />}

      {/* Word Detail Modal */}
      {selectedWord && (
        <WordDetailModal
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onSettingsUpdated={newSet => {
            setSettings(newSet);
            loadNewSession(newSet.dailyGoal);
          }}
        />
      )}

      {/* User Profile & Cross-Device Sync Modal */}
      {isProfileModalOpen && (
        <ProfileSyncModal
          onClose={() => setIsProfileModalOpen(false)}
          onProfileChanged={() => {
            setProfile(syncService.getActiveProfile());
            initApp();
          }}
        />
      )}
    </div>
  );
}

export default App;
