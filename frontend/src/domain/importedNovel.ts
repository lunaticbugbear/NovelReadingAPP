import type { ImportNovelResult } from '../api/importNovelClient';
import type { LibraryStatus, NovelEntry } from './models';

type ImportEdits = {
  title: string;
  aliasesText: string;
  status: LibraryStatus;
};

export function createNovelEntryFromImport(result: ImportNovelResult, edits: ImportEdits, now: number): NovelEntry {
  const id = `${result.sourceId}-${encodeURIComponent(result.url)}`;

  return {
    id,
    sourceId: result.sourceId,
    sourceNovelUrl: result.url,
    title: edits.title.trim() || result.title?.trim() || 'Untitled import',
    aliases: splitAliases(edits.aliasesText),
    synopsis: result.synopsis,
    coverUrl: result.coverUrl,
    status: edits.status,
    chapters: result.chapters.map((chapter) => ({
      id: `${id}-chapter-${chapter.index}`,
      title: chapter.title,
      url: chapter.url,
      index: chapter.index,
      downloadedAt: null
    })),
    progress: { chapterId: null, position: 0, updatedAt: now },
    updatedAt: now
  };
}

function splitAliases(aliasesText: string) {
  return [...new Set(aliasesText.split(/[\n,]/).map((alias) => alias.trim()).filter(Boolean))];
}
