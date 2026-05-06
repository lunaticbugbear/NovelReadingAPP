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
