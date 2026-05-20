import { TRPCError } from '@trpc/server';
import { eq, and, desc, count, gt, lt } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { router, publicProc, authProc } from '../trpc';
import type { AppDB } from '../db';
import { forms, responses, rateLimits } from '../db/schema';
import { SubmitResponseInput, FormFieldsSchema, FieldSchema } from '../schemas';

function uid(): string { return crypto.randomUUID(); }

function ipHash(ip: string, salt: string): string {
  return createHash('sha256').update(ip + salt).digest('hex');
}

// ── Dynamic Zod validator built from a form's schema ──────────────────────
function buildResponseValidator(fields: FieldSchema[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (field.type === 'section_divider') continue;

    let validator: z.ZodTypeAny = z.string();

    switch (field.type) {
      case 'email':   validator = z.string().email(); break;
      case 'phone':   validator = z.string().regex(/^\+?[\d\s\-()]{7,15}$/); break;
      case 'number':
      case 'currency':
      case 'rating':
      case 'scale':   validator = z.number(); break;
      case 'date':    validator = z.string().regex(/^\d{4}-\d{2}-\d{2}$/); break;
      case 'url':     validator = z.string().url(); break;
      case 'pan':     validator = z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/); break;
      case 'gst':     validator = z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/); break;
      case 'ifsc':    validator = z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/); break;
      case 'pincode': validator = z.string().regex(/^\d{6}$/); break;
      case 'select':
      case 'radio':
        if (field.options?.length) {
          validator = z.enum(field.options as [string, ...string[]]);
        }
        break;
      case 'checkbox': validator = z.array(z.string()); break;
      default: validator = z.string();
    }

    if (field.maxLength) validator = (validator as z.ZodString).max(field.maxLength);
    if (field.minLength) validator = (validator as z.ZodString).min(field.minLength);
    if (field.customRegex) validator = z.string().regex(new RegExp(field.customRegex));

    shape[field.id] = field.required ? validator : validator.optional();
  }

  return z.object(shape);
}

// ── D1-backed rate limiter: max 5 submissions per IP per form per hour ────
async function checkRateLimit(db: AppDB, key: string): Promise<boolean> {
  const max    = 5;
  const cutoff = Date.now() - 60 * 60 * 1000;

  const [result] = await db
    .select({ total: count() })
    .from(rateLimits)
    .where(and(eq(rateLimits.key, key), gt(rateLimits.timestamp, cutoff)));

  if (result.total >= max) return false;

  await db.insert(rateLimits).values({ id: uid(), key, timestamp: Date.now() });

  // Periodic cleanup (~10% of requests)
  if (Math.random() < 0.1) {
    await db.delete(rateLimits).where(lt(rateLimits.timestamp, cutoff));
  }

  return true;
}

export const responsesRouter = router({
  // ── Public: submit a response (no auth required) ─────────────────────
  submit: publicProc
    .input(SubmitResponseInput)
    .mutation(async ({ input, ctx }) => {
      const form = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.published, true)),
      });
      if (!form) throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found.' });

      const clientIp = (ctx as any).ip ?? '0.0.0.0';
      const hash     = ipHash(clientIp, ctx.env.IP_SALT);
      const rlKey    = `${input.formId}:${hash}`;
      const allowed  = await checkRateLimit(ctx.db, rlKey);
      if (!allowed) {
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many submissions. Please wait.' });
      }

      const fields    = FormFieldsSchema.parse(JSON.parse(form.schema));
      const validator = buildResponseValidator(fields);
      const parsed    = validator.safeParse(input.data);
      if (!parsed.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Validation failed.',
          cause: parsed.error.flatten(),
        });
      }

      const response = {
        id:          uid(),
        formId:      input.formId,
        data:        JSON.stringify(parsed.data),
        ipHash:      hash,
        submittedAt: new Date(),
      };
      await ctx.db.insert(responses).values(response);
      return { success: true, id: response.id };
    }),

  // ── Creator: list responses for own form ──────────────────────────────
  list: authProc
    .input(z.object({ formId: z.string(), limit: z.number().int().min(1).max(100).default(50) }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.creatorId, ctx.userId)),
      });
      if (!form) throw new TRPCError({ code: 'NOT_FOUND' });

      const rows = await ctx.db.query.responses.findMany({
        where: eq(responses.formId, input.formId),
        orderBy: [desc(responses.submittedAt)],
        limit: input.limit,
      });
      return rows.map(r => ({
        id:          r.id,
        data:        JSON.parse(r.data),
        submittedAt: r.submittedAt,
      }));
    }),

  // ── Creator: analytics summary ────────────────────────────────────────
  analytics: authProc
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.creatorId, ctx.userId)),
      });
      if (!form) throw new TRPCError({ code: 'NOT_FOUND' });

      const [{ total }] = await ctx.db
        .select({ total: count() })
        .from(responses)
        .where(eq(responses.formId, input.formId));

      return {
        formId:         input.formId,
        totalResponses: total,
        published:      form.published,
        visibility:     form.visibility,
      };
    }),
});
