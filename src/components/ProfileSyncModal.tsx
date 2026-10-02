import React, { useState, useEffect } from 'react';
import { syncService, type RemoteProfileSummary, type SyncStatus } from '../services/sync';
import { supabaseSyncService } from '../services/supabaseSync';
import { X, User, RefreshCw, Smartphone, Check, Plus, Wifi, Cloud, Globe, Key, Database, Copy, ShieldCheck, Share2 } from 'lucide-react';

interface ProfileSyncModalProps {
  onClose: () => void;
  onProfileChanged: () => void;
}

export const ProfileSyncModal: React.FC<ProfileSyncModalProps> = ({ onClose, onProfileChanged }) => {
  const [activeProfile, setActiveProfile] = useState(syncService.getActiveProfile());
  const [profiles, setProfiles] = useState<RemoteProfileSummary[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isSyncing, setIsSyncing] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);

  // Supabase state
  const isSupabaseConfigured = supabaseSyncService.isConfigured();
  const existingConfig = supabaseSyncService.getConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(existingConfig?.url || '');
  const [supabaseKey, setSupabaseKey] = useState(existingConfig?.key || '');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSqlSnippet, setShowSqlSnippet] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const sqlCode = `-- Run this in your Supabase SQL Editor:
create table if not exists lingvist_sync (
  id text primary key,
  name text,
  progress jsonb,
  sessions jsonb,
  settings jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table lingvist_sync enable row level security;
create policy "Public access" on lingvist_sync for all using (true) with check (true);`;

  useEffect(() => {
    loadData();
    const unsub = syncService.subscribeStatus(setSyncStatus);
    return () => unsub();
  }, []);

  const loadData = async () => {
    const list = await syncService.fetchProfiles();
    setProfiles(list);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncService.syncBidirectional();
    await loadData();
    setIsSyncing(false);
  };

  const handleSelectProfile = async (p: RemoteProfileSummary) => {
    syncService.setActiveProfile(p.id, p.name);
    setActiveProfile({ id: p.id, name: p.name });
    setIsSyncing(true);
    await syncService.syncBidirectional(p.id);
    setIsSyncing(false);
    onProfileChanged();
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return;
    const newId = await syncService.createProfile(newProfileName.trim());
    setActiveProfile({ id: newId, name: newProfileName.trim() });
    setNewProfileName('');
    setShowCreateInput(false);
    await syncService.syncBidirectional(newId);
    await loadData();
    onProfileChanged();
  };

  const handleSaveSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) return;
    supabaseSyncService.initClient(supabaseUrl.trim(), supabaseKey.trim());
    setIsSyncing(true);
    const res = await supabaseSyncService.testConnection();
    setTestResult(res);
    if (res.success) {
      await syncService.syncBidirectional();
      onProfileChanged();
    }
    setIsSyncing(false);
  };

  const handleDisconnectSupabase = () => {
    supabaseSyncService.clearConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setTestResult(null);
  };

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const [copiedMagicLink, setCopiedMagicLink] = useState(false);

  const copyMagicLink = () => {
    const link = supabaseSyncService.getMagicSetupLink(activeProfile.id);
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiedMagicLink(true);
    setTimeout(() => setCopiedMagicLink(false), 3000);
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
        style={{ maxWidth: '540px', width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="header-btn"
          style={{ position: 'absolute', top: '16px', right: '16px' }}
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <User style={{ color: 'var(--accent-teal)' }} size={24} /> Cloud Sync & Mobile Hosting
        </h2>

        {/* Active Profile Status Header */}
        <div
          style={{
            background: 'var(--bg-card-subtle)',
            padding: '16px',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Active Profile
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {activeProfile.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '13px' }}>
              {isSupabaseConfigured ? (
                <>
                  <Globe size={14} style={{ color: 'var(--accent-green)' }} />
                  <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>24/7 Cloud Database (Online)</span>
                </>
              ) : syncStatus === 'synced' ? (
                <>
                  <Wifi size={14} style={{ color: 'var(--accent-blue)' }} />
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Local Network Synced</span>
                </>
              ) : (
                <>
                  <Cloud size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Offline / Local DB</span>
                </>
              )}
            </div>
          </div>

          <button
            className="audio-btn"
            onClick={handleManualSync}
            disabled={isSyncing}
            style={{ padding: '8px 12px' }}
          >
            <RefreshCw size={16} className={isSyncing ? 'spin-animation' : ''} /> Sync Now
          </button>
        </div>

        {/* 24/7 Cloud Database (Supabase) Setup Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(2, 132, 199, 0.08))',
            border: '1.5px solid var(--accent-teal)',
            borderRadius: '14px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '16px', color: 'var(--accent-teal-dark)' }}>
              <Database size={20} />
              <span>24/7 Cloud Database (Works Laptop Off)</span>
            </div>
            {isSupabaseConfigured && (
              <span className="status-badge learned" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Connected
              </span>
            )}
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            To sync between laptop and phone 24/7 with zero dependence on Wi-Fi or keeping your laptop awake, connect a free Supabase cloud database:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Supabase Project URL:
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '13px',
                  marginTop: '2px'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Supabase Anon / Public Key:
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseKey}
                onChange={e => setSupabaseKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '13px',
                  marginTop: '2px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                className="primary-btn"
                style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                onClick={handleSaveSupabase}
                disabled={isSyncing}
              >
                <Key size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Save & Connect Cloud
              </button>

              {isSupabaseConfigured && (
                <button
                  className="audio-btn"
                  style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)', fontSize: '13px' }}
                  onClick={handleDisconnectSupabase}
                >
                  Disconnect
                </button>
              )}
            </div>

            {testResult && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: testResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  color: testResult.success ? 'var(--accent-green)' : 'var(--accent-red)',
                  border: `1px solid ${testResult.success ? 'var(--accent-green)' : 'var(--accent-red)'}`
                }}
              >
                {testResult.message}
              </div>
            )}

            {isSupabaseConfigured && (
              <div
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  border: '1.5px solid var(--accent-teal)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginTop: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-teal-dark)' }}>
                    📲 1-Click Phone Login (No typing required!)
                  </span>
                  <button
                    className="primary-btn"
                    style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={copyMagicLink}
                  >
                    {copiedMagicLink ? <Check size={14} /> : <Share2 size={14} />}
                    {copiedMagicLink ? 'Link Copied to Clipboard!' : 'Copy Login Link for Phone'}
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Send this link to your phone (iMessage, WhatsApp, Notes, Email) and tap it once. Your phone will auto-configure and save your cloud login permanently!
                </p>
              </div>
            )}

            {/* SQL Snippet Helper */}
            <div>
              <button
                className="header-btn"
                style={{ width: '100%', borderRadius: '8px', fontSize: '12px', height: 'auto', padding: '6px' }}
                onClick={() => setShowSqlSnippet(!showSqlSnippet)}
              >
                {showSqlSnippet ? '▲ Hide SQL Table Setup' : '▼ Click here to view Supabase 1-click SQL table snippet'}
              </button>

              {showSqlSnippet && (
                <div style={{ marginTop: '8px', background: 'var(--bg-app)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Paste in Supabase SQL Editor:</span>
                    <button className="audio-btn" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={copySql}>
                      {copiedSql ? <Check size={12} /> : <Copy size={12} />} {copiedSql ? 'Copied' : 'Copy SQL'}
                    </button>
                  </div>
                  <pre style={{ fontSize: '11px', overflowX: 'auto', margin: 0, color: 'var(--text-primary)' }}>
                    {sqlCode}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Public Mobile Hosting Guide Box */}
        <div
          style={{
            background: 'var(--bg-card-subtle)',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px' }}>
            <Smartphone size={18} style={{ color: 'var(--accent-teal)' }} />
            <span>Host the App Online (Free on Vercel / Netlify)</span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            To get a permanent public HTTPS URL (e.g. <code>https://my-spanish.vercel.app</code>) that you can open on your phone anywhere in the world on 4G/5G:
          </p>

          <ol style={{ fontSize: '12px', color: 'var(--text-primary)', paddingLeft: '18px', lineHeight: 1.6 }}>
            <li>Run <code>npm run build</code> in the project folder.</li>
            <li>Deploy for free with Vercel by running <code>npx vercel</code> or connecting to GitHub.</li>
            <li>Open your free Vercel URL on your phone anytime, anywhere!</li>
          </ol>
        </div>

        {/* Local Profiles List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px' }}>Local Profile Switcher</span>
            {!showCreateInput && (
              <button
                className="audio-btn"
                style={{ padding: '4px 10px', fontSize: '12px' }}
                onClick={() => setShowCreateInput(true)}
              >
                <Plus size={14} /> New Profile
              </button>
            )}
          </div>

          {showCreateInput && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                className="blank-input"
                placeholder="Profile Name (e.g. Alex, Travel)"
                value={newProfileName}
                onChange={e => setNewProfileName(e.target.value)}
                style={{ flex: 1, fontSize: '14px', padding: '8px 12px' }}
              />
              <button className="primary-btn" style={{ padding: '8px 14px', fontSize: '14px' }} onClick={handleCreateProfile}>
                Add
              </button>
              <button className="header-btn" onClick={() => setShowCreateInput(false)}>
                <X size={16} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {profiles.map(p => {
              const isSelected = p.id === activeProfile.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProfile(p)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `1.5px solid ${isSelected ? 'var(--accent-teal)' : 'var(--border-color)'}`,
                    background: isSelected ? 'rgba(20, 184, 166, 0.08)' : 'var(--bg-card-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>{p.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                      {p.learnedCount} learned • {p.wordCount} words encountered
                    </span>
                  </div>
                  {isSelected && <Check size={18} style={{ color: 'var(--accent-teal)' }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
