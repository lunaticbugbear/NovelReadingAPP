import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { genericImport } from '../adapters/genericParser';
import { findAdapter } from '../adapters/registry';

const ImportNovelRequest = z.object({ url: z.string().url() });
const TITLE_WARNING = 'Main title was not found. Try using an alternative title before saving.';

export async function registerImportNovelRoute(app: FastifyInstance) {
  app.post('/api/import-novel', async (request, reply) => {
    const parsed = ImportNovelRequest.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'A valid novel URL is required.' });
    }

    const url = new URL(parsed.data.url);
    const adapter = findAdapter(url);
    const result = adapter ? await adapter.importByUrl(url) : await genericImport(url);

    if (!result.title && !result.warnings.includes(TITLE_WARNING)) {
      result.warnings.push(TITLE_WARNING);
    }

    return result;
  });
}
