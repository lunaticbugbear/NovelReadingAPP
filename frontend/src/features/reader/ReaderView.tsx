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
