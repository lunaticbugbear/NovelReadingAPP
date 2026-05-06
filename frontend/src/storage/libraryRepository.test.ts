import { beforeEach, describe, expect, it } from 'vitest';
import { clearDatabase } from './db';
import { createLibraryRepository } from './libraryRepository';

describe('library repository', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('saves and lists sources and novels locally', async () => {
    const repo = createLibraryRepository();
    await repo.saveSource({
      id: 'novelhi',
      name: 'NovelHi',
      baseUrl: 'https://novelhi.com/',
      kind: 'built-in',
      enabled: true,
      health: 'Working',
      capabilities: { importByUrl: true, siteSearch: false, cover: 'partial', aliases: 'partial', download: true }
    });
    await repo.saveNovel({
      id: 'novel-1',
      sourceId: 'novelhi',
      sourceNovelUrl: 'https://novelhi.com/example',
      title: 'Example Novel',
      aliases: ['Example Alias'],
      synopsis: 'A test novel.',
      coverUrl: 'https://novelhi.com/cover.jpg',
      status: 'Reading',
      chapters: [],
      progress: { chapterId: null, position: 0, updatedAt: 1 },
      updatedAt: 1
    });

    expect(await repo.listSources()).toHaveLength(1);
    expect(await repo.searchNovels('alias')).toHaveLength(1);
  });
});
