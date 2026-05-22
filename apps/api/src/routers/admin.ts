import { desc, count, eq } from 'drizzle-orm';
import { router, adminProc } from '../trpc';
import { forms, responses, users } from '../db/schema';

export const adminRouter = router({
  overview: adminProc.query(async ({ ctx }) => {
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

    return {
      totals: {
        users: userCount?.total ?? 0,
        forms: formCount?.total ?? 0,
        responses: responseCount?.total ?? 0,
        publicForms: publicForms.length,
        publishedForms: publishedForms.length,
      },
      recentUsers,
      recentForms,
    };
  }),
});