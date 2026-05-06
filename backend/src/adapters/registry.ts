import type { ParsedNovel, SourceAdapter } from './types';

function createDemoAdapter(id: string, name: string, baseUrl: string): SourceAdapter {
  return {
    id,
    name,
    baseUrl,
    matches(url) {
      return url.hostname === new URL(baseUrl).hostname;
    },
    async importByUrl(url): Promise<ParsedNovel> {
      return {
        sourceId: id,
        sourceName: name,
        sourceBaseUrl: baseUrl,
        url: url.toString(),
        title: 'Demo Novel',
        aliases: ['Demo Novel Alternative'],
        coverUrl: null,
        synopsis: 'Adapter parsing is wired; site-specific extraction will replace this demo parser.',
        chapters: [
          { title: 'Chapter 1', url: new URL('/chapter-1', baseUrl).toString(), index: 0 },
          { title: 'Chapter 2', url: new URL('/chapter-2', baseUrl).toString(), index: 1 }
        ],
        warnings: []
      };
    }
  };
}

export const adapters: SourceAdapter[] = [
  createDemoAdapter('noveltrust', 'NovelTrust', 'https://noveltrust.com/'),
  createDemoAdapter('novelhi', 'NovelHi', 'https://novelhi.com/'),
  createDemoAdapter('novelupdates', 'Novel Updates', 'https://www.novelupdates.com/'),
  createDemoAdapter('empirenovel', 'Empire Novel', 'https://www.empirenovel.com/')
];

export function findAdapter(url: URL) {
  return adapters.find((adapter) => adapter.matches(url));
}
