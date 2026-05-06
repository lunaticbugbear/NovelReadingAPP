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
