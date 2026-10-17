import { describe, expect, it, beforeAll, beforeEach } from 'vitest';
import { createTestApp, resetDb, type TestContext } from './helpers.ts';

let ctx: TestContext;

beforeAll(async () => {
  ctx = await createTestApp();
});

beforeEach(async () => {
  await resetDb(ctx.db);
});

describe('POST /auth/register', () => {
  it('creates a user and returns their public profile', async () => {
    const res = await ctx.app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'new@example.com', password: 'password123' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ user: { id: expect.any(Number), email: 'new@example.com' } });
  });

  it('rejects duplicate emails with 409', async () => {
    const payload = { email: 'dup@example.com', password: 'password123' };
    await ctx.app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res = await ctx.app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(409);
  });

  it('rejects short passwords with 400', async () => {
    const res = await ctx.app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'x@example.com', password: 'short' }),
    });

    expect(res.status).toBe(400);
  });

  it('rejects invalid emails with 400', async () => {
    const res = await ctx.app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'password123' }),
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  it('returns a JWT for valid credentials', async () => {
    await ctx.app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'login@example.com', password: 'password123' }),
    });
    const res = await ctx.app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'login@example.com', password: 'password123' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.user).toEqual({ id: expect.any(Number), email: 'login@example.com' });
  });

  it('rejects wrong passwords with 401', async () => {
    await ctx.app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'login@example.com', password: 'password123' }),
    });
    const res = await ctx.app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'login@example.com', password: 'wrong-password' }),
    });

    expect(res.status).toBe(401);
  });

  it('rejects unknown users with 401', async () => {
    const res = await ctx.app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ghost@example.com', password: 'password123' }),
    });

    expect(res.status).toBe(401);
  });
});

describe('bearer auth middleware', () => {
  it('rejects requests without a token', async () => {
    const res = await ctx.app.request('/author');
    expect(res.status).toBe(401);
  });

  it('rejects garbage tokens', async () => {
    const res = await ctx.app.request('/author', {
      headers: { Authorization: 'Bearer not.a.token' },
    });
    expect(res.status).toBe(401);
  });

  it('rejects tokens signed with the wrong secret', async () => {
    const { SignJWT } = await import('jose');
    const badToken = await new SignJWT({ sub: '1', email: 'x@y.z' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode('another-secret-another-secret-9999'));
    const res = await ctx.app.request('/author', {
      headers: { Authorization: `Bearer ${badToken}` },
    });
    expect(res.status).toBe(401);
  });
});
