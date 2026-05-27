import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { authorsTable, postsTable } from '../db/schema.ts';

const app = new Hono();

// --- ZOD SCHEMAS ---
const createAuthorSchema = z.object({
  name: z.string().min(2),
  email: z.string().trim().email(),
  age: z.coerce.number().min(18).optional().nullable()
});

const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  authorId: z.number()
});

// --- ROUTES ---

// 1. GET ALL AUTHORS (With their nested posts!)
app.get('/', async (c) => {
  // Query using a SQL Left Join to grab everything at once
  const rows = await db
    .select({
      author: authorsTable,
      post: postsTable,
    })
    .from(authorsTable)
    .leftJoin(postsTable, eq(authorsTable.id, postsTable.authorId));

  // Reduce flat rows into a clean, nested JSON structure
  const result = rows.reduce<Record<number, any>>((acc, row) => {
    const author = row.author;
    const post = row.post;

    if (!acc[author.id]) {
      acc[author.id] = { ...author, posts: [] };
    }

    if (post) {
      acc[author.id].posts.push({
        id: post.id,
        title: post.title,
        content: post.content
      });
    }

    return acc;
  }, {});

  return c.json(Object.values(result));
});

// 2. POST NEW AUTHOR
app.post('/', zValidator('json', createAuthorSchema), async (c) => {
  const validatedData = c.req.valid('json');
  try {
    const newAuthor = await db.insert(authorsTable).values(validatedData).returning();
    return c.json(newAuthor[0], 201);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return c.json({ success: false, message: "Email address already registered" }, 400);
    }
    return c.json({ success: false, message: "Database insertion failure" }, 500);
  }
});

// 3. POST NEW ARTICLE (Assigned to a specific Author)
app.post('/post', zValidator('json', createPostSchema), async (c) => {
  const validatedData = c.req.valid('json');
  const newPost = await db.insert(postsTable).values(validatedData).returning();
  return c.json(newPost[0], 201);
});

// 4. DELETE AN AUTHOR (Cascades to automatically drop their posts)
app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ success: false, message: "Invalid ID format" }, 400);

  const deletedAuthor = await db.delete(authorsTable).where(eq(authorsTable.id, id)).returning();
  if (deletedAuthor.length === 0) return c.json({ success: false, message: "Author not found" }, 404);

  return c.json({ success: true, message: "Author and their articles wiped successfully" });
});

export default app;