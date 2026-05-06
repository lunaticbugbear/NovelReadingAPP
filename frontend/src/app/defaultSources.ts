import type { SourceEntry } from '../domain/models';

export const defaultSources: SourceEntry[] = [
  { id: 'noveltrust', name: 'NovelTrust', baseUrl: 'https://noveltrust.com/', kind: 'built-in', enabled: true, health: 'Working', capabilities: { importByUrl: true, siteSearch: false, cover: 'partial', aliases: 'partial', download: true } },
  { id: 'novelhi', name: 'NovelHi', baseUrl: 'https://novelhi.com/', kind: 'built-in', enabled: true, health: 'Working', capabilities: { importByUrl: true, siteSearch: false, cover: 'partial', aliases: 'partial', download: true } },
  { id: 'novelupdates', name: 'Novel Updates', baseUrl: 'https://www.novelupdates.com/', kind: 'built-in', enabled: true, health: 'Partial', capabilities: { importByUrl: true, siteSearch: false, cover: 'partial', aliases: 'partial', download: 'partial' } },
  { id: 'empirenovel', name: 'Empire Novel', baseUrl: 'https://www.empirenovel.com/', kind: 'built-in', enabled: true, health: 'Working', capabilities: { importByUrl: true, siteSearch: false, cover: 'partial', aliases: 'partial', download: true } }
];
