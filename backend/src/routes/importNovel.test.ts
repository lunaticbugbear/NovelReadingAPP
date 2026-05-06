import { describe, expect, it } from 'vitest';
import { buildServer } from '../server';

describe('POST /api/import-novel', () => {
  it('imports a supported source URL with adapter metadata', async () => {
    const app = buildServer();
    const response = await app.inject({
      method: 'POST',
      url: '/api/import-novel',
      payload: { url: 'https://novelhi.com/novel/demo-novel' }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      sourceId: 'novelhi',
      title: 'Demo Novel',
      aliases: ['Demo Novel Alternative'],
      warnings: []
    });
  });

  it('warns when generic parsing is used', async () => {
    const app = buildServer();
    const response = await app.inject({
      method: 'POST',
      url: '/api/import-novel',
      payload: { url: 'https://example.com/novel/demo' }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().warnings).toContain('This source is unsupported. Generic parsing may fail or import messy chapters.');
  });
});
