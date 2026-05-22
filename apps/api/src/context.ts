import type { Context as HonoCtx } from 'hono';
import { eq } from 'drizzle-orm';
import { verifyToken } from './auth/jwt';
import { getDb, type Env, type AppDB } from './db';
import { users } from './db/schema';

export type Context = {
  userId: string | null;
  userEmail: string | null;
  isAdmin: boolean;
  db:     AppDB;
  env:    Env;
  ip:     string | null;
}

function getClientIp(c: HonoCtx<{ Bindings: Env }>): string | null {
  const forwardedFor = c.req.header('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = c.req.header('x-real-ip') ?? c.req.header('cf-connecting-ip');
  if (realIp?.trim()) return realIp.trim();

  return null;
}

export async function createContext(c: HonoCtx<{ Bindings: Env }>): Promise<Context> {
  const db    = getDb(c.env.DB);
  const ip    = getClientIp(c);
  const auth  = c.req.header('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return { userId: null, userEmail: null, isAdmin: false, db, env: c.env, ip };
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    const userId = payload.sub ?? null;
    if (!userId) return { userId: null, userEmail: null, isAdmin: false, db, env: c.env, ip };

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { email: true, role: true },
    });
    const userEmail = user?.email ?? null;
    const isAdmin = user?.role === 'admin';

    return { userId, userEmail, isAdmin, db, env: c.env, ip };
  } catch {
    return { userId: null, userEmail: null, isAdmin: false, db, env: c.env, ip };
  }
}
