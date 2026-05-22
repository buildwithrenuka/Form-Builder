import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { count, and, gt, lt } from 'drizzle-orm';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { router, publicProc, authProc } from '../trpc';
import type { Context } from '../context';
import { users, rateLimits } from '../db/schema';
import { RegisterInput, LoginInput } from '../schemas';
import { signToken } from './jwt';

const PBKDF2_PREFIX = 'pbkdf2';
const PBKDF2_DIGEST = 'SHA-256';
const PBKDF2_ITERATIONS = 310000;
const PBKDF2_KEY_LENGTH = 32;
const DUMMY_SALT = new Uint8Array(16);

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

function fromBase64Url(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, 'base64url'));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) return false;
  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

async function derivePbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const importedKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: PBKDF2_DIGEST,
      salt,
      iterations,
    },
    importedKey,
    PBKDF2_KEY_LENGTH * 8,
  );

  return new Uint8Array(bits);
}

function hashLegacyPassword(password: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await derivePbkdf2(password, salt, PBKDF2_ITERATIONS);
  return [
    PBKDF2_PREFIX,
    PBKDF2_DIGEST.toLowerCase(),
    String(PBKDF2_ITERATIONS),
    toBase64Url(salt),
    toBase64Url(derived),
  ].join('$');
}

async function burnPasswordCheck(password: string): Promise<void> {
  await derivePbkdf2(password, DUMMY_SALT, PBKDF2_ITERATIONS);
}

async function verifyPassword(password: string, storedHash: string, legacySalt: string): Promise<{ valid: boolean; upgradedHash?: string }> {
  const parts = storedHash.split('$');
  if (parts.length === 5 && parts[0] === PBKDF2_PREFIX && parts[1] === PBKDF2_DIGEST.toLowerCase()) {
    const iterations = Number(parts[2]);
    const salt = fromBase64Url(parts[3] ?? '');
    const expected = fromBase64Url(parts[4] ?? '');

    if (!Number.isInteger(iterations) || iterations < 100000 || salt.byteLength === 0 || expected.byteLength === 0) {
      return { valid: false };
    }

    const derived = await derivePbkdf2(password, salt, iterations);
    return { valid: constantTimeEqual(derived, expected) };
  }

  const expectedLegacyHash = hashLegacyPassword(password, legacySalt);
  const legacyValid = expectedLegacyHash.length === storedHash.length
    && constantTimeEqual(Buffer.from(expectedLegacyHash, 'hex'), Buffer.from(storedHash, 'hex'));

  return legacyValid
    ? { valid: true, upgradedHash: await hashPassword(password) }
    : { valid: false };
}

function uid(): string {
  return randomBytes(12).toString('hex');
}

function normalizeIdentity(value: string): string {
  return value.trim().toLowerCase();
}

async function consumeRateLimit(ctx: Context, key: string, maxAttempts: number, windowMs: number): Promise<boolean> {
  const cutoff = Date.now() - windowMs;

  const [result] = await ctx.db
    .select({ total: count() })
    .from(rateLimits)
    .where(and(eq(rateLimits.key, key), gt(rateLimits.timestamp, cutoff)));

  if (result.total >= maxAttempts) {
    return false;
  }

  await ctx.db.insert(rateLimits).values({ id: uid(), key, timestamp: Date.now() });

  if (Math.random() < 0.1) {
    await ctx.db.delete(rateLimits).where(lt(rateLimits.timestamp, cutoff));
  }

  return true;
}

async function enforceAuthRateLimit(ctx: Context, scope: 'login' | 'register', email: string): Promise<void> {
  const normalizedEmail = normalizeIdentity(email);
  const normalizedIp = normalizeIdentity(ctx.ip ?? 'unknown');

  if (scope === 'login') {
    const loginIpAllowed = await consumeRateLimit(ctx, `auth:login:ip:${normalizedIp}`, 10, 15 * 60 * 1000);
    const loginEmailAllowed = await consumeRateLimit(ctx, `auth:login:email:${normalizedEmail}`, 5, 15 * 60 * 1000);
    if (!loginIpAllowed || !loginEmailAllowed) {
      throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many login attempts. Please wait and try again.' });
    }
    return;
  }

  const registerIpAllowed = await consumeRateLimit(ctx, `auth:register:ip:${normalizedIp}`, 5, 60 * 60 * 1000);
  const registerEmailAllowed = await consumeRateLimit(ctx, `auth:register:email:${normalizedEmail}`, 3, 60 * 60 * 1000);
  if (!registerIpAllowed || !registerEmailAllowed) {
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many registration attempts. Please try again later.' });
  }
}

export const authRouter = router({
  register: publicProc
    .input(RegisterInput)
    .mutation(async ({ ctx, input }) => {
      await enforceAuthRateLimit(ctx, 'register', input.email);

      const existing = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already registered.' });
      }

      const user = {
        id:           uid(),
        name:         input.name,
        email:        input.email,
        passwordHash: await hashPassword(input.password),
        createdAt:    new Date(),
      };
      await ctx.db.insert(users).values(user);
      const token = await signToken(user.id, ctx.env.JWT_SECRET);
      return { token, user: { id: user.id, name: user.name, email: user.email } };
    }),

  login: publicProc
    .input(LoginInput)
    .mutation(async ({ ctx, input }) => {
      await enforceAuthRateLimit(ctx, 'login', input.email);

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user) {
        await burnPasswordCheck(input.password);
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password.' });
      }

      const passwordResult = await verifyPassword(input.password, user.passwordHash, ctx.env.PASSWORD_SALT);
      if (!passwordResult.valid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password.' });
      }

      if (passwordResult.upgradedHash) {
        await ctx.db
          .update(users)
          .set({ passwordHash: passwordResult.upgradedHash })
          .where(eq(users.id, user.id));
      }

      const token = await signToken(user.id, ctx.env.JWT_SECRET);
      return { token, user: { id: user.id, name: user.name, email: user.email } };
    }),

  me: authProc.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
    });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
    return { id: user.id, name: user.name, email: user.email };
  }),
});
