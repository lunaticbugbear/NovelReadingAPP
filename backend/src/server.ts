import Fastify from 'fastify';
import { registerImportNovelRoute } from './routes/importNovel';

export function buildServer() {
  const app = Fastify({ logger: true });
  app.get('/health', async () => ({ ok: true }));
  app.register(registerImportNovelRoute);
  return app;
}

if (process.argv[1]?.endsWith('server.ts')) {
  const app = buildServer();
  await app.listen({ host: '127.0.0.1', port: 8787 });
}
