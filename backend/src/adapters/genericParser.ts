import type { ParsedNovel } from './types';

export async function genericImport(url: URL): Promise<ParsedNovel> {
  return {
    sourceId: 'generic',
    sourceName: url.hostname,
    sourceBaseUrl: `${url.protocol}//${url.hostname}/`,
    url: url.toString(),
    title: null,
    aliases: [],
    coverUrl: null,
    synopsis: '',
    chapters: [],
    warnings: [
      'This source is unsupported. Generic parsing may fail or import messy chapters.',
      'Main title was not found. Try using an alternative title before saving.'
    ]
  };
}
