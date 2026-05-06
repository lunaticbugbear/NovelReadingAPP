import { describe, expect, it } from 'vitest';
import type { ImportNovelResult } from '../api/importNovelClient';
import { createNovelEntryFromImport } from './importedNovel';

const imported: ImportNovelResult = {
  sourceId: 'novelupdates',
  sourceName: 'Novel Updates',
  sourceBaseUrl: 'https://www.novelupdates.com/',
  url: 'https://www.novelupdates.com/series/demo-novel/',
  title: 'Demo Novel',
  aliases: ['Original Alias'],
  coverUrl: 'https://www.novelupdates.com/covers/demo.jpg',
  synopsis: 'A parsed synopsis.',
  chapters: [
    { title: 'Chapter 1', url: 'https://www.novelupdates.com/extnu/1/', index: 0 },
    { title: 'Chapter 2', url: 'https://www.novelupdates.com/extnu/2/', index: 1 }
  ],
  warnings: []
};

describe('createNovelEntryFromImport', () => {
  it('creates a local novel entry from imported metadata and edits', () => {
    const novel = createNovelEntryFromImport(imported, {
      title: 'Edited Demo Novel',
      aliasesText: 'Original Alias\nSecond Alias',
      status: 'Reading'
    }, 123);

    expect(novel).toEqual({
      id: 'novelupdates-https%3A%2F%2Fwww.novelupdates.com%2Fseries%2Fdemo-novel%2F',
      sourceId: 'novelupdates',
      sourceNovelUrl: imported.url,
      title: 'Edited Demo Novel',
      aliases: ['Original Alias', 'Second Alias'],
      synopsis: 'A parsed synopsis.',
      coverUrl: 'https://www.novelupdates.com/covers/demo.jpg',
      status: 'Reading',
      chapters: [
        { id: 'novelupdates-https%3A%2F%2Fwww.novelupdates.com%2Fseries%2Fdemo-novel%2F-chapter-0', title: 'Chapter 1', url: 'https://www.novelupdates.com/extnu/1/', index: 0, downloadedAt: null },
        { id: 'novelupdates-https%3A%2F%2Fwww.novelupdates.com%2Fseries%2Fdemo-novel%2F-chapter-1', title: 'Chapter 2', url: 'https://www.novelupdates.com/extnu/2/', index: 1, downloadedAt: null }
      ],
      progress: { chapterId: null, position: 0, updatedAt: 123 },
      updatedAt: 123
    });
  });

  it('splits, trims, and deduplicates aliases', () => {
    const novel = createNovelEntryFromImport(imported, {
      title: 'Demo Novel',
      aliasesText: ' Alpha, Beta \nAlpha\n  ',
      status: 'Plan to Read'
    }, 123);

    expect(novel.aliases).toEqual(['Alpha', 'Beta']);
  });

  it('falls back when the imported and edited titles are empty', () => {
    const novel = createNovelEntryFromImport({ ...imported, title: null }, {
      title: '   ',
      aliasesText: '',
      status: 'Completed'
    }, 123);

    expect(novel.title).toBe('Untitled import');
  });
});
