import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'sqlite.db', // <-- If your database file has a different name (e.g. local.db), change it here!
  },
});