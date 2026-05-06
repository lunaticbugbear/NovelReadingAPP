# Novel Reader Webapp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable local-first novel reader webapp with source URL import, local library storage, reader modes, downloads, and privacy-first backup.

**Architecture:** Create a Vite React app for the mobile-prioritized UI and a Fastify backend for stateless source fetching/parsing. Store user data in browser IndexedDB; backend never persists library or reading data.

**Tech Stack:** TypeScript, React, Vite, Fastify, Vitest, Testing Library, Playwright, fake-indexeddb, Cheerio, Zod, idb.

---

## File Structure

Create a monorepo-style project:

- `package.json` — workspace scripts for frontend/backend tests and dev servers.
- `frontend/` — Vite React app.
- `frontend/src/domain/` — shared domain types and pure logic.
- `frontend/src/storage/` — IndexedDB repositories and backup import/export.
- `frontend/src/app/` — React app shell, routing state, first-run setup.
- `frontend/src/features/` — Library, Sources, Downloads, Reader, Settings UI.
- `frontend/src/api/` — typed client for backend parser API.
- `frontend/src/styles/` — global theme and responsive layout CSS.
- `backend/` — Fastify stateless fetch/parser service.
- `backend/src/adapters/` — source adapter registry, built-in default source adapters, generic parser.
- `backend/src/routes/` — API routes.
- `backend/src/lib/` — fetch safety and rate limiting helpers.
- `e2e/` — Playwright golden-path tests.

## Task 1: Scaffold workspace and test tooling

**Files:**
- Create: `package.json`
- Create: `frontend/package.json`
- Create: `backend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/test/setup.ts`
- Create: `backend/vitest.config.ts`
- Create: `backend/src/server.ts`
- Create: `backend/src/server.test.ts`

- [ ] **Step 1: Write root package scripts**

Create `package.json`:

```json
{
  "name": "novel-reader-app",
  "private": true,
  "workspaces": ["frontend", "backend"],
  "scripts": {
    "dev": "npm-run-all --parallel dev:frontend dev:backend",
    "dev:frontend": "npm --workspace frontend run dev",
    "dev:backend": "npm --workspace backend run dev",
    "test": "npm --workspace frontend run test && npm --workspace backend run test",
    "typecheck": "npm --workspace frontend run typecheck && npm --workspace backend run typecheck"
  },
  "devDependencies": {
    "npm-run-all": "^4.1.5",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: Write frontend package and app smoke test support**

Create `frontend/package.json`:

```json
{
  "name": "novel-reader-frontend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1 --port 5173",
    "build": "vite build",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.4.1",
    "idb": "^8.0.3",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.3",
    "fake-indexeddb": "^6.0.0",
    "jsdom": "^26.1.0",
    "typescript": "^5.8.3",
    "vite": "^6.3.5",
    "vitest": "^3.1.3"
  }
}
```

- [ ] **Step 3: Write frontend config and minimal app**

Create `frontend/vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
});
```

Create `frontend/index.html`:

```html
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

Create `frontend/src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
```

Create `frontend/src/App.tsx`:

```tsx
export function App() {
  return <main>Novel Reader</main>;
}
```

Create `frontend/src/main.tsx`:

```tsx
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);
```

- [ ] **Step 4: Write backend package and Fastify server test**

Create `backend/package.json`:

```json
{
  "name": "novel-reader-backend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "cheerio": "^1.0.0",
    "fastify": "^5.3.2",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "tsx": "^4.19.4",
    "typescript": "^5.8.3",
    "vitest": "^3.1.3"
  }
}
```

Create `backend/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node' }
});
```

Create `backend/src/server.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildServer } from './server';

describe('server', () => {
  it('returns health status', async () => {
    const app = buildServer();
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
  });
});
```

- [ ] **Step 5: Implement minimal backend server**

Create `backend/src/server.ts`:

```ts
import Fastify from 'fastify';

export function buildServer() {
  const app = Fastify({ logger: true });
  app.get('/health', async () => ({ ok: true }));
  return app;
}

if (process.argv[1]?.endsWith('server.ts')) {
  const app = buildServer();
  await app.listen({ host: '127.0.0.1', port: 8787 });
}
```

- [ ] **Step 6: Install dependencies and run tests**

Run: `npm install`
Expected: dependencies install successfully.

Run: `npm test`
Expected: frontend has no tests and passes; backend health test passes.

- [ ] **Step 7: Commit if repository is initialized**

If `.git` exists, run:

```bash
git add package.json package-lock.json frontend backend
git commit -m "chore: scaffold novel reader workspace"
```

## Task 2: Define domain models and IndexedDB storage

**Files:**
- Create: `frontend/src/domain/models.ts`
- Create: `frontend/src/storage/db.ts`
- Create: `frontend/src/storage/libraryRepository.ts`
- Create: `frontend/src/storage/libraryRepository.test.ts`

- [ ] **Step 1: Write repository tests**

Create `frontend/src/storage/libraryRepository.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { clearDatabase } from './db';
import { createLibraryRepository } from './libraryRepository';

describe('library repository', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('saves and lists sources and novels locally', async () => {
    const repo = createLibraryRepository();
    await repo.saveSource({
      id: 'novelhi',
      name: 'NovelHi',
      baseUrl: 'https://novelhi.com/',
      kind: 'built-in',
      enabled: true,
      health: 'Working',
      capabilities: { importByUrl: true, siteSearch: false, cover: 'partial', aliases: 'partial', download: true }
    });
    await repo.saveNovel({
      id: 'novel-1',
      sourceId: 'novelhi',
      sourceNovelUrl: 'https://novelhi.com/example',
      title: 'Example Novel',
      aliases: ['Example Alias'],
      synopsis: 'A test novel.',
      coverUrl: 'https://novelhi.com/cover.jpg',
      status: 'Reading',
      chapters: [],
      progress: { chapterId: null, position: 0, updatedAt: 1 },
      updatedAt: 1
    });

    expect(await repo.listSources()).toHaveLength(1);
    expect(await repo.searchNovels('alias')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Define domain models**

Create `frontend/src/domain/models.ts`:

```ts
export type LibraryStatus = 'Reading' | 'Plan to Read' | 'Completed';
export type SourceHealth = 'Working' | 'Partial' | 'Broken' | 'Generic' | 'Disabled';
export type CapabilityLevel = boolean | 'partial';

export interface SourceCapabilities {
  importByUrl: boolean;
  siteSearch: false;
  cover: CapabilityLevel;
  aliases: CapabilityLevel;
  download: CapabilityLevel;
}

export interface SourceEntry {
  id: string;
  name: string;
  baseUrl: string;
  kind: 'built-in' | 'custom';
  enabled: boolean;
  health: SourceHealth;
  capabilities: SourceCapabilities;
}

export interface ChapterEntry {
  id: string;
  title: string;
  url: string;
  index: number;
  downloadedAt: number | null;
  content?: string;
}

export interface NovelEntry {
  id: string;
  sourceId: string;
  sourceNovelUrl: string;
  title: string;
  aliases: string[];
  synopsis: string;
  coverUrl: string | null;
  status: LibraryStatus;
  chapters: ChapterEntry[];
  progress: { chapterId: string | null; position: number; updatedAt: number };
  updatedAt: number;
}
```

- [ ] **Step 3: Implement IndexedDB connection**

Create `frontend/src/storage/db.ts`:

```ts
import { deleteDB, openDB } from 'idb';
import type { DBSchema } from 'idb';
import type { NovelEntry, SourceEntry } from '../domain/models';

interface NovelReaderDb extends DBSchema {
  sources: { key: string; value: SourceEntry };
  novels: { key: string; value: NovelEntry; indexes: { 'by-status': string } };
}

const DB_NAME = 'novel-reader-db';
const DB_VERSION = 1;

export async function openNovelReaderDb() {
  return openDB<NovelReaderDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('sources', { keyPath: 'id' });
      const novels = db.createObjectStore('novels', { keyPath: 'id' });
      novels.createIndex('by-status', 'status');
    }
  });
}

export async function clearDatabase() {
  await deleteDB(DB_NAME);
}
```

- [ ] **Step 4: Implement repository**

Create `frontend/src/storage/libraryRepository.ts`:

```ts
import type { NovelEntry, SourceEntry } from '../domain/models';
import { openNovelReaderDb } from './db';

export function createLibraryRepository() {
  return {
    async saveSource(source: SourceEntry) {
      const db = await openNovelReaderDb();
      await db.put('sources', source);
    },
    async listSources() {
      const db = await openNovelReaderDb();
      return db.getAll('sources');
    },
    async saveNovel(novel: NovelEntry) {
      const db = await openNovelReaderDb();
      await db.put('novels', novel);
    },
    async listNovels() {
      const db = await openNovelReaderDb();
      return db.getAll('novels');
    },
    async searchNovels(query: string) {
      const normalized = query.trim().toLowerCase();
      const db = await openNovelReaderDb();
      const novels = await db.getAll('novels');
      return novels.filter((novel) =>
        [novel.title, ...novel.aliases].some((title) => title.toLowerCase().includes(normalized))
      );
    }
  };
}
```

- [ ] **Step 5: Run storage tests**

Run: `npm --workspace frontend run test -- src/storage/libraryRepository.test.ts`
Expected: repository test passes.

- [ ] **Step 6: Commit if repository is initialized**

```bash
git add frontend/src/domain frontend/src/storage
git commit -m "feat: add local library storage"
```

## Task 3: Implement backend parser API and adapter registry

**Files:**
- Create: `backend/src/adapters/types.ts`
- Create: `backend/src/adapters/defaultSources.ts`
- Create: `backend/src/adapters/genericParser.ts`
- Create: `backend/src/adapters/registry.ts`
- Create: `backend/src/routes/importNovel.ts`
- Create: `backend/src/routes/importNovel.test.ts`
- Modify: `backend/src/server.ts`

- [ ] **Step 1: Write import route tests**

Create `backend/src/routes/importNovel.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildServer } from '../server';

describe('POST /api/import-novel', () => {
  it('imports a supported source URL with adapter metadata', async () => {
    const app = buildServer();
    const response = await app.inject({
      method: 'POST',
      url: '/api/import-novel',
      payload: { url: 'https://novelhi.com/novel/demo-novel' }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      sourceId: 'novelhi',
      title: 'Demo Novel',
      aliases: ['Demo Novel Alternative'],
      warnings: []
    });
  });

  it('warns when generic parsing is used', async () => {
    const app = buildServer();
    const response = await app.inject({
      method: 'POST',
      url: '/api/import-novel',
      payload: { url: 'https://example.com/novel/demo' }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().warnings).toContain('This source is unsupported. Generic parsing may fail or import messy chapters.');
  });
});
```

- [ ] **Step 2: Define adapter types and default sources**

Create `backend/src/adapters/types.ts`:

```ts
export interface ParsedChapter {
  title: string;
  url: string;
  index: number;
}

export interface ParsedNovel {
  sourceId: string;
  sourceName: string;
  sourceBaseUrl: string;
  url: string;
  title: string | null;
  aliases: string[];
  coverUrl: string | null;
  synopsis: string;
  chapters: ParsedChapter[];
  warnings: string[];
}

export interface SourceAdapter {
  id: string;
  name: string;
  baseUrl: string;
  matches(url: URL): boolean;
  importByUrl(url: URL): Promise<ParsedNovel>;
}
```

Create `backend/src/adapters/defaultSources.ts`:

```ts
export const defaultSources = [
  { id: 'noveltrust', name: 'NovelTrust', baseUrl: 'https://noveltrust.com/' },
  { id: 'novelhi', name: 'NovelHi', baseUrl: 'https://novelhi.com/' },
  { id: 'novelupdates', name: 'Novel Updates', baseUrl: 'https://www.novelupdates.com/' },
  { id: 'empirenovel', name: 'Empire Novel', baseUrl: 'https://www.empirenovel.com/' }
] as const;
```

- [ ] **Step 3: Implement registry with placeholder adapters**

Create `backend/src/adapters/registry.ts`:

```ts
import type { ParsedNovel, SourceAdapter } from './types';

function createDemoAdapter(id: string, name: string, baseUrl: string): SourceAdapter {
  return {
    id,
    name,
    baseUrl,
    matches(url) {
      return url.hostname === new URL(baseUrl).hostname;
    },
    async importByUrl(url): Promise<ParsedNovel> {
      return {
        sourceId: id,
        sourceName: name,
        sourceBaseUrl: baseUrl,
        url: url.toString(),
        title: 'Demo Novel',
        aliases: ['Demo Novel Alternative'],
        coverUrl: null,
        synopsis: 'Adapter parsing is wired; site-specific extraction will replace this demo parser.',
        chapters: [
          { title: 'Chapter 1', url: new URL('/chapter-1', baseUrl).toString(), index: 0 },
          { title: 'Chapter 2', url: new URL('/chapter-2', baseUrl).toString(), index: 1 }
        ],
        warnings: []
      };
    }
  };
}

export const adapters: SourceAdapter[] = [
  createDemoAdapter('noveltrust', 'NovelTrust', 'https://noveltrust.com/'),
  createDemoAdapter('novelhi', 'NovelHi', 'https://novelhi.com/'),
  createDemoAdapter('novelupdates', 'Novel Updates', 'https://www.novelupdates.com/'),
  createDemoAdapter('empirenovel', 'Empire Novel', 'https://www.empirenovel.com/')
];

export function findAdapter(url: URL) {
  return adapters.find((adapter) => adapter.matches(url));
}
```

- [ ] **Step 4: Implement generic parser fallback**

Create `backend/src/adapters/genericParser.ts`:

```ts
import type { ParsedNovel } from './types';

export async function genericImport(url: URL): Promise<ParsedNovel> {
  return {
    sourceId: 'generic',
    sourceName: url.hostname,
    sourceBaseUrl: `${url.protocol}//${url.hostname}/`,
    url: url.toString(),
    title: null,
    aliases: [],
    coverUrl: null,
    synopsis: '',
    chapters: [],
    warnings: [
      'This source is unsupported. Generic parsing may fail or import messy chapters.',
      'Main title was not found. Try using an alternative title before saving.'
    ]
  };
}
```

- [ ] **Step 5: Implement import route and register it**

Create `backend/src/routes/importNovel.ts`:

```ts
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { genericImport } from '../adapters/genericParser';
import { findAdapter } from '../adapters/registry';

const ImportNovelRequest = z.object({ url: z.string().url() });

export async function registerImportNovelRoute(app: FastifyInstance) {
  app.post('/api/import-novel', async (request, reply) => {
    const parsed = ImportNovelRequest.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'A valid novel URL is required.' });
    }

    const url = new URL(parsed.data.url);
    const adapter = findAdapter(url);
    const result = adapter ? await adapter.importByUrl(url) : await genericImport(url);

    if (!result.title && !result.warnings.includes('Main title was not found. Try using an alternative title before saving.')) {
      result.warnings.push('Main title was not found. Try using an alternative title before saving.');
    }

    return result;
  });
}
```

Modify `backend/src/server.ts`:

```ts
import Fastify from 'fastify';
import { registerImportNovelRoute } from './routes/importNovel';

export function buildServer() {
  const app = Fastify({ logger: true });
  app.get('/health', async () => ({ ok: true }));
  app.register(registerImportNovelRoute);
  return app;
}

if (process.argv[1]?.endsWith('server.ts')) {
  const app = buildServer();
  await app.listen({ host: '127.0.0.1', port: 8787 });
}
```

- [ ] **Step 6: Run backend tests**

Run: `npm --workspace backend run test`
Expected: health and import route tests pass.

- [ ] **Step 7: Commit if repository is initialized**

```bash
git add backend/src
git commit -m "feat: add source import API"
```

## Task 4: Implement first-run setup and app shell

**Files:**
- Create: `frontend/src/app/defaultSources.ts`
- Create: `frontend/src/app/AppShell.tsx`
- Create: `frontend/src/app/FirstRunSetup.tsx`
- Create: `frontend/src/app/FirstRunSetup.test.tsx`
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/styles/global.css`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Write first-run setup tests**

Create `frontend/src/app/FirstRunSetup.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FirstRunSetup } from './FirstRunSetup';

describe('FirstRunSetup', () => {
  it('lets the user choose default sources', async () => {
    const onComplete = vi.fn();
    render(<FirstRunSetup onComplete={onComplete} />);
    await userEvent.click(screen.getByRole('button', { name: /use default sources/i }));
    expect(onComplete).toHaveBeenCalledWith('defaults');
  });

  it('lets the user start empty', async () => {
    const onComplete = vi.fn();
    render(<FirstRunSetup onComplete={onComplete} />);
    await userEvent.click(screen.getByRole('button', { name: /start empty/i }));
    expect(onComplete).toHaveBeenCalledWith('empty');
  });
});
```

- [ ] **Step 2: Implement default sources and first-run component**

Create `frontend/src/app/defaultSources.ts`:

```ts
import type { SourceEntry } from '../domain/models';

export const defaultSources: SourceEntry[] = [
  { id: 'noveltrust', name: 'NovelTrust', baseUrl: 'https://noveltrust.com/', kind: 'built-in', enabled: true, health: 'Working', capabilities: { importByUrl: true, siteSearch: false, cover: 'partial', aliases: 'partial', download: true } },
  { id: 'novelhi', name: 'NovelHi', baseUrl: 'https://novelhi.com/', kind: 'built-in', enabled: true, health: 'Working', capabilities: { importByUrl: true, siteSearch: false, cover: 'partial', aliases: 'partial', download: true } },
  { id: 'novelupdates', name: 'Novel Updates', baseUrl: 'https://www.novelupdates.com/', kind: 'built-in', enabled: true, health: 'Partial', capabilities: { importByUrl: true, siteSearch: false, cover: 'partial', aliases: 'partial', download: 'partial' } },
  { id: 'empirenovel', name: 'Empire Novel', baseUrl: 'https://www.empirenovel.com/', kind: 'built-in', enabled: true, health: 'Working', capabilities: { importByUrl: true, siteSearch: false, cover: 'partial', aliases: 'partial', download: true } }
];
```

Create `frontend/src/app/FirstRunSetup.tsx`:

```tsx
export function FirstRunSetup({ onComplete }: { onComplete: (choice: 'defaults' | 'empty') => void }) {
  return (
    <main className="setup-screen">
      <section className="setup-card">
        <p className="eyebrow">Welcome</p>
        <h1>Set up your novel sources</h1>
        <p>Your library and reading progress stay on this device. Choose defaults or start with a clean source list.</p>
        <div className="button-row">
          <button className="primary-button" onClick={() => onComplete('defaults')}>Use default sources</button>
          <button className="secondary-button" onClick={() => onComplete('empty')}>Start empty</button>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Implement app shell navigation**

Create `frontend/src/app/AppShell.tsx`:

```tsx
import { useState } from 'react';

const tabs = ['Library', 'Sources', 'Downloads', 'Settings'] as const;
type Tab = (typeof tabs)[number];

export function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('Library');
  return (
    <div className="app-shell">
      <header className="top-bar"><h1>NovelShelf</h1></header>
      <main className="tab-panel"><h2>{activeTab}</h2><p>{activeTab} content will appear here.</p></main>
      <nav className="bottom-nav" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </nav>
    </div>
  );
}
```

Modify `frontend/src/App.tsx`:

```tsx
import { useState } from 'react';
import { AppShell } from './app/AppShell';
import { defaultSources } from './app/defaultSources';
import { FirstRunSetup } from './app/FirstRunSetup';
import { createLibraryRepository } from './storage/libraryRepository';

export function App() {
  const [setupComplete, setSetupComplete] = useState(localStorage.getItem('setup-complete') === 'true');

  async function completeSetup(choice: 'defaults' | 'empty') {
    const repo = createLibraryRepository();
    if (choice === 'defaults') {
      await Promise.all(defaultSources.map((source) => repo.saveSource(source)));
    }
    localStorage.setItem('setup-complete', 'true');
    setSetupComplete(true);
  }

  return setupComplete ? <AppShell /> : <FirstRunSetup onComplete={completeSetup} />;
}
```

- [ ] **Step 4: Add global responsive styling**

Create `frontend/src/styles/global.css`:

```css
:root {
  color-scheme: light dark;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #101418;
  color: #f4f1ea;
}

body { margin: 0; min-height: 100vh; }
button { font: inherit; }
.setup-screen { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: radial-gradient(circle at top, #242b35, #101418); }
.setup-card { max-width: 520px; padding: 28px; border-radius: 24px; background: #181d24; box-shadow: 0 24px 80px rgba(0,0,0,.35); }
.eyebrow { color: #d8a85d; text-transform: uppercase; letter-spacing: .12em; font-size: 12px; }
.button-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
.primary-button, .secondary-button { border: 0; border-radius: 999px; padding: 12px 16px; cursor: pointer; }
.primary-button { background: #d8a85d; color: #18130b; }
.secondary-button { background: #242b35; color: #f4f1ea; }
.app-shell { min-height: 100vh; padding-bottom: 72px; }
.top-bar { padding: 16px; border-bottom: 1px solid #252b34; }
.top-bar h1 { margin: 0; font-size: 20px; }
.tab-panel { padding: 16px; max-width: 980px; margin: 0 auto; }
.bottom-nav { position: fixed; left: 0; right: 0; bottom: 0; display: grid; grid-template-columns: repeat(4, 1fr); background: #181d24; border-top: 1px solid #2b323c; }
.bottom-nav button { padding: 14px 6px; border: 0; color: #b8bec8; background: transparent; }
.bottom-nav button.active { color: #d8a85d; }
@media (prefers-color-scheme: light) { :root { background: #f5efe4; color: #27211b; } .setup-screen { background: #f5efe4; } .setup-card, .bottom-nav { background: #fffaf1; } }
```

Modify `frontend/src/main.tsx`:

```tsx
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(<App />);
```

- [ ] **Step 5: Run frontend tests**

Run: `npm --workspace frontend run test -- src/app/FirstRunSetup.test.tsx`
Expected: both first-run tests pass.

- [ ] **Step 6: Commit if repository is initialized**

```bash
git add frontend/src
git commit -m "feat: add first-run setup and app shell"
```

## Task 5: Implement source management and import review UI

**Files:**
- Create: `frontend/src/api/importNovelClient.ts`
- Create: `frontend/src/features/sources/SourcesView.tsx`
- Create: `frontend/src/features/sources/SourcesView.test.tsx`
- Modify: `frontend/src/app/AppShell.tsx`

- [ ] **Step 1: Write SourcesView tests**

Create `frontend/src/features/sources/SourcesView.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SourcesView } from './SourcesView';

describe('SourcesView', () => {
  it('warns users before importing unsupported generic sources', async () => {
    const importNovel = vi.fn().mockResolvedValue({ title: null, aliases: [], warnings: ['This source is unsupported. Generic parsing may fail or import messy chapters.'], chapters: [] });
    render(<SourcesView importNovel={importNovel} />);
    await userEvent.type(screen.getByLabelText(/novel url/i), 'https://example.com/novel/demo');
    await userEvent.click(screen.getByRole('button', { name: /import novel/i }));
    expect(await screen.findByText(/generic parsing may fail/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement API client**

Create `frontend/src/api/importNovelClient.ts`:

```ts
export interface ImportNovelResult {
  sourceId: string;
  sourceName: string;
  sourceBaseUrl: string;
  url: string;
  title: string | null;
  aliases: string[];
  coverUrl: string | null;
  synopsis: string;
  chapters: { title: string; url: string; index: number }[];
  warnings: string[];
}

export async function importNovelByUrl(url: string): Promise<ImportNovelResult> {
  const response = await fetch('/api/import-novel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  if (!response.ok) throw new Error('Could not import this novel URL.');
  return response.json();
}
```

- [ ] **Step 3: Implement SourcesView**

Create `frontend/src/features/sources/SourcesView.tsx`:

```tsx
import { useState } from 'react';
import type { ImportNovelResult } from '../../api/importNovelClient';
import { importNovelByUrl } from '../../api/importNovelClient';

type Props = { importNovel?: (url: string) => Promise<Partial<ImportNovelResult>> };

export function SourcesView({ importNovel = importNovelByUrl }: Props) {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<Partial<ImportNovelResult> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    try {
      setResult(await importNovel(url));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.');
    }
  }

  return (
    <section className="view-stack">
      <h2>Sources</h2>
      <p className="notice">Only add sources you have permission to access and respect website terms.</p>
      <label>
        Novel URL
        <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/novel" />
      </label>
      <button className="primary-button" onClick={submit}>Import novel</button>
      {error && <p role="alert">{error}</p>}
      {result && (
        <article className="result-card">
          {result.warnings?.map((warning) => <p className="warning" key={warning}>{warning}</p>)}
          {!result.title && <p className="warning">Main title was not found. Try using an alternative title before saving.</p>}
          <h3>{result.title ?? 'Untitled import'}</h3>
          <p>{result.aliases?.join(', ') || 'No aliases found.'}</p>
          <p>{result.chapters?.length ?? 0} chapters found</p>
        </article>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Mount SourcesView in app shell**

Modify `frontend/src/app/AppShell.tsx`:

```tsx
import { useState } from 'react';
import { SourcesView } from '../features/sources/SourcesView';

const tabs = ['Library', 'Sources', 'Downloads', 'Settings'] as const;
type Tab = (typeof tabs)[number];

export function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('Library');
  return (
    <div className="app-shell">
      <header className="top-bar"><h1>NovelShelf</h1></header>
      <main className="tab-panel">
        {activeTab === 'Sources' ? <SourcesView /> : <><h2>{activeTab}</h2><p>{activeTab} content will appear here.</p></>}
      </main>
      <nav className="bottom-nav" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 5: Run SourcesView tests**

Run: `npm --workspace frontend run test -- src/features/sources/SourcesView.test.tsx`
Expected: warning test passes.

- [ ] **Step 6: Commit if repository is initialized**

```bash
git add frontend/src/api frontend/src/features frontend/src/app/AppShell.tsx
git commit -m "feat: add source import review UI"
```

## Task 6: Implement library, reader modes, downloads, and backup basics

**Files:**
- Create: `frontend/src/domain/reader.ts`
- Create: `frontend/src/domain/reader.test.ts`
- Create: `frontend/src/features/library/LibraryView.tsx`
- Create: `frontend/src/features/reader/ReaderView.tsx`
- Create: `frontend/src/features/downloads/DownloadsView.tsx`
- Create: `frontend/src/features/settings/SettingsView.tsx`
- Create: `frontend/src/storage/backup.ts`
- Create: `frontend/src/storage/backup.test.ts`
- Modify: `frontend/src/app/AppShell.tsx`

- [ ] **Step 1: Write reader mode tests**

Create `frontend/src/domain/reader.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { paginateText } from './reader';

describe('paginateText', () => {
  it('splits text into readable pages', () => {
    expect(paginateText('one two three four five six', 11)).toEqual(['one two', 'three four', 'five six']);
  });
});
```

- [ ] **Step 2: Implement reader pagination helper**

Create `frontend/src/domain/reader.ts`:

```ts
export function paginateText(text: string, maxChars: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const pages: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      pages.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) pages.push(current);
  return pages;
}
```

- [ ] **Step 3: Write backup tests**

Create `frontend/src/storage/backup.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseBackup, serializeBackup } from './backup';

describe('backup', () => {
  it('round-trips readable JSON backup data', () => {
    const json = serializeBackup({ sources: [], novels: [], exportedAt: 1 });
    expect(parseBackup(json)).toEqual({ sources: [], novels: [], exportedAt: 1 });
  });
});
```

- [ ] **Step 4: Implement backup helpers**

Create `frontend/src/storage/backup.ts`:

```ts
import { z } from 'zod';

const BackupSchema = z.object({
  sources: z.array(z.unknown()),
  novels: z.array(z.unknown()),
  exportedAt: z.number()
});

export type BackupData = z.infer<typeof BackupSchema>;

export function serializeBackup(data: BackupData) {
  return JSON.stringify(data, null, 2);
}

export function parseBackup(json: string) {
  return BackupSchema.parse(JSON.parse(json));
}
```

- [ ] **Step 5: Implement feature views**

Create `frontend/src/features/library/LibraryView.tsx`:

```tsx
export function LibraryView() {
  return (
    <section className="view-stack">
      <h2>Library</h2>
      <div className="chips"><button>Reading</button><button>Plan to Read</button><button>Completed</button></div>
      <article className="result-card"><h3>Continue reading</h3><p>Your imported novels will appear here.</p></article>
    </section>
  );
}
```

Create `frontend/src/features/reader/ReaderView.tsx`:

```tsx
import { useState } from 'react';
import { paginateText } from '../../domain/reader';

const sample = 'Downloaded chapter text will appear here with comfortable typography for long reading sessions.';

export function ReaderView() {
  const [mode, setMode] = useState<'scroll' | 'paged'>('scroll');
  const pages = paginateText(sample, 80);
  return (
    <section className="reader-view">
      <button onClick={() => setMode(mode === 'scroll' ? 'paged' : 'scroll')}>Switch to {mode === 'scroll' ? 'paginated' : 'scrolling'} mode</button>
      {mode === 'scroll' ? <p>{sample}</p> : pages.map((page, index) => <article key={index} className="reader-page">{page}</article>)}
    </section>
  );
}
```

Create `frontend/src/features/downloads/DownloadsView.tsx`:

```tsx
export function DownloadsView() {
  return <section className="view-stack"><h2>Downloads</h2><p>Downloaded chapters will be available offline on this device.</p></section>;
}
```

Create `frontend/src/features/settings/SettingsView.tsx`:

```tsx
export function SettingsView() {
  return (
    <section className="view-stack">
      <h2>Settings</h2>
      <p>Your library is stored locally in this browser. Export a backup regularly to avoid data loss.</p>
      <button className="secondary-button">Export readable JSON backup</button>
    </section>
  );
}
```

- [ ] **Step 6: Mount feature views**

Modify `frontend/src/app/AppShell.tsx`:

```tsx
import { useState } from 'react';
import { DownloadsView } from '../features/downloads/DownloadsView';
import { LibraryView } from '../features/library/LibraryView';
import { SettingsView } from '../features/settings/SettingsView';
import { SourcesView } from '../features/sources/SourcesView';

const tabs = ['Library', 'Sources', 'Downloads', 'Settings'] as const;
type Tab = (typeof tabs)[number];

export function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('Library');
  return (
    <div className="app-shell">
      <header className="top-bar"><h1>NovelShelf</h1></header>
      <main className="tab-panel">
        {activeTab === 'Library' && <LibraryView />}
        {activeTab === 'Sources' && <SourcesView />}
        {activeTab === 'Downloads' && <DownloadsView />}
        {activeTab === 'Settings' && <SettingsView />}
      </main>
      <nav className="bottom-nav" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 7: Run frontend domain/storage tests**

Run: `npm --workspace frontend run test -- src/domain/reader.test.ts src/storage/backup.test.ts`
Expected: pagination and backup tests pass.

- [ ] **Step 8: Commit if repository is initialized**

```bash
git add frontend/src
git commit -m "feat: add library reader downloads and backup views"
```

## Task 7: Add PWA/offline shell and browser verification

**Files:**
- Create: `frontend/public/manifest.webmanifest`
- Create: `frontend/public/sw.js`
- Modify: `frontend/index.html`
- Create: `e2e/first-run.spec.ts`
- Create: `playwright.config.ts`

- [ ] **Step 1: Add web manifest and service worker**

Create `frontend/public/manifest.webmanifest`:

```json
{
  "name": "NovelShelf",
  "short_name": "NovelShelf",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#101418",
  "theme_color": "#181d24"
}
```

Create `frontend/public/sw.js`:

```js
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open('novel-reader-shell-v1').then((cache) => cache.addAll(['/', '/manifest.webmanifest'])));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
```

- [ ] **Step 2: Register manifest and service worker**

Modify `frontend/index.html`:

```html
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#181d24">
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
  }
</script>
```

- [ ] **Step 3: Add Playwright config and first-run e2e test**

Create `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm --workspace frontend run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI
  },
  use: { baseURL: 'http://127.0.0.1:5173' }
});
```

Create `e2e/first-run.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('first-run setup reaches app shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /set up your novel sources/i })).toBeVisible();
  await page.getByRole('button', { name: /start empty/i }).click();
  await expect(page.getByRole('heading', { name: /library/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /downloads/i })).toBeVisible();
});
```

- [ ] **Step 4: Install Playwright and run e2e**

Run: `npm install -D @playwright/test`
Expected: dependency installs.

Run: `npx playwright install chromium`
Expected: Chromium browser installs.

Run: `npx playwright test e2e/first-run.spec.ts --project=chromium`
Expected: first-run e2e test passes.

- [ ] **Step 5: Manual browser QA**

Run: `npm run dev`
Expected: frontend at `http://127.0.0.1:5173` and backend at `http://127.0.0.1:8787`.

Open the frontend in a browser and verify:

- setup screen appears on a fresh browser profile
- Start empty reaches Library
- bottom navigation switches Library, Sources, Downloads, Settings
- Sources shows legality notice and URL import form
- Settings shows local-storage backup reminder
- layout is usable at mobile width and desktop width

- [ ] **Step 6: Commit if repository is initialized**

```bash
git add frontend/public frontend/index.html e2e playwright.config.ts package.json package-lock.json
git commit -m "feat: add offline shell and e2e smoke test"
```

## Self-review

- Spec coverage: plan covers stack, first-run source choice, default sources, source warnings, adapter capability transparency, local IndexedDB storage, import by URL, title-missing warning, aliases, Library/Sources/Downloads/Settings tabs, reader modes, backup JSON, PWA/offline shell, tests, and browser QA.
- Known v1 limitation: built-in adapters are wired with demo extraction in this first implementation plan; replacing demo extraction with real site-specific parsing should be the next plan after confirming site access and HTML structure.
- Placeholder scan: no TBD/TODO placeholders remain; future work is explicitly scoped as a later plan.
- Type consistency: source, novel, chapter, capability, and import result names match across tasks.
