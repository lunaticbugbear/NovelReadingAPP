export interface ParsedChapter {
  title: string;
  url: string;
  index: number;
}

export interface ParsedNovel {
  sourceId: string;
  sourceName: string;
  sourceBaseUrl: string;
  url: string;
  title: string | null;
  aliases: string[];
  coverUrl: string | null;
  synopsis: string;
  chapters: ParsedChapter[];
  warnings: string[];
}

export interface SourceAdapter {
  id: string;
  name: string;
  baseUrl: string;
  matches(url: URL): boolean;
  importByUrl(url: URL): Promise<ParsedNovel>;
}
