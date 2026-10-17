import { describe, expect, it, beforeAll, beforeEach } from 'vitest';
import {
  authedJson,
  createAuthorViaApi,
  createTestApp,
  registerAndLogin,
  resetDb,
  type TestContext,
} from './helpers.ts';

let ctx: TestContext;
let token: string;

beforeAll(async () => {
  ctx = await createTestApp();
  token = await registerAndLogin(ctx.app);
});

beforeEach(async () => {
  await resetDb(ctx.db);
});

describe('GET /author (pagination)', () => {
  it('returns a paginated envelope', async () => {
    await createAuthorViaApi(ctx.app, token);

    const res = await ctx.app.request(authedJson(token, 'GET', '/author?page=1&limit=10'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      items: expect.any(Array),
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
    expect(body.items[0]).toMatchObject({
      name: 'Ada Lovelace',
      posts: [],
    });
  });

  it('pages through authors correctly', async () => {
    for (let i = 0; i < 5; i++) {
      await createAuthorViaApi(ctx.app, token, { name: `Author ${i}` });
    }

    const page1 = await (
      await ctx.app.request(authedJson(token, 'GET', '/author?page=1&limit=2'))
    ).json();
    const page3 = await (
      await ctx.app.request(authedJson(token, 'GET', '/author?page=3&limit=2'))
    ).json();

    expect(page1.total).toBe(5);
    expect(page1.totalPages).toBe(3);
    expect(page1.items).toHaveLength(2);
    expect(page3.items).toHaveLength(1);
    expect(page3.page).toBe(3);
  });

  it('caps limit at 100', async () => {
    const res = await ctx.app.request(authedJson(token, 'GET', '/author?limit=500'));
    expect(res.status).toBe(400);
  });

  it('rejects page=0', async () => {
    const res = await ctx.app.request(authedJson(token, 'GET', '/author?page=0'));
    expect(res.status).toBe(400);
  });
});

describe('GET /author/stats', () => {
  it('computes totals and top author server-side', async () => {
    const author = await createAuthorViaApi(ctx.app, token);
    for (let i = 0; i < 3; i++) {
      await ctx.app.request(
        authedJson(token, 'POST', '/author/post', {
          title: `Post ${i}`,
          content: `Content number ${i}`,
          authorId: author.id,
        }),
      );
    }
    await createAuthorViaApi(ctx.app, token, { name: 'Quiet Author' });

    const res = await ctx.app.request(authedJson(token, 'GET', '/author/stats'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totalAuthors).toBe(2);
    expect(body.totalPosts).toBe(3);
    expect(body.topAuthor).toEqual({ name: 'Ada Lovelace', postCount: 3 });
  });

  it('returns null topAuthor when no posts exist', async () => {
    const res = await ctx.app.request(authedJson(token, 'GET', '/author/stats'));
    const body = await res.json();
    expect(body).toEqual({ totalAuthors: 0, totalPosts: 0, topAuthor: null });
  });
});

describe('GET /author/options', () => {
  it('returns lightweight id/name pairs ordered by name', async () => {
    await createAuthorViaApi(ctx.app, token, { name: 'Zoe' });
    await createAuthorViaApi(ctx.app, token, { name: 'Ann' });

    const res = await ctx.app.request(authedJson(token, 'GET', '/author/options'));
    const body = await res.json();
    expect(body).toEqual([
      { id: expect.any(Number), name: 'Ann' },
      { id: expect.any(Number), name: 'Zoe' },
    ]);
  });
});

describe('GET /author/:id', () => {
  it('returns a single author with posts', async () => {
    const author = await createAuthorViaApi(ctx.app, token);
    await ctx.app.request(
      authedJson(token, 'POST', '/author/post', {
        title: 'Hello',
        content: 'World content',
        authorId: author.id,
      }),
    );

    const res = await ctx.app.request(authedJson(token, 'GET', `/author/${author.id}`));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('Ada Lovelace');
    expect(body.posts).toHaveLength(1);
    expect(body.posts[0]).toEqual({
      id: expect.any(Number),
      title: 'Hello',
      content: 'World content',
    });
  });

  it('404s for missing authors', async () => {
    const res = await ctx.app.request(authedJson(token, 'GET', '/author/9999'));
    expect(res.status).toBe(404);
  });

  it('400s for non-numeric ids', async () => {
    const res = await ctx.app.request(authedJson(token, 'GET', '/author/abc'));
    expect(res.status).toBe(400);
  });
});

describe('POST /author', () => {
  it('rejects duplicate emails with 400', async () => {
    const author = await createAuthorViaApi(ctx.app, token, { email: 'taken@example.com' });
    expect(author.id).toEqual(expect.any(Number));

    const res = await ctx.app.request(
      authedJson(token, 'POST', '/author', { name: 'Impostor', email: 'taken@example.com' }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/already registered/i);
  });

  it('validates name length', async () => {
    const res = await ctx.app.request(
      authedJson(token, 'POST', '/author', { name: 'A', email: 'a@b.co' }),
    );
    expect(res.status).toBe(400);
  });
});

describe('PATCH /author/:id', () => {
  it('partially updates an author', async () => {
    const author = await createAuthorViaApi(ctx.app, token);
    const res = await ctx.app.request(
      authedJson(token, 'PATCH', `/author/${author.id}`, { name: 'Ada King' }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).name).toBe('Ada King');
  });

  it('rejects empty update bodies', async () => {
    const author = await createAuthorViaApi(ctx.app, token);
    const res = await ctx.app.request(authedJson(token, 'PATCH', `/author/${author.id}`, {}));
    expect(res.status).toBe(400);
  });

  it('404s for missing authors', async () => {
    const res = await ctx.app.request(authedJson(token, 'PATCH', '/author/9999', { name: 'Ghost' }));
    expect(res.status).toBe(404);
  });
});

describe('POST /author/post', () => {
  it('creates a post linked to an author', async () => {
    const author = await createAuthorViaApi(ctx.app, token);
    const res = await ctx.app.request(
      authedJson(token, 'POST', '/author/post', {
        title: 'My Article',
        content: 'Some long content',
        authorId: author.id,
      }),
    );
    expect(res.status).toBe(201);
    expect((await res.json()).authorId).toBe(author.id);
  });

  it('rejects unknown authors with 400', async () => {
    const res = await ctx.app.request(
      authedJson(token, 'POST', '/author/post', {
        title: 'Orphan',
        content: 'No parent here',
        authorId: 9999,
      }),
    );
    expect(res.status).toBe(400);
  });
});

describe('PATCH /author/post/:id', () => {
  it('updates a post and rejects empty bodies', async () => {
    const author = await createAuthorViaApi(ctx.app, token);
    const created = await (
      await ctx.app.request(
        authedJson(token, 'POST', '/author/post', {
          title: 'Draft',
          content: 'Draft content',
          authorId: author.id,
        }),
      )
    ).json();

    const updated = await ctx.app.request(
      authedJson(token, 'PATCH', `/author/post/${created.id}`, { title: 'Published' }),
    );
    expect(updated.status).toBe(200);
    expect((await updated.json()).title).toBe('Published');

    const empty = await ctx.app.request(authedJson(token, 'PATCH', `/author/post/${created.id}`, {}));
    expect(empty.status).toBe(400);
  });
});

describe('DELETE /author/post/:id', () => {
  it('deletes a single post', async () => {
    const author = await createAuthorViaApi(ctx.app, token);
    const post = await (
      await ctx.app.request(
        authedJson(token, 'POST', '/author/post', {
          title: 'Doomed',
          content: 'Will be deleted',
          authorId: author.id,
        }),
      )
    ).json();

    const res = await ctx.app.request(authedJson(token, 'DELETE', `/author/post/${post.id}`));
    expect(res.status).toBe(200);

    const authorRes = await ctx.app.request(authedJson(token, 'GET', `/author/${author.id}`));
    expect((await authorRes.json()).posts).toHaveLength(0);
  });

  it('404s for missing posts', async () => {
    const res = await ctx.app.request(authedJson(token, 'DELETE', '/author/post/9999'));
    expect(res.status).toBe(404);
  });
});

describe('DELETE /author/:id (cascade)', () => {
  it('removes the author and all their posts', async () => {
    const author = await createAuthorViaApi(ctx.app, token);
    for (let i = 0; i < 2; i++) {
      await ctx.app.request(
        authedJson(token, 'POST', '/author/post', {
          title: `Post ${i}`,
          content: `Content ${i}`,
          authorId: author.id,
        }),
      );
    }

    const res = await ctx.app.request(authedJson(token, 'DELETE', `/author/${author.id}`));
    expect(res.status).toBe(200);

    const gone = await ctx.app.request(authedJson(token, 'GET', `/author/${author.id}`));
    expect(gone.status).toBe(404);

    const stats = await (await ctx.app.request(authedJson(token, 'GET', '/author/stats'))).json();
    expect(stats.totalPosts).toBe(0);
  });

  it('404s for missing authors', async () => {
    const res = await ctx.app.request(authedJson(token, 'DELETE', '/author/9999'));
    expect(res.status).toBe(404);
  });
});
