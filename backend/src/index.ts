import { serve } from '@hono/node-server';
import { createApp } from './app.ts';
import { createDb } from './db/index.ts';
import { loadEnv } from './env.ts';

const env = loadEnv();
const app = createApp(createDb(env.DATABASE_URL));

serve({ fetch: app.fetch, port: env.PORT });
