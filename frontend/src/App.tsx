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
