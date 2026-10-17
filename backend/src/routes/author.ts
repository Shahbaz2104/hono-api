import { Hono, type Context } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { count, desc, eq } from 'drizzle-orm';
import type { Database } from '../db/index.ts';
import { authorsTable, postsTable } from '../db/schema.ts';
import { UNIQUE_VIOLATION, FOREIGN_KEY_VIOLATION, dbErrorCode } from '../lib/db-errors.ts';

// --- ZOD SCHEMAS ---
const createAuthorSchema = z.object({
  name: z.string().min(2),
  email: z.string().trim().email(),
  age: z.coerce.number().min(18).optional().nullable(),
});

const updateAuthorSchema = createAuthorSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Update body must contain at least one field',
  });

const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  authorId: z.number(),
});

const updatePostSchema = createPostSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Update body must contain at least one field',
  });

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

function notFound(c: Context, message: string): Response {
  return c.json({ success: false, message }, 404);
}

export function createAuthorRoutes(db: Database) {
  const app = new Hono();

  // 1. GET ALL AUTHORS (paginated, with nested posts)
  app.get('/', zValidator('query', paginationSchema), async (c) => {
    const { page, limit } = c.req.valid('query');
    const offset = (page - 1) * limit;

    const [authors, [totalRow]] = await Promise.all([
      db.query.authorsTable.findMany({
        with: { posts: true },
        limit,
        offset,
      }),
      db.select({ value: count() }).from(authorsTable),
    ]);

    const total = totalRow?.value ?? 0;
    const items = authors.map(({ posts, ...author }) => ({
      ...author,
      posts: posts.map(({ id, title, content }) => ({ id, title, content })),
    }));

    return c.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  });

  // 2. GET AUTHOR STATS (server-side analytics)
  app.get('/stats', async (c) => {
    const [[authorCountRow], [postCountRow], topRows] = await Promise.all([
      db.select({ value: count() }).from(authorsTable),
      db.select({ value: count() }).from(postsTable),
      db
        .select({
          name: authorsTable.name,
          postCount: count(postsTable.id),
        })
        .from(authorsTable)
        .leftJoin(postsTable, eq(postsTable.authorId, authorsTable.id))
        .groupBy(authorsTable.id, authorsTable.name)
        .orderBy(desc(count(postsTable.id)))
        .limit(1),
    ]);

    const top = topRows[0];

    return c.json({
      totalAuthors: authorCountRow?.value ?? 0,
      totalPosts: postCountRow?.value ?? 0,
      topAuthor: top && top.postCount > 0 ? top : null,
    });
  });

  // 3. GET AUTHOR OPTIONS (lightweight list for dropdowns)
  app.get('/options', async (c) => {
    const options = await db
      .select({ id: authorsTable.id, name: authorsTable.name })
      .from(authorsTable)
      .orderBy(authorsTable.name);
    return c.json(options);
  });

  // 4. GET SINGLE AUTHOR (with posts)
  app.get('/:id', zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const author = await db.query.authorsTable.findFirst({
      where: eq(authorsTable.id, id),
      with: { posts: true },
    });
    if (!author) return notFound(c, 'Author not found');

    const { posts, ...rest } = author;
    return c.json({
      ...rest,
      posts: posts.map(({ id: postId, title, content }) => ({ id: postId, title, content })),
    });
  });

  // 5. POST NEW AUTHOR
  app.post('/', zValidator('json', createAuthorSchema), async (c) => {
    const validatedData = c.req.valid('json');
    try {
      const newAuthor = await db.insert(authorsTable).values(validatedData).returning();
      return c.json(newAuthor[0], 201);
    } catch (error) {
      if (dbErrorCode(error) === UNIQUE_VIOLATION) {
        return c.json({ success: false, message: 'Email address already registered' }, 400);
      }
      return c.json({ success: false, message: 'Database insertion failure' }, 500);
    }
  });

  // 6. UPDATE AUTHOR (Partial update)
  app.patch('/:id', zValidator('param', idParamSchema), zValidator('json', updateAuthorSchema), async (c) => {
    const { id } = c.req.valid('param');
    const validatedData = c.req.valid('json');
    try {
      const updatedAuthor = await db
        .update(authorsTable)
        .set(validatedData)
        .where(eq(authorsTable.id, id))
        .returning();

      if (updatedAuthor.length === 0) return notFound(c, 'Author not found');
      return c.json(updatedAuthor[0]);
    } catch (error) {
      if (dbErrorCode(error) === UNIQUE_VIOLATION) {
        return c.json({ success: false, message: 'Email address already registered' }, 400);
      }
      return c.json({ success: false, message: 'Database update failure' }, 500);
    }
  });

  // 7. POST NEW ARTICLE (Assigned to a specific Author)
  app.post('/post', zValidator('json', createPostSchema), async (c) => {
    const validatedData = c.req.valid('json');
    try {
      const newPost = await db.insert(postsTable).values(validatedData).returning();
      return c.json(newPost[0], 201);
    } catch (error) {
      if (dbErrorCode(error) === FOREIGN_KEY_VIOLATION) {
        return c.json({ success: false, message: 'Author does not exist' }, 400);
      }
      return c.json({ success: false, message: 'Database insertion failure' }, 500);
    }
  });

  // 8. UPDATE POST (Partial update)
  app.patch(
    '/post/:id',
    zValidator('param', idParamSchema),
    zValidator('json', updatePostSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const validatedData = c.req.valid('json');
      try {
        const updatedPost = await db
          .update(postsTable)
          .set(validatedData)
          .where(eq(postsTable.id, id))
          .returning();

        if (updatedPost.length === 0) return notFound(c, 'Post not found');
        return c.json(updatedPost[0]);
      } catch (error) {
        if (dbErrorCode(error) === FOREIGN_KEY_VIOLATION) {
          return c.json({ success: false, message: 'Author does not exist' }, 400);
        }
        return c.json({ success: false, message: 'Database update failure' }, 500);
      }
    },
  );

  // 9. DELETE POST
  app.delete('/post/:id', zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const deletedPost = await db.delete(postsTable).where(eq(postsTable.id, id)).returning();
    if (deletedPost.length === 0) return notFound(c, 'Post not found');

    return c.json({ success: true, message: 'Post deleted successfully' });
  });

  // 10. DELETE AN AUTHOR (Cascades to automatically drop their posts)
  app.delete('/:id', zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const deletedAuthor = await db.delete(authorsTable).where(eq(authorsTable.id, id)).returning();
    if (deletedAuthor.length === 0) return notFound(c, 'Author not found');

    return c.json({ success: true, message: 'Author and their articles wiped successfully' });
  });

  return app;
}
