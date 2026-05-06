export function SettingsView() {
  return (
    <section className="view-stack">
      <h2>Settings</h2>
      <p>Your library is stored locally in this browser. Export a backup regularly to avoid data loss.</p>
      <button className="secondary-button">Export readable JSON backup</button>
    </section>
  );
}
