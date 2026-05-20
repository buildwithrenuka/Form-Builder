import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// ── Worker environment bindings ───────────────────────────────────────────
export type Env = {
  DB:            D1Database;
  JWT_SECRET:    string;
  IP_SALT:       string;
  PASSWORD_SALT: string;
};

export type AppDB = ReturnType<typeof getDb>;

// Called once per request — D1 binding is provided by the Workers runtime
export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

