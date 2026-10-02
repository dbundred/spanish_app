import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db, getSettings, updateSettings } from './db';
import type { UserProgress, CardSession } from '../types';

export interface SupabaseConfig {
  url: string;
  key: string;
}

class SupabaseSyncService {
  private client: SupabaseClient | null = null;
  private config: SupabaseConfig | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Check build-time / Vercel environment variables
      const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
      const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

      // 2. Check 1-click magic setup link (#sync?url=...&key=...)
      let hashUrl: string | null = null;
      let hashKey: string | null = null;
      if (window.location.hash && window.location.hash.includes('sync?')) {
        try {
          const hashStr = window.location.hash.substring(window.location.hash.indexOf('sync?') + 5);
          const params = new URLSearchParams(hashStr);
          hashUrl = params.get('url');
          hashKey = params.get('key');
          const profileParam = params.get('profile');
          if (profileParam) {
            localStorage.setItem('lingvist_active_profile_id', profileParam);
          }
          // Clean hash from URL bar so credentials don't linger in history
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (e) {
          console.warn('Error reading sync magic link:', e);
        }
      }

      // 3. Check localStorage
      const localUrl = localStorage.getItem('lingvist_supabase_url');
      const localKey = localStorage.getItem('lingvist_supabase_key');

      const finalUrl = hashUrl || localUrl || envUrl;
      const finalKey = hashKey || localKey || envKey;

      if (finalUrl && finalKey) {
        this.initClient(finalUrl, finalKey);
      } else {
        // 4. Asynchronously restore from IndexedDB (survives iOS Safari storage cleaning)
        this.restoreFromIndexedDB();
      }
    }
  }

  public async restoreFromIndexedDB(): Promise<boolean> {
    try {
      const settings = await getSettings();
      if (settings?.supabaseUrl && settings?.supabaseKey && !this.client) {
        return this.initClient(settings.supabaseUrl, settings.supabaseKey);
      }
    } catch {
      // ignore
    }
    return false;
  }

  public isConfigured(): boolean {
    return this.client !== null;
  }

  public getConfig(): SupabaseConfig | null {
    return this.config;
  }

  public getMagicSetupLink(profileId: string = 'default'): string {
    const cfg = this.getConfig();
    if (!cfg) return '';
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://spanish-app-two-steel.vercel.app';
    const params = new URLSearchParams({
      url: cfg.url,
      key: cfg.key,
      profile: profileId
    });
    return `${base}#sync?${params.toString()}`;
  }

  public initClient(url: string, key: string): boolean {
    const cleanUrl = url.trim();
    const cleanKey = key.trim();
    if (!cleanUrl || !cleanKey) return false;

    try {
      this.client = createClient(cleanUrl, cleanKey);
      this.config = { url: cleanUrl, key: cleanKey };
      if (typeof window !== 'undefined') {
        localStorage.setItem('lingvist_supabase_url', cleanUrl);
        localStorage.setItem('lingvist_supabase_key', cleanKey);
        // Persist into IndexedDB as well
        updateSettings({ supabaseUrl: cleanUrl, supabaseKey: cleanKey }).catch(() => {});
      }
      return true;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      this.client = null;
      this.config = null;
      return false;
    }
  }

  public clearConfig(): void {
    this.client = null;
    this.config = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lingvist_supabase_url');
      localStorage.removeItem('lingvist_supabase_key');
      updateSettings({ supabaseUrl: '', supabaseKey: '' }).catch(() => {});
    }
  }


  /**
   * Test connection to Supabase table
   */
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.client) {
      return { success: false, message: 'Supabase credentials not configured' };
    }

    try {
      const { error } = await this.client
        .from('lingvist_sync')
        .select('id')
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          return {
            success: false,
            message: 'Connected to Supabase, but the "lingvist_sync" table has not been created yet. Run the SQL snippet in your Supabase SQL Editor.'
          };
        }
        return { success: false, message: `Supabase Error: ${error.message}` };
      }

      return { success: true, message: 'Successfully connected to 24/7 online Supabase cloud!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection failed' };
    }
  }

  /**
   * Bidirectional sync with Supabase:
   * 1. Pulls remote state and merges into local Dexie
   * 2. Pushes local state to Supabase
   */
  public async sync(profileId: string = 'default', profileName: string = 'Primary Profile'): Promise<boolean> {
    if (!this.client) return false;

    try {
      // 1. Fetch remote data for profile
      const { data, error } = await this.client
        .from('lingvist_sync')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Supabase fetch error:', error);
      }

      // Merge remote data into local database
      if (data) {
        if (data.progress && Array.isArray(data.progress)) {
          for (const item of data.progress as UserProgress[]) {
            const local = await db.userProgress.get(item.wordId);
            if (!local) {
              await db.userProgress.put(item);
            } else {
              if (
                item.repetitions > local.repetitions ||
                (item.lastReviewedDate || 0) > (local.lastReviewedDate || 0)
              ) {
                await db.userProgress.put(item);
              }
            }
          }
        }

        if (data.sessions && Array.isArray(data.sessions)) {
          for (const sess of data.sessions as CardSession[]) {
            if (sess.timestamp) {
              const exists = await db.sessions.where('timestamp').equals(sess.timestamp).first();
              if (!exists) {
                await db.sessions.add(sess);
              }
            }
          }
        }

        if (data.settings) {
          await updateSettings(data.settings);
        }
      }

      // 2. Read full local DB to push back merged state
      const localProgress = await db.userProgress.toArray();
      const localSessions = await db.sessions.toArray();
      const localSettings = await getSettings();

      const upsertPayload = {
        id: profileId,
        name: profileName,
        progress: localProgress,
        sessions: localSessions,
        settings: localSettings,
        updated_at: new Date().toISOString()
      };

      const { error: upsertErr } = await this.client
        .from('lingvist_sync')
        .upsert(upsertPayload);

      if (upsertErr) {
        console.error('Supabase upsert error:', upsertErr);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Supabase sync exception:', err);
      return false;
    }
  }
}

export const supabaseSyncService = new SupabaseSyncService();
