import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { fileURLToPath } from 'node:url';
import type { Hono } from 'hono';
import { createApp } from '../app.ts';
import * as schema from '../db/schema.ts';
import { authorsTable, postsTable, usersTable } from '../db/schema.ts';
import type { Database } from '../db/index.ts';

export const TEST_JWT_SECRET = 'test-secret-test-secret-test-secret-1234';

export interface TestContext {
  app: Hono;
  db: Database;
}

export async function createTestApp(): Promise<TestContext> {
  const client = new PGlite();
  const db = drizzle(client, { schema }) as unknown as Database;
  await migrate(db, {
    migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)),
  });
  const app = createApp(db, {
    jwtSecret: TEST_JWT_SECRET,
    clientOrigin: 'http://localhost:5173',
  });
  return { app, db };
}

export async function resetDb(db: Database): Promise<void> {
  await db.delete(postsTable);
  await db.delete(authorsTable);
  await db.delete(usersTable);
}

export async function registerAndLogin(
  app: Hono,
  email = 'tester@example.com',
  password = 'password123',
): Promise<string> {
  const registerRes = await app.request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (registerRes.status !== 201) {
    throw new Error(`Test registration failed: ${registerRes.status}`);
  }
  const loginRes = await app.request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = (await loginRes.json()) as { token: string };
  return body.token;
}

export function authedJson(token: string, method: string, path: string, body?: unknown): Request {
  return new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function createAuthorViaApi(
  app: Hono,
  token: string,
  overrides: Partial<{ name: string; email: string; age: number }> = {},
) {
  const res = await app.request(
    authedJson(token, 'POST', '/author', {
      name: overrides.name ?? 'Ada Lovelace',
      email: overrides.email ?? `ada-${Math.random().toString(36).slice(2)}@example.com`,
      age: overrides.age ?? 30,
    }),
  );
  if (res.status !== 201) throw new Error(`Test author creation failed: ${res.status}`);
  return (await res.json()) as { id: number; name: string; email: string };
}
