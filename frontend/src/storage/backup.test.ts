import { describe, expect, it } from 'vitest';
import { parseBackup, serializeBackup } from './backup';

describe('backup', () => {
  it('round-trips readable JSON backup data', () => {
    const json = serializeBackup({ sources: [], novels: [], exportedAt: 1 });
    expect(parseBackup(json)).toEqual({ sources: [], novels: [], exportedAt: 1 });
  });
});
