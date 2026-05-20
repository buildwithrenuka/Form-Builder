import type { Context as HonoCtx } from 'hono';
import { verifyToken } from './auth/jwt';
import { getDb, type Env, type AppDB } from './db';

export type Context = {
  userId: string | null;
  db:     AppDB;
  env:    Env;
};

export async function createContext(c: HonoCtx<{ Bindings: Env }>): Promise<Context> {
  const db    = getDb(c.env.DB);
  const auth  = c.req.header('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return { userId: null, db, env: c.env };
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    return { userId: payload.sub ?? null, db, env: c.env };
  } catch {
    return { userId: null, db, env: c.env };
  }
}
