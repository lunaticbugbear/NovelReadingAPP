import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FirstRunSetup } from './FirstRunSetup';

afterEach(() => cleanup());

describe('FirstRunSetup', () => {
  it('lets the user choose default sources', async () => {
    const onComplete = vi.fn();
    render(<FirstRunSetup onComplete={onComplete} />);
    await userEvent.click(screen.getByRole('button', { name: /use default sources/i }));
    expect(onComplete).toHaveBeenCalledWith('defaults');
  });

  it('lets the user start empty', async () => {
    const onComplete = vi.fn();
    render(<FirstRunSetup onComplete={onComplete} />);
    await userEvent.click(screen.getByRole('button', { name: /start empty/i }));
    expect(onComplete).toHaveBeenCalledWith('empty');
  });
});
