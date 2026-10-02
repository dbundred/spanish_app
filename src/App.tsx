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

const getTodayKey = () => `lingvist_session_${new Date().toISOString().slice(0, 10)}`;

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
    
    // Attempt background sync
    await syncService.syncBidirectional();
    setProfile(syncService.getActiveProfile());

    const appSettings = await getSettings();
    setSettings(appSettings);

    await loadNewSession(appSettings.dailyGoal, false);
    setLoading(false);
  };

  const loadNewSession = async (goal: number, forceReset: boolean = false) => {
    const newQueue = await generateSessionQueue(goal);
    setQueue(newQueue);

    // Check if session progress already exists for today so counter never resets on tab switch / refresh
    const savedState = localStorage.getItem(getTodayKey());
    if (savedState && !forceReset) {
      try {
        const parsed = JSON.parse(savedState);
        const idx = Math.min(newQueue.length > 0 ? newQueue.length - 1 : 0, parsed.currentIndex || 0);
        setCurrentIndex(idx);
        setCardsCompletedSession(parsed.cardsCompleted || 0);
        setCorrectFirstTrySession(parsed.correctFirstTry || 0);
        setIsSessionFinished(parsed.isFinished || false);
        return;
      } catch {
        // Fallback
      }
    }

    setCurrentIndex(0);
    setCardsCompletedSession(0);
    setCorrectFirstTrySession(0);
    setIsSessionFinished(false);
    localStorage.removeItem(getTodayKey());
  };

  const handleCardSubmit = async (firstTryCorrect: boolean) => {
    if (currentIndex >= queue.length) return;

    const currentCard = queue[currentIndex];
    // Permanently record attempt in IndexedDB
    await recordCardAttempt(currentCard.id, firstTryCorrect);

    // Trigger debounced cross-device push to cloud
    syncService.triggerDebouncedPush();

    const nextCompleted = cardsCompletedSession + 1;
    const nextCorrect = firstTryCorrect ? correctFirstTrySession + 1 : correctFirstTrySession;
    const nextIdx = currentIndex + 1;
    const isFinished = nextIdx >= queue.length;

    setCardsCompletedSession(nextCompleted);
    if (firstTryCorrect) {
      setCorrectFirstTrySession(nextCorrect);
    }

    if (isFinished) {
      setIsSessionFinished(true);
    } else {
      setCurrentIndex(nextIdx);
    }

    // Persist session progress in localStorage so switching tabs or refreshing phone browser never loses count
    localStorage.setItem(getTodayKey(), JSON.stringify({
      currentIndex: nextIdx,
      cardsCompleted: nextCompleted,
      correctFirstTry: nextCorrect,
      isFinished
    }));
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
              onStartNewSession={() => loadNewSession(settings.dailyGoal, true)}
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
            loadNewSession(newSet.dailyGoal, true);
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
