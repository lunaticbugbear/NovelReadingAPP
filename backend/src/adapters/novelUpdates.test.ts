import { describe, expect, it } from 'vitest';
import { novelUpdatesAdapter, parseNovelUpdatesHtml } from './novelUpdates';

const novelUrl = new URL('https://www.novelupdates.com/series/demo-novel/');

const fixtureHtml = `
<html>
  <head><title>Demo Novel - Novel Updates</title></head>
  <body>
    <div class="seriestitlenu">Demo Novel</div>
    <div class="seriesimg"><img src="/covers/demo.jpg" /></div>
    <div id="editassociated">Associated Names</div>
    <div class="seriesother">Demo Novel Alternative<br>Second Demo Name</div>
    <div id="editdescription">Description</div>
    <div class="seriesedit">A quiet novel about testing parsers.</div>
    <a href="https://www.novelupdates.com/extnu/123456/">Chapter 1: A Start</a>
    <a href="/extnu/123457/">Chapter 2: Next Step</a>
    <a href="https://example.com/not-a-release">Ignore me</a>
  </body>
</html>`;

describe('Novel Updates adapter', () => {
  it('parses Novel Updates series metadata and release links from HTML', () => {
    const parsed = parseNovelUpdatesHtml(fixtureHtml, novelUrl);

    expect(parsed).toEqual({
      sourceId: 'novelupdates',
      sourceName: 'Novel Updates',
      sourceBaseUrl: 'https://www.novelupdates.com/',
      url: novelUrl.toString(),
      title: 'Demo Novel',
      aliases: ['Demo Novel Alternative', 'Second Demo Name'],
      coverUrl: 'https://www.novelupdates.com/covers/demo.jpg',
      synopsis: 'A quiet novel about testing parsers.',
      chapters: [
        { title: 'Chapter 1: A Start', url: 'https://www.novelupdates.com/extnu/123456/', index: 0 },
        { title: 'Chapter 2: Next Step', url: 'https://www.novelupdates.com/extnu/123457/', index: 1 }
      ],
      warnings: []
    });
  });

  it('returns null title and a warning when the main title is missing', () => {
    const parsed = parseNovelUpdatesHtml('<html><body><p>No title here</p></body></html>', novelUrl);

    expect(parsed.title).toBeNull();
    expect(parsed.warnings).toContain('Main title was not found. Try using an alternative title before saving.');
  });

  it('matches Novel Updates URLs only', () => {
    expect(novelUpdatesAdapter.matches(new URL('https://www.novelupdates.com/series/demo-novel/'))).toBe(true);
    expect(novelUpdatesAdapter.matches(new URL('https://novelupdates.com/series/demo-novel/'))).toBe(true);
    expect(novelUpdatesAdapter.matches(new URL('https://example.com/series/demo-novel/'))).toBe(false);
  });
});
