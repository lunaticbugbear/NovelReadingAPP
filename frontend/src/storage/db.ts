import { deleteDB, openDB } from 'idb';
import type { DBSchema } from 'idb';
import type { NovelEntry, SourceEntry } from '../domain/models';

interface NovelReaderDb extends DBSchema {
  sources: { key: string; value: SourceEntry };
  novels: { key: string; value: NovelEntry; indexes: { 'by-status': string } };
}

const DB_NAME = 'novel-reader-db';
const DB_VERSION = 1;

export async function openNovelReaderDb() {
  return openDB<NovelReaderDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('sources', { keyPath: 'id' });
      const novels = db.createObjectStore('novels', { keyPath: 'id' });
      novels.createIndex('by-status', 'status');
    }
  });
}

export async function clearDatabase() {
  await deleteDB(DB_NAME);
}
