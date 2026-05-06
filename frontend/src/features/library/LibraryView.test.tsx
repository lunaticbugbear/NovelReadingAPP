import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { NovelEntry } from '../../domain/models';
import { LibraryView } from './LibraryView';

afterEach(() => cleanup());

const novel: NovelEntry = {
  id: 'novel-1',
  sourceId: 'novelupdates',
  sourceNovelUrl: 'https://www.novelupdates.com/series/demo-novel/',
  title: 'Demo Novel',
  aliases: ['Demo Alias'],
  synopsis: 'A parsed synopsis.',
  coverUrl: null,
  status: 'Reading',
  chapters: [
    { id: 'chapter-1', title: 'Chapter 1', url: 'https://www.novelupdates.com/extnu/1/', index: 0, downloadedAt: null },
    { id: 'chapter-2', title: 'Chapter 2', url: 'https://www.novelupdates.com/extnu/2/', index: 1, downloadedAt: null }
  ],
  progress: { chapterId: null, position: 0, updatedAt: 123 },
  updatedAt: 123
};

describe('LibraryView', () => {
  it('shows an empty library message', async () => {
    render(<LibraryView listNovels={async () => []} />);

    expect(await screen.findByText(/your imported novels will appear here/i)).toBeInTheDocument();
  });

  it('renders saved novels from local storage', async () => {
    render(<LibraryView listNovels={async () => [novel]} />);

    expect(await screen.findByText('Demo Novel')).toBeInTheDocument();
    expect(screen.getAllByText('Reading')).toHaveLength(2);
    expect(screen.getByText(/Demo Alias/)).toBeInTheDocument();
    expect(screen.getByText(/2 chapters/)).toBeInTheDocument();
  });
});
