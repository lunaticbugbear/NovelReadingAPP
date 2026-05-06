import { describe, expect, it } from 'vitest';
import { paginateText } from './reader';

describe('paginateText', () => {
  it('splits text into readable pages', () => {
    expect(paginateText('one two three four five six', 11)).toEqual(['one two', 'three four', 'five six']);
  });
});
