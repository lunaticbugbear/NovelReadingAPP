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
});
