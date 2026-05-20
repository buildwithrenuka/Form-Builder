import { TRPCError } from '@trpc/server';
import { eq, and, desc } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { router, publicProc, authProc } from '../trpc';
import { forms } from '../db/schema';
import {
  CreateFormInput, UpdateFormInput, PublishFormInput, FormFieldsSchema,
} from '../schemas';
import { z } from 'zod';

function uid(): string { return randomBytes(12).toString('hex'); }

function slugify(title: string, id: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
    + '-' + id.slice(0, 6);
}

export const formsRouter = router({
  // ── Creator: create form ────────────────────────────────────────────────
  create: authProc
    .input(CreateFormInput)
    .mutation(async ({ ctx, input }) => {
      const id = uid();
      const form = {
        id,
        creatorId:   ctx.userId,
        title:       input.title,
        description: input.description ?? null,
        slug:        slugify(input.title, id),
        visibility:  'unlisted' as const,
        published:   false,
        schema:      '[]',
        worldTheme:  input.worldTheme ?? null,
        createdAt:   new Date(),
        updatedAt:   new Date(),
      };
      await ctx.db.insert(forms).values(form);
      return form;
    }),

  // ── Creator: list my forms ──────────────────────────────────────────────
  myForms: authProc.query(async ({ ctx }) => {
    return ctx.db.query.forms.findMany({
      where: eq(forms.creatorId, ctx.userId),
      orderBy: [desc(forms.createdAt)],
    });
  }),

  // ── Creator: get single form (own) ─────────────────────────────────────
  getById: authProc
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.id, input.id), eq(forms.creatorId, ctx.userId)),
      });
      if (!form) throw new TRPCError({ code: 'NOT_FOUND' });
      return { ...form, schema: FormFieldsSchema.parse(JSON.parse(form.schema)) };
    }),

  // ── Creator: update form (title, description, schema, theme, visibility)
  update: authProc
    .input(UpdateFormInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.id, input.id), eq(forms.creatorId, ctx.userId)),
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });

      await ctx.db.update(forms)
        .set({
          ...(input.title       ? { title: input.title }              : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.visibility  ? { visibility: input.visibility }    : {}),
          ...(input.schema      ? { schema: JSON.stringify(input.schema) } : {}),
          ...(input.worldTheme  ? { worldTheme: input.worldTheme }    : {}),
          updatedAt: new Date(),
        })
        .where(eq(forms.id, input.id));
      return { success: true };
    }),

  // ── Creator: publish / unpublish ───────────────────────────────────────
  setPublished: authProc
    .input(PublishFormInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.id, input.id), eq(forms.creatorId, ctx.userId)),
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });

      await ctx.db.update(forms)
        .set({ published: input.published, updatedAt: new Date() })
        .where(eq(forms.id, input.id));
      return { published: input.published };
    }),

  // ── Creator: delete form ────────────────────────────────────────────────
  delete: authProc
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(forms)
        .where(and(eq(forms.id, input.id), eq(forms.creatorId, ctx.userId)));
      return { success: true };
    }),

  // ── Public: get form by slug (for respondents) ─────────────────────────
  getBySlug: publicProc
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.slug, input.slug), eq(forms.published, true)),
      });
      if (!form) throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found or not published.' });
      return {
        id:          form.id,
        title:       form.title,
        description: form.description,
        worldTheme:  form.worldTheme,
        schema:      FormFieldsSchema.parse(JSON.parse(form.schema)),
      };
    }),

  // ── Public: list all public published forms (explore page) ─────────────
  listPublic: publicProc
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.forms.findMany({
        where: and(eq(forms.published, true), eq(forms.visibility, 'public')),
        orderBy: [desc(forms.createdAt)],
        limit: input.limit,
        columns: { id: true, title: true, description: true, slug: true, worldTheme: true, createdAt: true },
      });
    }),
});
