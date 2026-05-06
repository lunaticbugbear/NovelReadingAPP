import type { NovelEntry, SourceEntry } from '../domain/models';
import { openNovelReaderDb } from './db';

export function createLibraryRepository() {
  return {
    async saveSource(source: SourceEntry) {
      const db = await openNovelReaderDb();
      await db.put('sources', source);
    },
    async listSources() {
      const db = await openNovelReaderDb();
      return db.getAll('sources');
    },
    async saveNovel(novel: NovelEntry) {
      const db = await openNovelReaderDb();
      await db.put('novels', novel);
    },
    async listNovels() {
      const db = await openNovelReaderDb();
      return db.getAll('novels');
    },
    async searchNovels(query: string) {
      const normalized = query.trim().toLowerCase();
      const db = await openNovelReaderDb();
      const novels = await db.getAll('novels');
      return novels.filter((novel) =>
        [novel.title, ...novel.aliases].some((title) => title.toLowerCase().includes(normalized))
      );
    }
  };
}
