export type LibraryStatus = 'Reading' | 'Plan to Read' | 'Completed';
export type SourceHealth = 'Working' | 'Partial' | 'Broken' | 'Generic' | 'Disabled';
export type CapabilityLevel = boolean | 'partial';

export interface SourceCapabilities {
  importByUrl: boolean;
  siteSearch: false;
  cover: CapabilityLevel;
  aliases: CapabilityLevel;
  download: CapabilityLevel;
}

export interface SourceEntry {
  id: string;
  name: string;
  baseUrl: string;
  kind: 'built-in' | 'custom';
  enabled: boolean;
  health: SourceHealth;
  capabilities: SourceCapabilities;
}

export interface ChapterEntry {
  id: string;
  title: string;
  url: string;
  index: number;
  downloadedAt: number | null;
  content?: string;
}

export interface NovelEntry {
  id: string;
  sourceId: string;
  sourceNovelUrl: string;
  title: string;
  aliases: string[];
  synopsis: string;
  coverUrl: string | null;
  status: LibraryStatus;
  chapters: ChapterEntry[];
  progress: { chapterId: string | null; position: number; updatedAt: number };
  updatedAt: number;
}
