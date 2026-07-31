import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import type { Database } from './db/index.ts';
import { createAuthorRoutes } from './routes/author.ts';

export function createApp(db: Database) {
  const app = new Hono();

  app.use('*', logger());
  app.use('*', cors());

  app.route('/author', createAuthorRoutes(db));

  app.get('/', (c) => c.text('Welcome to the Hono API!'));

  return app;
}
