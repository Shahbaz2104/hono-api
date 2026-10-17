import { createMiddleware } from 'hono/factory';
import { jwtVerify } from 'jose';

export type AuthVariables = {
  userId: number;
  userEmail: string;
};

export function bearerAuth(jwtSecret: string) {
  const secret = new TextEncoder().encode(jwtSecret);

  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const header = c.req.header('Authorization');
    if (!header?.startsWith('Bearer ')) {
      return c.json({ success: false, message: 'Missing bearer token' }, 401);
    }

    try {
      const { payload } = await jwtVerify(header.slice(7), secret, { algorithms: ['HS256'] });
      c.set('userId', Number(payload.sub));
      c.set('userEmail', String(payload.email ?? ''));
    } catch {
      return c.json({ success: false, message: 'Invalid or expired token' }, 401);
    }

    await next();
  });
}
