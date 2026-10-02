import React, { useState, useEffect } from 'react';
import type { AppSettings } from '../types';
import { updateSettings, db } from '../services/db';
import { audioService } from '../services/audio';
import { X, Save, RotateCcw, Download, Sliders, Play } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  onClose: () => void;
  onSettingsUpdated: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onClose,
  onSettingsUpdated
}) => {
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal);
  const [autoPronounce, setAutoPronounce] = useState(settings.autoPronounce);
  const [accentToolbar, setAccentToolbar] = useState(settings.accentToolbar);
  const [preferredVoice, setPreferredVoice] = useState<string>(settings.preferredVoice || '');
  const [speechRate, setSpeechRate] = useState<number>(settings.speechRate || 0.92);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const voices = audioService.getSpanishVoices();
    setAvailableVoices(voices);
    if (!preferredVoice && voices.length > 0) {
      setPreferredVoice(voices[0].name);
    }
  }, []);

  const handleSave = async () => {
    const updated: AppSettings = {
      ...settings,
      dailyGoal,
      autoPronounce,
      accentToolbar,
      preferredVoice,
      speechRate
    };
    await updateSettings(updated);
    onSettingsUpdated(updated);
    onClose();
  };

  const testVoiceSample = () => {
    audioService.speakSpanish(
      'Hola, este es un ejemplo de pronunciación en español.',
      preferredVoice,
      speechRate
    );
  };

  const handleResetProgress = async () => {
    if (confirm('Are you sure you want to reset all user learning progress? This cannot be undone.')) {
      await db.userProgress.clear();
      await db.sessions.clear();
      alert('Learning progress has been reset.');
      window.location.reload();
    }
  };

  const handleExportData = async () => {
    const progress = await db.userProgress.toArray();
    const sessions = await db.sessions.toArray();
    const exportObject = { progress, sessions, date: new Date().toISOString() };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lingvist_spanish_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
        style={{ maxWidth: '480px', width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="header-btn"
          style={{ position: 'absolute', top: '16px', right: '16px' }}
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={22} /> App Settings
        </h2>

        <div>
          <label style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '6px' }}>
            🗣 Spanish Voice Selection (Natural Voice)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              className="filter-select"
              style={{ flex: 1 }}
              value={preferredVoice}
              onChange={e => setPreferredVoice(e.target.value)}
            >
              {availableVoices.length === 0 ? (
                <option value="">Default System Voice</option>
              ) : (
                availableVoices.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))
              )}
            </select>
            <button className="audio-btn" onClick={testVoiceSample} title="Test voice audio">
              <Play size={16} /> Test
            </button>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
            Tip: Select voices containing "Google", "Natural", "Neural", "Monica", or "Jorge" for smooth speech.
          </span>
        </div>

        <div>
          <label style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '6px' }}>
            🔊 Speech Rate Speed ({speechRate}x)
          </label>
          <input
            type="range"
            min="0.75"
            max="1.1"
            step="0.05"
            value={speechRate}
            onChange={e => setSpeechRate(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-teal)' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '6px' }}>
            Daily Session Target (Cards per session)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[20, 50, 100].map(val => (
              <button
                key={val}
                type="button"
                className={`nav-tab-btn ${dailyGoal === val ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setDailyGoal(val)}
              >
                {val} cards
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>Auto-Pronounce Spanish</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Automatically speak sentence audio on card display
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoPronounce}
            onChange={e => setAutoPronounce(e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-teal)' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>Spanish Accent Bar</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Show (á, é, í, ó, ú, ñ, ü) helper buttons under card
            </div>
          </div>
          <input
            type="checkbox"
            checked={accentToolbar}
            onChange={e => setAccentToolbar(e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-teal)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button className="primary-btn" style={{ flex: 1 }} onClick={handleSave}>
            <Save size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Save Settings
          </button>
        </div>

        <hr style={{ borderColor: 'var(--border-color)', margin: '12px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className="audio-btn"
            style={{ justifyContent: 'center' }}
            onClick={handleExportData}
          >
            <Download size={16} /> Export Progress Backup (JSON)
          </button>

          <button
            className="audio-btn"
            style={{ justifyContent: 'center', color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}
            onClick={handleResetProgress}
          >
            <RotateCcw size={16} /> Reset All Learning Progress
          </button>
        </div>
      </div>
    </div>
  );
};
