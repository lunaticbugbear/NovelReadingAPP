import * as cheerio from 'cheerio';
import type { ParsedChapter, ParsedNovel, SourceAdapter } from './types';

const sourceId = 'novelupdates';
const sourceName = 'Novel Updates';
const sourceBaseUrl = 'https://www.novelupdates.com/';
const titleWarning = 'Main title was not found. Try using an alternative title before saving.';

export function parseNovelUpdatesHtml(html: string, url: URL): ParsedNovel {
  const $ = cheerio.load(html);
  const title = firstText($, ['.seriestitlenu', '.series-title', 'h1']) ?? titleFromDocument($);
  const aliases = parseAliases($);
  const coverUrl = parseCoverUrl($, url);
  const synopsis = parseSynopsis($);
  const chapters = parseChapters($, url);
  const warnings = title ? [] : [titleWarning];

  return {
    sourceId,
    sourceName,
    sourceBaseUrl,
    url: url.toString(),
    title,
    aliases,
    coverUrl,
    synopsis,
    chapters,
    warnings
  };
}

export const novelUpdatesAdapter: SourceAdapter = {
  id: sourceId,
  name: sourceName,
  baseUrl: sourceBaseUrl,
  matches(url) {
    return url.hostname === 'www.novelupdates.com' || url.hostname === 'novelupdates.com';
  },
  async importByUrl(url) {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NovelShelf personal importer; contact: local-user'
      }
    });

    if (!response.ok) {
      throw new Error(`Novel Updates returned ${response.status}`);
    }

    return parseNovelUpdatesHtml(await response.text(), url);
  }
};

function firstText($: cheerio.CheerioAPI, selectors: string[]) {
  for (const selector of selectors) {
    const text = normalizeText($(selector).first().text());
    if (text) return text;
  }
  return null;
}

function titleFromDocument($: cheerio.CheerioAPI) {
  const title = normalizeText($('title').first().text().replace(/\s*-\s*Novel Updates\s*$/i, ''));
  return title || null;
}

function parseAliases($: cheerio.CheerioAPI) {
  const associated = $('#editassociated').next().clone();
  const aliasesContainer = associated.length ? associated : $('.seriesother').first().clone();
  aliasesContainer.find('br').replaceWith('\n');

  return unique(aliasesContainer.text().split(/\n|\r|\t|\s{2,}/).map(normalizeText).filter(Boolean));
}

function parseCoverUrl($: cheerio.CheerioAPI, pageUrl: URL) {
  const src = $('.seriesimg img').first().attr('src') ?? $('img').first().attr('src');
  return src ? new URL(src, pageUrl).toString() : null;
}

function parseSynopsis($: cheerio.CheerioAPI) {
  const description = $('#editdescription').next().text() || $('.seriesedit').first().text();
  return normalizeText(description);
}

function parseChapters($: cheerio.CheerioAPI, pageUrl: URL): ParsedChapter[] {
  const seen = new Set<string>();
  const chapters: ParsedChapter[] = [];

  $('a[href]').each((_, element) => {
    const title = normalizeText($(element).text());
    const href = $(element).attr('href');
    if (!title || !href) return;

    const absoluteUrl = new URL(href, pageUrl).toString();
    if (!isReleaseUrl(absoluteUrl) || seen.has(absoluteUrl)) return;

    seen.add(absoluteUrl);
    chapters.push({ title, url: absoluteUrl, index: chapters.length });
  });

  return chapters;
}

function isReleaseUrl(url: string) {
  return /^https:\/\/(www\.)?novelupdates\.com\/extnu\/\d+\/?$/i.test(url);
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function unique(values: string[]) {
  return [...new Set(values)];
}
