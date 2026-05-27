// routes/author.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db/index.ts';               // 1. Import DB client
import { authorsTable } from '../db/schema.ts';
import { eq } from 'drizzle-orm'; // 2. Import DB Schema

const app = new Hono();

const createAuthorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18).optional()
});

// ROUTE 1: GET all authors from the database
app.get('/', async (c) => {
  const allAuthors = await db.select().from(authorsTable);
  return c.json(allAuthors);
});

// ROUTE 2: POST to validate and insert a new author
app.post('/', zValidator('json', createAuthorSchema), async (c) => {
  const validatedData = c.req.valid('json');

  // 3. Use Drizzle to insert the validated data into your table
  const newAuthor = await db.insert(authorsTable).values({
    name: validatedData.name,
    email: validatedData.email,
    age: validatedData.age,
  }).returning(); // .returning() yields the newly created row with its generated ID

  return c.json({
    success: true,
    data: newAuthor[0]
  }, 201);
});



// ROUTE 3: DELETE an author by ID
app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  
  if (isNaN(id)) {
    return c.json({ success: false, message: "Invalid ID format" }, 400);
  }

  // Use Drizzle to delete the row matching the ID
  const deletedAuthor = await db.delete(authorsTable)
    .where(eq(authorsTable.id, id)) // Make sure you import 'eq' from 'drizzle-orm' at the top!
    .returning();

  if (deletedAuthor.length === 0) {
    return c.json({ success: false, message: "Author not found" }, 404);
  }

  return c.json({ success: true, message: "Author deleted successfully" });
});




export default app;