import type { Context as HonoCtx } from 'hono';
import { verifyToken } from './auth/jwt';
import { getDb, type Env, type AppDB } from './db';

export type Context = {
  userId: string | null;
  db:     AppDB;
  env:    Env;
  ip:     string | null;
};

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
  if (!token) return { userId: null, db, env: c.env, ip };
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    return { userId: payload.sub ?? null, db, env: c.env, ip };
  } catch {
    return { userId: null, db, env: c.env, ip };
  }
}
