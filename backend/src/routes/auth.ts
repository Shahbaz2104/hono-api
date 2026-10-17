import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import type { Database } from '../db/index.ts';
import { usersTable } from '../db/schema.ts';
import { UNIQUE_VIOLATION, dbErrorCode } from '../lib/db-errors.ts';

const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = registerSchema;

const JWT_EXPIRES_IN = '7d';

export function createAuthRoutes(db: Database, jwtSecret: string): Hono {
  const app = new Hono();
  const secret = new TextEncoder().encode(jwtSecret);

  app.post('/register', zValidator('json', registerSchema), async (c) => {
    const { email, password } = c.req.valid('json');
    const passwordHash = await bcrypt.hash(password, 10);
    try {
      const [user] = await db
        .insert(usersTable)
        .values({ email, passwordHash })
        .returning({ id: usersTable.id, email: usersTable.email });
      return c.json({ user }, 201);
    } catch (error) {
      if (dbErrorCode(error) === UNIQUE_VIOLATION) {
        return c.json({ success: false, message: 'Email already registered' }, 409);
      }
      throw error;
    }
  });

  app.post('/login', zValidator('json', loginSchema), async (c) => {
    const { email, password } = c.req.valid('json');
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return c.json({ success: false, message: 'Invalid email or password' }, 401);
    }

    const token = await new SignJWT({ sub: String(user.id), email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(secret);

    return c.json({ token, user: { id: user.id, email: user.email } });
  });

  return app;
}
