import { TRPCError } from '@trpc/server';
import { eq, and, desc, count, like, or } from 'drizzle-orm';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { router, publicProc, authProc } from '../trpc';
import type { Context } from '../context';
import { forms, responses } from '../db/schema';
import {
  CreateFormInput, UpdateFormInput, PublishFormInput, FormFieldsSchema, CloneFormInput,
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

function normalizeCustomSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function hashAccessPassword(password: string, salt: string): string {
  return createHash('sha256').update(`${salt}:form:${password}`).digest('hex');
}

function hashRespondentToken(token: string, salt: string): string {
  return createHash('sha256').update(`${salt}:respondent:${token}`).digest('hex');
}

function verifyAccessPassword(password: string | undefined, storedHash: string, salt: string): boolean {
  if (!password) return false;

  const expected = hashAccessPassword(password, salt);
  return expected.length === storedHash.length
    && timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(storedHash, 'hex'));
}

const publicGalleryCategorySchema = z.enum([
  'all',
  'realm-runner',
  'globe-explorer',
  'the-library',
  'registration',
  'survey',
  'quiz',
]);

const TEMPLE_WORLD_IDS = ['temple-run', 'jungle', 'snow', 'desert', 'space', 'underwater', 'volcano', 'heaven', 'hell', 'flower'];
const GLOBE_WORLD_IDS = ['globe', 'india', 'usa', 'uk', 'japan', 'germany', 'brazil', 'uae', 'australia', 'china', 'france', 'canada', 'south-africa'];
const LIBRARY_WORLD_IDS = ['library', 'mythology', 'history', 'scifi', 'fictional'];

function matchWorldTheme(worldIds: string[]) {
  return or(...worldIds.map((worldId) => eq(forms.worldTheme, worldId)));
}

function getPublicGalleryCategoryConditions(category: z.infer<typeof publicGalleryCategorySchema>) {
  switch (category) {
    case 'realm-runner':
      return [matchWorldTheme(TEMPLE_WORLD_IDS)!];
    case 'globe-explorer':
      return [matchWorldTheme(GLOBE_WORLD_IDS)!];
    case 'the-library':
      return [matchWorldTheme(LIBRARY_WORLD_IDS)!];
    case 'registration':
      return [
        or(
          like(forms.title, '%registration%'),
          like(forms.title, '%register%'),
          like(forms.title, '%onboarding%'),
          like(forms.title, '%application%'),
          like(forms.description, '%registration%'),
          like(forms.description, '%register%'),
          like(forms.description, '%onboarding%'),
          like(forms.description, '%application%'),
        )!,
      ];
    case 'survey':
      return [
        or(
          like(forms.title, '%survey%'),
          like(forms.title, '%feedback%'),
          like(forms.title, '%review%'),
          like(forms.description, '%survey%'),
          like(forms.description, '%feedback%'),
          like(forms.description, '%review%'),
        )!,
      ];
    case 'quiz':
      return [
        or(
          like(forms.title, '%quiz%'),
          like(forms.title, '%assessment%'),
          like(forms.title, '%test%'),
          like(forms.description, '%quiz%'),
          like(forms.description, '%assessment%'),
          like(forms.description, '%test%'),
        )!,
      ];
    case 'all':
    default:
      return [];
  }
}

function isLocalDevelopmentIp(ip: string | null): boolean {
  if (!ip) return true;

  const normalized = ip.trim().toLowerCase();
  if (!normalized) return true;

  return normalized === '127.0.0.1'
    || normalized === '::1'
    || normalized === 'localhost'
    || normalized.startsWith('192.168.')
    || normalized.startsWith('10.')
    || /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized);
}

async function ensureUniqueSlug(slug: string, currentFormId: string | null, ctx: Context) {
  const existing = await ctx.db.query.forms.findFirst({
    where: eq(forms.slug, slug),
    columns: { id: true },
  });

  if (existing && existing.id !== currentFormId) {
    throw new TRPCError({ code: 'CONFLICT', message: 'That form slug is already in use.' });
  }
}

async function countResponsesForForm(ctx: Context, formId: string): Promise<number> {
  const [result] = await ctx.db
    .select({ total: count() })
    .from(responses)
    .where(eq(responses.formId, formId));

  return result?.total ?? 0;
}

async function assertFormAcceptingResponses(ctx: Context, form: typeof forms.$inferSelect) {
  if (form.expiresAt && form.expiresAt.getTime() <= Date.now()) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'This form has expired.' });
  }

  if (form.responseLimit) {
    const totalResponses = await countResponsesForForm(ctx, form.id);
    if (totalResponses >= form.responseLimit) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'This form is no longer accepting responses.' });
    }
  }
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
        clonedFromId: null,
        title:       input.title,
        description: input.description ?? null,
        slug:        slugify(input.title, id),
        visibility:  'unlisted' as const,
        published:   false,
        archived:    false,
        allowResponseEdits: false,
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

      const nextSlug = input.slug !== undefined
        ? normalizeCustomSlug(input.slug)
        : undefined;

      if (input.slug !== undefined && (!nextSlug || nextSlug.length < 3)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Slug must be at least 3 characters long.' });
      }

      if (nextSlug) {
        await ensureUniqueSlug(nextSlug, existing.id, ctx);
      }

      await ctx.db.update(forms)
        .set({
          ...(input.title       ? { title: input.title }              : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.visibility  ? { visibility: input.visibility }    : {}),
          ...(input.archived !== undefined ? { archived: input.archived, published: input.archived ? false : existing.published } : {}),
          ...(nextSlug ? { slug: nextSlug } : {}),
          ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt ? new Date(input.expiresAt) : null } : {}),
          ...(input.responseLimit !== undefined ? { responseLimit: input.responseLimit } : {}),
          ...(input.accessPassword !== undefined ? {
            accessPasswordHash: input.accessPassword ? hashAccessPassword(input.accessPassword, ctx.env.PASSWORD_SALT) : null,
          } : {}),
          ...(input.allowResponseEdits !== undefined ? { allowResponseEdits: input.allowResponseEdits } : {}),
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
      if (existing.archived && input.published) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Archived forms must be restored before publishing.' });
      }

      await ctx.db.update(forms)
        .set({ published: input.published, updatedAt: new Date() })
        .where(eq(forms.id, input.id));
      return { published: input.published };
    }),

  clone: authProc
    .input(CloneFormInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.id, input.id), eq(forms.creatorId, ctx.userId)),
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });

      const id = uid();
      const title = input.title ?? `${existing.title} Copy`;
      const clone = {
        id,
        creatorId: ctx.userId,
        clonedFromId: existing.id,
        title,
        description: existing.description,
        slug: slugify(title, id),
        visibility: 'unlisted' as const,
        published: false,
        archived: false,
        expiresAt: existing.expiresAt,
        responseLimit: existing.responseLimit,
        accessPasswordHash: existing.accessPasswordHash,
        allowResponseEdits: existing.allowResponseEdits,
        schema: existing.schema,
        worldTheme: existing.worldTheme,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.db.insert(forms).values(clone);
      return { id: clone.id, slug: clone.slug, title: clone.title };
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
    .input(z.object({ slug: z.string(), accessPassword: z.string().max(128).optional(), respondentToken: z.string().min(16).max(256).optional() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.slug, input.slug), eq(forms.published, true), eq(forms.archived, false)),
      });
      if (!form) throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found or not published.' });

      const respondentTokenHash = input.respondentToken
        ? hashRespondentToken(input.respondentToken, ctx.env.IP_SALT)
        : null;
      const existingResponse = respondentTokenHash
        ? await ctx.db.query.responses.findFirst({
          where: and(eq(responses.formId, form.id), eq(responses.respondentTokenHash, respondentTokenHash)),
          columns: { id: true, data: true },
        })
        : null;

      if (form.expiresAt && form.expiresAt.getTime() <= Date.now()) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'This form has expired.' });
      }

      if (form.responseLimit) {
        const totalResponses = await countResponsesForForm(ctx, form.id);
        if (totalResponses >= form.responseLimit && !(existingResponse && form.allowResponseEdits)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'This form is no longer accepting responses.' });
        }
      }

      if (form.accessPasswordHash && !verifyAccessPassword(input.accessPassword, form.accessPasswordHash, ctx.env.PASSWORD_SALT)) {
        return {
          access: 'locked' as const,
          title: form.title,
          description: form.description,
          worldTheme: form.worldTheme,
          requiresPassword: true,
        };
      }

      const totalResponses = form.responseLimit ? await countResponsesForForm(ctx, form.id) : 0;
      const alreadySubmitted = Boolean(existingResponse);
      const canEditResponse = Boolean(existingResponse && form.allowResponseEdits);

      return {
        access: 'available' as const,
        id:          form.id,
        title:       form.title,
        description: form.description,
        worldTheme:  form.worldTheme,
        requiresPassword: false,
        expiresAt:   form.expiresAt,
        responseLimit: form.responseLimit,
        allowResponseEdits: form.allowResponseEdits,
        remainingResponses: form.responseLimit ? Math.max(form.responseLimit - totalResponses, 0) : null,
        alreadySubmitted,
        canEditResponse,
        existingResponseData: existingResponse ? JSON.parse(existingResponse.data) as Record<string, unknown> : null,
        schema:      FormFieldsSchema.parse(JSON.parse(form.schema)),
      };
    }),

  // ── Public: list all public published forms (explore page) ─────────────
  listPublic: publicProc
    .input(z.object({
      limit: z.number().int().min(1).max(50).optional(),
      query: z.string().trim().max(120).optional(),
      category: publicGalleryCategorySchema.default('all'),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const query = input.query?.trim();
      const effectivePageSize = input.limit ?? input.pageSize;
      const searchConditions = query
        ? [or(
          like(forms.title, `%${query}%`),
          like(forms.description, `%${query}%`),
          like(forms.worldTheme, `%${query}%`),
        )!]
        : [];
      const categoryConditions = getPublicGalleryCategoryConditions(input.category);
      const whereClause = and(
        eq(forms.published, true),
        eq(forms.visibility, 'public'),
        eq(forms.archived, false),
        ...searchConditions,
        ...categoryConditions,
      );

      const [items, totalRows] = await Promise.all([
        ctx.db.query.forms.findMany({
          where: whereClause,
          orderBy: [desc(forms.createdAt)],
          offset: (input.page - 1) * effectivePageSize,
          limit: effectivePageSize,
          columns: { id: true, title: true, description: true, slug: true, worldTheme: true, createdAt: true, expiresAt: true, responseLimit: true },
        }),
        ctx.db.select({ value: count() }).from(forms).where(whereClause),
      ]);

      const total = totalRows[0]?.value ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / effectivePageSize));

      return {
        items,
        total,
        page: input.page,
        pageSize: effectivePageSize,
        totalPages,
        hasPreviousPage: input.page > 1,
        hasNextPage: input.page < totalPages,
      };
    }),
});
