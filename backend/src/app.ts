import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import type { Database } from './db/index.ts';
import { createAuthorRoutes } from './routes/author.ts';
import { createAuthRoutes } from './routes/auth.ts';
import { bearerAuth } from './middleware/auth.ts';

export interface AppConfig {
  jwtSecret: string;
  clientOrigin: string;
}

export function createApp(db: Database, config: AppConfig) {
  const app = new Hono();

  app.use('*', logger());
  app.use('*', cors({ origin: config.clientOrigin }));

  app.get('/', (c) => c.text('Welcome to the Hono API!'));

  app.route('/auth', createAuthRoutes(db, config.jwtSecret));

  app.use('/author/*', bearerAuth(config.jwtSecret));
  app.use('/author', bearerAuth(config.jwtSecret));
  app.route('/author', createAuthorRoutes(db));

  return app;
}
