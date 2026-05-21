import { TRPCError } from '@trpc/server';
import { eq, and, desc, count, gt, lt } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { router, publicProc, authProc } from '../trpc';
import type { AppDB } from '../db';
import { forms, responses, rateLimits, users } from '../db/schema';
import { SubmitResponseInput, FormFieldsSchema, FieldSchema } from '../schemas';
import { sendSubmissionAlert } from '../email';

function uid(): string { return crypto.randomUUID(); }

function ipHash(ip: string, salt: string): string {
  return createHash('sha256').update(ip + salt).digest('hex');
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

// ── Dynamic Zod validator built from a form's schema ──────────────────────
function buildResponseValidator(fields: FieldSchema[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (field.type === 'section' || field.type === 'section_divider') continue;

    let validator: z.ZodTypeAny = z.string();

    switch (field.type) {
      case 'email':   validator = z.string().email(); break;
      case 'phone':   validator = z.string().regex(/^\+?[\d\s\-()]{7,15}$/); break;
      case 'number':
      case 'currency':
      case 'rating':
      case 'range':
      case 'scale':   validator = z.coerce.number(); break;
      case 'date':    validator = z.string().regex(/^\d{4}-\d{2}-\d{2}$/); break;
      case 'time':    validator = z.string().regex(/^\d{2}:\d{2}$/); break;
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

    if (validator instanceof z.ZodString) {
      let stringValidator = validator;
      if (field.maxLength) stringValidator = stringValidator.max(field.maxLength);
      if (field.minLength) stringValidator = stringValidator.min(field.minLength);
      if (field.customPattern || field.customRegex) {
        stringValidator = stringValidator.regex(new RegExp(field.customPattern || field.customRegex || ''));
      }
      validator = stringValidator;
    }

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

      const clientIp = ctx.ip;
      const hash     = clientIp ? ipHash(clientIp, ctx.env.IP_SALT) : null;
      if (hash && !isLocalDevelopmentIp(clientIp)) {
        const rlKey   = `${input.formId}:${hash}`;
        const allowed = await checkRateLimit(ctx.db, rlKey);
        if (!allowed) {
          throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many submissions. Please wait.' });
        }
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
        ipHash:      hash ?? 'unavailable',
        submittedAt: new Date(),
      };
      await ctx.db.insert(responses).values(response);

      // Fire-and-forget email notification to form creator
      const creator = await ctx.db.query.users.findFirst({
        where: eq(users.id, form.creatorId),
        columns: { email: true },
      });
      if (creator?.email) {
        void sendSubmissionAlert(ctx.env as { RESEND_API_KEY?: string }, {
          creatorEmail:  creator.email,
          formTitle:     form.title,
          responseId:    response.id,
          formId:        input.formId,
          submittedAt:   new Date().toUTCString(),
        });
      }

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
        updatedAt:      form.updatedAt,
        createdAt:      form.createdAt,
      };
    }),
});
