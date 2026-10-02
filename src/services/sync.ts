import { db, getSettings, updateSettings } from './db';
import type { UserProgress, CardSession } from '../types';
import { supabaseSyncService } from './supabaseSync';

export interface RemoteProfileSummary {
  id: string;
  name: string;
  updatedAt: number;
  wordCount: number;
  learnedCount: number;
}

export interface ServerInfo {
  localIps: string[];
  port: number;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

class SyncService {
  private activeProfileId: string = 'default';
  private activeProfileName: string = 'Primary Profile';
  private statusListeners: Array<(status: SyncStatus) => void> = [];
  private currentStatus: SyncStatus = 'synced';
  private syncDebounceTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('lingvist_profile_id');
      const storedName = localStorage.getItem('lingvist_profile_name');
      if (storedId) this.activeProfileId = storedId;
      if (storedName) this.activeProfileName = storedName;
    }
  }

  public getActiveProfile(): { id: string; name: string } {
    return {
      id: this.activeProfileId,
      name: this.activeProfileName
    };
  }

  public setActiveProfile(id: string, name: string): void {
    this.activeProfileId = id;
    this.activeProfileName = name;
    if (typeof window !== 'undefined') {
      localStorage.setItem('lingvist_profile_id', id);
      localStorage.setItem('lingvist_profile_name', name);
    }
  }

  public subscribeStatus(listener: (status: SyncStatus) => void): () => void {
    this.statusListeners.push(listener);
    listener(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  private setStatus(status: SyncStatus): void {
    this.currentStatus = status;
    this.statusListeners.forEach(l => l(status));
  }

  public async getServerInfo(): Promise<ServerInfo | null> {
    try {
      const res = await fetch('/api/info');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async fetchProfiles(): Promise<RemoteProfileSummary[]> {
    try {
      const res = await fetch('/api/profiles');
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  public async createProfile(name: string): Promise<string> {
    const id = 'p_' + Math.random().toString(36).substring(2, 9);
    try {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name })
      });
    } catch (e) {
      console.warn('Could not reach local server, profile stored locally', e);
    }
    this.setActiveProfile(id, name);
    return id;
  }

  /**
   * Bidirectional sync:
   * 1. If Supabase Cloud is configured -> syncs directly 24/7 over internet
   * 2. Otherwise -> syncs with local network server if reachable
   */
  public async syncBidirectional(profileId: string = this.activeProfileId): Promise<boolean> {
    this.setStatus('syncing');

    // 1. Check Supabase 24/7 Cloud Sync
    if (supabaseSyncService.isConfigured()) {
      const ok = await supabaseSyncService.sync(profileId, this.activeProfileName);
      if (ok) {
        this.setStatus('synced');
        return true;
      }
    }

    // 2. Local network server fallback
    try {
      const res = await fetch(`/api/sync/${profileId}`);
      if (!res.ok) {
        this.setStatus('offline');
        return false;
      }
      const remoteData = await res.json();

      if (remoteData.progress && Array.isArray(remoteData.progress)) {
        for (const remoteItem of remoteData.progress as UserProgress[]) {
          const localItem = await db.userProgress.get(remoteItem.wordId);
          if (!localItem) {
            await db.userProgress.put(remoteItem);
          } else {
            if (
              remoteItem.repetitions > localItem.repetitions ||
              (remoteItem.lastReviewedDate || 0) > (localItem.lastReviewedDate || 0)
            ) {
              await db.userProgress.put(remoteItem);
            }
          }
        }
      }

      if (remoteData.sessions && Array.isArray(remoteData.sessions)) {
        for (const sess of remoteData.sessions as CardSession[]) {
          if (sess.timestamp) {
            const exists = await db.sessions.where('timestamp').equals(sess.timestamp).first();
            if (!exists) {
              await db.sessions.add(sess);
            }
          }
        }
      }

      if (remoteData.settings && Object.keys(remoteData.settings).length > 0) {
        await updateSettings(remoteData.settings);
      }

      const localProgress = await db.userProgress.toArray();
      const localSessions = await db.sessions.toArray();
      const localSettings = await getSettings();

      await fetch(`/api/sync/${profileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.activeProfileName,
          progress: localProgress,
          sessions: localSessions,
          settings: localSettings
        })
      });

      this.setStatus('synced');
      return true;
    } catch {
      this.setStatus('offline');
      return false;
    }
  }

  public triggerDebouncedPush(): void {
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
    }
    this.syncDebounceTimer = setTimeout(() => {
      this.syncBidirectional();
    }, 1200);
  }
}

export const syncService = new SyncService();
