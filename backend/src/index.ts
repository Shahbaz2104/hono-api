import { serve } from '@hono/node-server';
import { createApp } from './app.ts';
import { createDb } from './db/index.ts';
import { loadEnv } from './env.ts';

const env = loadEnv();
const app = createApp(createDb(env.DATABASE_URL), {
  jwtSecret: env.JWT_SECRET,
  clientOrigin: env.CLIENT_ORIGIN,
});

serve({ fetch: app.fetch, port: env.PORT });
