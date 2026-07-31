import { Hono, type Context } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import type { Database } from '../db/index.ts';
import { authorsTable, postsTable } from '../db/schema.ts';

// --- ZOD SCHEMAS ---
const createAuthorSchema = z.object({
  name: z.string().min(2),
  email: z.string().trim().email(),
  age: z.coerce.number().min(18).optional().nullable()
});

const updateAuthorSchema = createAuthorSchema.partial();

const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  authorId: z.number()
});

const updatePostSchema = createPostSchema.partial();

function notFound(c: Context, message: string): Response {
  return c.json({ success: false, message }, 404);
}

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

function dbErrorCode(error: unknown): string | undefined {
  let current: unknown = error;
  while (typeof current === 'object' && current !== null) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === 'string') return code;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

export function createAuthorRoutes(db: Database) {
  const app = new Hono();

  // 1. GET ALL AUTHORS (With their nested posts!)
  app.get('/', async (c) => {
    const authors = await db.query.authorsTable.findMany({
      with: { posts: true },
    });

    const result = authors.map(({ posts, ...author }) => ({
      ...author,
      posts: posts.map(({ id, title, content }) => ({ id, title, content })),
    }));

    return c.json(result);
  });

  // 2. POST NEW AUTHOR
  app.post('/', zValidator('json', createAuthorSchema), async (c) => {
    const validatedData = c.req.valid('json');
    try {
      const newAuthor = await db.insert(authorsTable).values(validatedData).returning();
      return c.json(newAuthor[0], 201);
    } catch (error) {
      if (dbErrorCode(error) === UNIQUE_VIOLATION) {
        return c.json({ success: false, message: "Email address already registered" }, 400);
      }
      return c.json({ success: false, message: "Database insertion failure" }, 500);
    }
  });

  // 3. UPDATE AUTHOR (Partial update)
  app.patch('/:id', zValidator('json', updateAuthorSchema), async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ success: false, message: "Invalid ID format" }, 400);

    const validatedData = c.req.valid('json');
    try {
      const updatedAuthor = await db
        .update(authorsTable)
        .set(validatedData)
        .where(eq(authorsTable.id, id))
        .returning();

      if (updatedAuthor.length === 0) return notFound(c, "Author not found");
      return c.json(updatedAuthor[0]);
    } catch (error) {
      if (dbErrorCode(error) === UNIQUE_VIOLATION) {
        return c.json({ success: false, message: "Email address already registered" }, 400);
      }
      return c.json({ success: false, message: "Database update failure" }, 500);
    }
  });

  // 4. POST NEW ARTICLE (Assigned to a specific Author)
  app.post('/post', zValidator('json', createPostSchema), async (c) => {
    const validatedData = c.req.valid('json');
    try {
      const newPost = await db.insert(postsTable).values(validatedData).returning();
      return c.json(newPost[0], 201);
    } catch (error) {
      if (dbErrorCode(error) === FOREIGN_KEY_VIOLATION) {
        return c.json({ success: false, message: "Author does not exist" }, 400);
      }
      return c.json({ success: false, message: "Database insertion failure" }, 500);
    }
  });

  // 5. UPDATE POST (Partial update)
  app.patch('/post/:id', zValidator('json', updatePostSchema), async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ success: false, message: "Invalid ID format" }, 400);

    const validatedData = c.req.valid('json');
    try {
      const updatedPost = await db
        .update(postsTable)
        .set(validatedData)
        .where(eq(postsTable.id, id))
        .returning();

      if (updatedPost.length === 0) return notFound(c, "Post not found");
      return c.json(updatedPost[0]);
    } catch (error) {
      if (dbErrorCode(error) === FOREIGN_KEY_VIOLATION) {
        return c.json({ success: false, message: "Author does not exist" }, 400);
      }
      return c.json({ success: false, message: "Database update failure" }, 500);
    }
  });

  // 6. DELETE AN AUTHOR (Cascades to automatically drop their posts)
  app.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ success: false, message: "Invalid ID format" }, 400);

    const deletedAuthor = await db.delete(authorsTable).where(eq(authorsTable.id, id)).returning();
    if (deletedAuthor.length === 0) return notFound(c, "Author not found");

    return c.json({ success: true, message: "Author and their articles wiped successfully" });
  });

  return app;
}
