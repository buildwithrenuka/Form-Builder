import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { createHash, randomBytes } from 'node:crypto';
import { router, publicProc, authProc } from '../trpc';
import { users } from '../db/schema';
import { RegisterInput, LoginInput } from '../schemas';
import { signToken } from './jwt';

function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

function uid(): string {
  return randomBytes(12).toString('hex');
}

export const authRouter = router({
  register: publicProc
    .input(RegisterInput)
    .mutation(async ({ ctx, input }) => {
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
        passwordHash: hashPassword(input.password, ctx.env.PASSWORD_SALT),
        createdAt:    new Date(),
      };
      await ctx.db.insert(users).values(user);
      const token = await signToken(user.id, ctx.env.JWT_SECRET);
      return { token, user: { id: user.id, name: user.name, email: user.email } };
    }),

  login: publicProc
    .input(LoginInput)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });
      if (!user || user.passwordHash !== hashPassword(input.password, ctx.env.PASSWORD_SALT)) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password.' });
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
