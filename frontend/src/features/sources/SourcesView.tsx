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
