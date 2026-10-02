import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function syncServerPlugin(): Plugin {
  const dataDir = path.resolve(process.cwd(), 'server_data');
  const profilesFile = path.resolve(dataDir, 'profiles.json');

  const ensureDb = () => {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(profilesFile)) {
      const initial = {
        profiles: {
          default: {
            id: 'default',
            name: 'Primary Profile',
            updatedAt: Date.now(),
            progress: [],
            sessions: [],
            settings: {
              dailyGoal: 50,
              autoPronounce: true,
              soundEffects: true,
              theme: 'light',
              accentToolbar: true
            }
          }
        }
      };
      fs.writeFileSync(profilesFile, JSON.stringify(initial, null, 2), 'utf-8');
    }
  };

  const getDb = () => {
    ensureDb();
    try {
      const data = fs.readFileSync(profilesFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return { profiles: {} };
    }
  };

  const saveDb = (db: any) => {
    ensureDb();
    fs.writeFileSync(profilesFile, JSON.stringify(db, null, 2), 'utf-8');
  };

  const parseJsonBody = (req: any): Promise<any> => {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });
  };

  const handleRoutes = async (req: any, res: any, next: any) => {
    const url = req.url || '';

    // Enable CORS for mobile network access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    // 1. GET /api/info
    if (url === '/api/info') {
      const ifaces = os.networkInterfaces();
      const localIps: string[] = [];
      Object.values(ifaces).forEach((details) => {
        details?.forEach((d) => {
          if (d.family === 'IPv4' && !d.internal) {
            localIps.push(d.address);
          }
        });
      });
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ localIps, port: 5173 }));
      return;
    }

    // 2. GET /api/profiles
    if (url === '/api/profiles' && req.method === 'GET') {
      const db = getDb();
      const list = Object.values(db.profiles || {}).map((p: any) => ({
        id: p.id,
        name: p.name,
        updatedAt: p.updatedAt || 0,
        wordCount: p.progress ? p.progress.length : 0,
        learnedCount: p.progress ? p.progress.filter((w: any) => w.status === 'learned').length : 0
      }));
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(list));
      return;
    }

    // 3. POST /api/profiles (create or rename profile)
    if (url === '/api/profiles' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const db = getDb();
      const id = body.id || `p_${Date.now()}`;
      const name = body.name || 'Spanish Learner';

      if (!db.profiles[id]) {
        db.profiles[id] = {
          id,
          name,
          updatedAt: Date.now(),
          progress: [],
          sessions: [],
          settings: {
            dailyGoal: 50,
            autoPronounce: true,
            soundEffects: true,
            theme: 'light',
            accentToolbar: true
          }
        };
      } else {
        db.profiles[id].name = name;
        db.profiles[id].updatedAt = Date.now();
      }
      saveDb(db);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(db.profiles[id]));
      return;
    }

    // 4. GET /api/sync/:profileId
    if (url.startsWith('/api/sync/') && req.method === 'GET') {
      const profileId = url.replace('/api/sync/', '').split('?')[0];
      const db = getDb();
      const profile = db.profiles[profileId] || {
        id: profileId,
        name: 'My Profile',
        updatedAt: Date.now(),
        progress: [],
        sessions: [],
        settings: {}
      };
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(profile));
      return;
    }

    // 5. POST /api/sync/:profileId
    if (url.startsWith('/api/sync/') && req.method === 'POST') {
      const profileId = url.replace('/api/sync/', '').split('?')[0];
      const body = await parseJsonBody(req);
      const db = getDb();

      const existing = db.profiles[profileId] || {
        id: profileId,
        name: body.name || 'My Profile',
        progress: [],
        sessions: [],
        settings: {}
      };

      // Merge progress: for each word, keep the record with higher repetitions or latest review
      const progressMap = new Map<string, any>();
      (existing.progress || []).forEach((p: any) => progressMap.set(p.wordId, p));

      (body.progress || []).forEach((incoming: any) => {
        const curr = progressMap.get(incoming.wordId);
        if (!curr) {
          progressMap.set(incoming.wordId, incoming);
        } else {
          // Keep highest progress or most recent attempt
          if (
            incoming.repetitions > curr.repetitions ||
            (incoming.lastReviewedDate || 0) > (curr.lastReviewedDate || 0)
          ) {
            progressMap.set(incoming.wordId, incoming);
          }
        }
      });

      existing.progress = Array.from(progressMap.values());
      if (body.settings && Object.keys(body.settings).length > 0) {
        existing.settings = { ...existing.settings, ...body.settings };
      }
      if (body.name) {
        existing.name = body.name;
      }
      if (body.sessions && Array.isArray(body.sessions)) {
        existing.sessions = body.sessions;
      }
      existing.updatedAt = Date.now();

      db.profiles[profileId] = existing;
      saveDb(db);

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true, profile: existing }));
      return;
    }

    next();
  };

  return {
    name: 'sync-server-plugin',
    configureServer(server) {
      server.middlewares.use(handleRoutes);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleRoutes);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), syncServerPlugin()],
});
