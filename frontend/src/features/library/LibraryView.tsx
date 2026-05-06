export function LibraryView() {
  return (
    <section className="view-stack">
      <h2>Library</h2>
      <div className="chips"><button>Reading</button><button>Plan to Read</button><button>Completed</button></div>
      <article className="result-card"><h3>Continue reading</h3><p>Your imported novels will appear here.</p></article>
    </section>
  );
}
