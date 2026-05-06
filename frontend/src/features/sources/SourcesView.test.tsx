import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SourcesView } from './SourcesView';

afterEach(() => cleanup());

describe('SourcesView', () => {
  it('warns users before importing unsupported generic sources', async () => {
    const importNovel = vi.fn().mockResolvedValue({ title: null, aliases: [], warnings: ['This source is unsupported. Generic parsing may fail or import messy chapters.'], chapters: [] });
    render(<SourcesView importNovel={importNovel} />);
    await userEvent.type(screen.getByLabelText(/novel url/i), 'https://example.com/novel/demo');
    await userEvent.click(screen.getByRole('button', { name: /import novel/i }));
    expect(await screen.findByText(/generic parsing may fail/i)).toBeInTheDocument();
  });

  it('saves edited imported metadata to the library', async () => {
    const importNovel = vi.fn().mockResolvedValue({
      sourceId: 'novelupdates',
      sourceName: 'Novel Updates',
      sourceBaseUrl: 'https://www.novelupdates.com/',
      url: 'https://www.novelupdates.com/series/demo-novel/',
      title: 'Demo Novel',
      aliases: ['Original Alias'],
      coverUrl: null,
      synopsis: 'A parsed synopsis.',
      chapters: [{ title: 'Chapter 1', url: 'https://www.novelupdates.com/extnu/1/', index: 0 }],
      warnings: []
    });
    const saveNovel = vi.fn().mockResolvedValue(undefined);

    render(<SourcesView importNovel={importNovel} saveNovel={saveNovel} now={() => 123} />);
    await userEvent.type(screen.getByLabelText(/novel url/i), 'https://www.novelupdates.com/series/demo-novel/');
    await userEvent.click(screen.getByRole('button', { name: /import novel/i }));
    await userEvent.clear(await screen.findByLabelText(/^title$/i));
    await userEvent.type(screen.getByLabelText(/^title$/i), 'Edited Demo Novel');
    await userEvent.clear(screen.getByLabelText(/aliases/i));
    await userEvent.type(screen.getByLabelText(/aliases/i), 'Original Alias, Second Alias');
    await userEvent.selectOptions(screen.getByLabelText(/status/i), 'Reading');
    await userEvent.click(screen.getByRole('button', { name: /save to library/i }));

    expect(saveNovel).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Edited Demo Novel',
      aliases: ['Original Alias', 'Second Alias'],
      status: 'Reading',
      chapters: [expect.objectContaining({ title: 'Chapter 1', downloadedAt: null })],
      updatedAt: 123
    }));
    expect(await screen.findByText(/saved to library/i)).toBeInTheDocument();
  });
});
