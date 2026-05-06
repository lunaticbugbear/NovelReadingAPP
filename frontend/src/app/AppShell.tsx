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
