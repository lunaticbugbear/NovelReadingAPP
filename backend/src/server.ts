import Fastify from 'fastify';

export function buildServer() {
  const app = Fastify({ logger: true });
  app.get('/health', async () => ({ ok: true }));
  return app;
}

if (process.argv[1]?.endsWith('server.ts')) {
  const app = buildServer();
  await app.listen({ host: '127.0.0.1', port: 8787 });
}
