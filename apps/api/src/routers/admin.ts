import { and, desc, count, eq, gt, like, or, sql } from 'drizzle-orm';
import { router, adminProc } from '../trpc';
import { forms, responses, users } from '../db/schema';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function shiftDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function countSince<T extends { createdAt?: Date; submittedAt?: Date }>(rows: T[], threshold: Date, key: 'createdAt' | 'submittedAt'): number {
  return rows.filter((row) => {
    const value = row[key];
    return value instanceof Date && value.getTime() >= threshold.getTime();
  }).length;
}

function roundMetric(value: number): number {
  return Number(value.toFixed(1));
}

export const adminRouter = router({
  overview: adminProc.query(async ({ ctx }) => {
    const today = startOfDay(new Date());
    const last7Start = shiftDays(today, -6);
    const previous7Start = shiftDays(today, -13);
    const timelineStart = shiftDays(today, -13);

    const [userCount] = await ctx.db.select({ total: count() }).from(users);
    const [formCount] = await ctx.db.select({ total: count() }).from(forms);
    const [responseCount] = await ctx.db.select({ total: count() }).from(responses);

    const publicForms = await ctx.db.query.forms.findMany({
      where: eq(forms.visibility, 'public'),
      columns: { id: true },
    });

    const publishedForms = await ctx.db.query.forms.findMany({
      where: eq(forms.published, true),
      columns: { id: true },
    });

    const recentUserRows = await ctx.db.query.users.findMany({
      where: gt(users.createdAt, previous7Start),
      columns: { createdAt: true },
    });

    const recentFormRows = await ctx.db.query.forms.findMany({
      where: gt(forms.createdAt, previous7Start),
      columns: { id: true, creatorId: true, title: true, slug: true, published: true, visibility: true, createdAt: true },
    });

    const recentResponseRows = await ctx.db.query.responses.findMany({
      where: gt(responses.submittedAt, previous7Start),
      columns: { formId: true, submittedAt: true },
    });

    const timelineUsers = await ctx.db.query.users.findMany({
      where: gt(users.createdAt, timelineStart),
      columns: { createdAt: true },
    });

    const timelineForms = await ctx.db.query.forms.findMany({
      where: gt(forms.createdAt, timelineStart),
      columns: { createdAt: true },
    });

    const timelineResponses = await ctx.db.query.responses.findMany({
      where: gt(responses.submittedAt, timelineStart),
      columns: { submittedAt: true },
    });

    const responseFormRows = await ctx.db.query.responses.findMany({
      columns: { formId: true },
    });

    const recentUsers = await ctx.db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      columns: { id: true, name: true, email: true, createdAt: true },
      limit: 8,
    });

    const recentFormsRaw = await ctx.db.query.forms.findMany({
      orderBy: [desc(forms.createdAt)],
      columns: {
        id: true,
        title: true,
        slug: true,
        visibility: true,
        published: true,
        archived: true,
        creatorId: true,
        createdAt: true,
      },
      limit: 10,
    });

    const creatorIds = Array.from(new Set(recentFormsRaw.map((form) => form.creatorId)));
    const creators = creatorIds.length
      ? await ctx.db.query.users.findMany({
          columns: { id: true, name: true, email: true },
        })
      : [];
    const creatorMap = new Map(creators.map((creator) => [creator.id, creator]));

    const recentForms = recentFormsRaw.map((form) => ({
      ...form,
      creatorName: creatorMap.get(form.creatorId)?.name ?? 'Unknown',
      creatorEmail: creatorMap.get(form.creatorId)?.email ?? 'unknown',
    }));

    const usersLast7Days = countSince(recentUserRows, last7Start, 'createdAt');
    const usersPrevious7Days = countSince(recentUserRows, previous7Start, 'createdAt') - usersLast7Days;
    const formsLast7Days = countSince(recentFormRows, last7Start, 'createdAt');
    const formsPrevious7Days = countSince(recentFormRows, previous7Start, 'createdAt') - formsLast7Days;
    const responsesLast7Days = countSince(recentResponseRows, last7Start, 'submittedAt');
    const responsesPrevious7Days = countSince(recentResponseRows, previous7Start, 'submittedAt') - responsesLast7Days;

    const responseCountByForm = new Map<string, number>();
    for (const response of responseFormRows) {
      responseCountByForm.set(response.formId, (responseCountByForm.get(response.formId) ?? 0) + 1);
    }

    const topForms = recentFormsRaw
      .map((form) => ({
        ...form,
        creatorName: creatorMap.get(form.creatorId)?.name ?? 'Unknown',
        creatorEmail: creatorMap.get(form.creatorId)?.email ?? 'unknown',
        responseCount: responseCountByForm.get(form.id) ?? 0,
      }))
      .sort((left, right) => right.responseCount - left.responseCount || right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, 5);

    const timelineMap = new Map<string, { users: number; forms: number; responses: number }>();
    for (let index = 0; index < 14; index += 1) {
      const date = shiftDays(timelineStart, index);
      timelineMap.set(toDayKey(date), { users: 0, forms: 0, responses: 0 });
    }

    for (const user of timelineUsers) {
      const key = toDayKey(user.createdAt);
      const bucket = timelineMap.get(key);
      if (bucket) bucket.users += 1;
    }

    for (const form of timelineForms) {
      const key = toDayKey(form.createdAt);
      const bucket = timelineMap.get(key);
      if (bucket) bucket.forms += 1;
    }

    for (const response of timelineResponses) {
      const key = toDayKey(response.submittedAt);
      const bucket = timelineMap.get(key);
      if (bucket) bucket.responses += 1;
    }

    const timeline = Array.from(timelineMap.entries()).map(([date, values]) => ({ date, ...values }));

    const publishedTotal = publishedForms.length;
    const publicTotal = publicForms.length;
    const formTotal = formCount?.total ?? 0;
    const responseTotal = responseCount?.total ?? 0;

    return {
      totals: {
        users: userCount?.total ?? 0,
        forms: formTotal,
        responses: responseTotal,
        publicForms: publicTotal,
        publishedForms: publishedTotal,
      },
      analytics: {
        last7Days: {
          users: usersLast7Days,
          forms: formsLast7Days,
          responses: responsesLast7Days,
        },
        previous7Days: {
          users: usersPrevious7Days,
          forms: formsPrevious7Days,
          responses: responsesPrevious7Days,
        },
        averages: {
          responsesPerForm: formTotal ? roundMetric(responseTotal / formTotal) : 0,
          responsesPerPublishedForm: publishedTotal ? roundMetric(responseTotal / publishedTotal) : 0,
          formsPerUser: (userCount?.total ?? 0) ? roundMetric(formTotal / (userCount?.total ?? 1)) : 0,
        },
        rates: {
          publishRate: formTotal ? roundMetric((publishedTotal / formTotal) * 100) : 0,
          publicRate: formTotal ? roundMetric((publicTotal / formTotal) * 100) : 0,
        },
        timeline,
        topForms,
      },
      recentUsers,
      recentForms,
    };
  }),

  users: adminProc
    .input(z.object({
      query: z.string().trim().max(120).optional(),
      role: z.enum(['all', 'user', 'admin']).default('all'),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(5).max(50).default(12),
    }).optional())
    .query(async ({ ctx, input }) => {
      const query = input?.query?.trim() ?? '';
      const role = input?.role ?? 'all';
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 12;
      const offset = (page - 1) * pageSize;
      const pattern = `%${query}%`;

      const whereClause = and(
        role === 'all' ? undefined : eq(users.role, role),
        query ? or(like(users.name, pattern), like(users.email, pattern)) : undefined,
      );

      const [totalRow] = await ctx.db
        .select({ total: count() })
        .from(users)
        .where(whereClause);

      const [overallTotalRow] = await ctx.db
        .select({ total: count() })
        .from(users);

      const [adminTotalRow] = await ctx.db
        .select({ total: count() })
        .from(users)
        .where(eq(users.role, 'admin'));

      const rows = await ctx.db.query.users.findMany({
        where: whereClause,
        orderBy: [sql`case when ${users.role} = 'admin' then 0 else 1 end`, desc(users.createdAt)],
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        limit: pageSize,
        offset,
      });

      const total = totalRow?.total ?? 0;
      const overallTotal = overallTotalRow?.total ?? 0;
      const adminTotal = adminTotalRow?.total ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return {
        items: rows,
        total,
        overallTotal,
        adminTotal,
        memberTotal: Math.max(0, overallTotal - adminTotal),
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    }),

  setUserRole: adminProc
    .input(z.object({ userId: z.string(), role: z.enum(['user', 'admin']) }))
    .mutation(async ({ ctx, input }) => {
      const targetUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
        columns: { id: true, role: true, email: true, name: true },
      });

      if (!targetUser) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });
      }

      if (targetUser.role === input.role) {
        return { success: true, userId: targetUser.id, role: targetUser.role };
      }

      if (targetUser.role === 'admin' && input.role === 'user') {
        const [adminCount] = await ctx.db
          .select({ total: count() })
          .from(users)
          .where(eq(users.role, 'admin'));

        if ((adminCount?.total ?? 0) <= 1) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'You must keep at least one admin user.' });
        }
      }

      await ctx.db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      return {
        success: true,
        userId: targetUser.id,
        role: input.role,
        email: targetUser.email,
        name: targetUser.name,
      };
    }),
});