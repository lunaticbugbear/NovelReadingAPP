import { useState } from 'react';
import type { ImportNovelResult } from '../../api/importNovelClient';
import { importNovelByUrl } from '../../api/importNovelClient';
import { createNovelEntryFromImport } from '../../domain/importedNovel';
import type { LibraryStatus, NovelEntry } from '../../domain/models';
import { createLibraryRepository } from '../../storage/libraryRepository';

type Props = {
  importNovel?: (url: string) => Promise<ImportNovelResult>;
  saveNovel?: (novel: NovelEntry) => Promise<void>;
  now?: () => number;
};

const statuses: LibraryStatus[] = ['Reading', 'Plan to Read', 'Completed'];

export function SourcesView({ importNovel = importNovelByUrl, saveNovel = createLibraryRepository().saveNovel, now = Date.now }: Props) {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ImportNovelResult | null>(null);
  const [title, setTitle] = useState('');
  const [aliasesText, setAliasesText] = useState('');
  const [status, setStatus] = useState<LibraryStatus>('Plan to Read');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit() {
    setError(null);
    setSaved(false);
    try {
      const imported = await importNovel(url);
      setResult(imported);
      setTitle(imported.title ?? '');
      setAliasesText(imported.aliases.join('\n'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.');
    }
  }

  async function save() {
    if (!result) return;
    await saveNovel(createNovelEntryFromImport(result, { title, aliasesText, status }, now()));
    setSaved(true);
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
          {result.warnings.map((warning) => <p className="warning" key={warning}>{warning}</p>)}
          {!result.title && <p className="warning">Main title was not found. Try using an alternative title before saving.</p>}
          <h3>{result.title ?? 'Untitled import'}</h3>
          <label>
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            Aliases
            <textarea value={aliasesText} onChange={(event) => setAliasesText(event.target.value)} />
          </label>
          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value as LibraryStatus)}>
              {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <p>{result.synopsis || 'No synopsis found.'}</p>
          <p>{result.chapters.length} chapters found</p>
          <button className="primary-button" onClick={save}>Save to library</button>
          {saved && <p>Saved to library.</p>}
        </article>
      )}
    </section>
  );
}
