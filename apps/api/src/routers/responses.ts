import { TRPCError } from '@trpc/server';
import { eq, and, desc, count, gt, lt } from 'drizzle-orm';
import { createHash, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { router, publicProc, authProc } from '../trpc';
import type { AppDB } from '../db';
import { forms, responses, rateLimits, users } from '../db/schema';
import { SubmitResponseInput, FormFieldsSchema, FieldSchema, ResponseListInput, ResponseExportInput } from '../schemas';
import { sendSubmissionAlert, sendRespondentConfirmation } from '../email';

function uid(): string { return crypto.randomUUID(); }

function ipHash(ip: string, salt: string): string {
  return createHash('sha256').update(ip + salt).digest('hex');
}

function hashAccessPassword(password: string, salt: string): string {
  return createHash('sha256').update(`${salt}:form:${password}`).digest('hex');
}

function verifyAccessPassword(password: string | undefined, storedHash: string, salt: string): boolean {
  if (!password) return false;

  const expected = hashAccessPassword(password, salt);
  return expected.length === storedHash.length
    && timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(storedHash, 'hex'));
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

function getFirstStringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function findRespondentEmail(fields: FieldSchema[], data: Record<string, unknown>): string | null {
  for (const field of fields) {
    if (field.type !== 'email') continue;
    const candidate = getFirstStringValue(data[field.id]);
    if (candidate) return candidate.toLowerCase();
  }
  return null;
}

function findRespondentName(fields: FieldSchema[], data: Record<string, unknown>): string | null {
  const preferredLabels = ['name', 'full name', 'your name', 'respondent name'];

  for (const field of fields) {
    if (field.type !== 'text') continue;
    const label = field.label.trim().toLowerCase();
    if (!preferredLabels.includes(label)) continue;
    const candidate = getFirstStringValue(data[field.id]);
    if (candidate) return candidate;
  }

  for (const field of fields) {
    if (field.type !== 'text') continue;
    const candidate = getFirstStringValue(data[field.id]);
    if (candidate) return candidate;
  }

  return null;
}

function isStructuralField(field: FieldSchema): boolean {
  return field.type === 'section' || field.type === 'section_divider' || field.type === 'page_break';
}

function stringifyConditionalValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(',');
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function isFieldVisibleForData(field: FieldSchema, data: Record<string, unknown>): boolean {
  if (!field.conditionalParentId) return true;

  const sourceValue = data[field.conditionalParentId];
  const normalizedValue = stringifyConditionalValue(sourceValue).trim().toLowerCase();
  const expectedValue = (field.conditionalValue ?? '').trim().toLowerCase();

  switch (field.conditionalOperator) {
    case 'not_equals':
      return normalizedValue !== expectedValue;
    case 'contains':
      return normalizedValue.includes(expectedValue);
    case 'greater_than':
      return Number(sourceValue ?? 0) > Number(field.conditionalValue ?? 0);
    case 'less_than':
      return Number(sourceValue ?? 0) < Number(field.conditionalValue ?? 0);
    case 'is_empty':
      return normalizedValue.length === 0;
    case 'is_not_empty':
      return normalizedValue.length > 0;
    case 'equals':
    default:
      return normalizedValue === expectedValue;
  }
}

// ── Dynamic Zod validator built from a form's schema ──────────────────────
function buildResponseValidator(fields: FieldSchema[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (isStructuralField(field)) continue;

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

    shape[field.id] = validator.optional();
  }

  return z.object(shape).superRefine((value, ctx) => {
    for (const field of fields) {
      if (isStructuralField(field)) continue;
      if (!isFieldVisibleForData(field, value)) continue;

      const fieldValue = value[field.id];
      const hasValue = Array.isArray(fieldValue)
        ? fieldValue.length > 0
        : fieldValue !== undefined && fieldValue !== null && String(fieldValue).trim() !== '';

      if (field.required && !hasValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field.id],
          message: 'This field is required.',
        });
        continue;
      }

      if (!hasValue) continue;

      const fieldValidator = z.object({ [field.id]: shape[field.id] });
      const result = fieldValidator.safeParse({ [field.id]: fieldValue });
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue(issue);
        }
      }
    }
  });
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

async function countResponsesForForm(db: AppDB, formId: string): Promise<number> {
  const [result] = await db
    .select({ total: count() })
    .from(responses)
    .where(eq(responses.formId, formId));

  return result?.total ?? 0;
}

function matchesResponseQuery(data: Record<string, unknown>, query: string): boolean {
  if (!query) return true;
  const normalized = query.toLowerCase();
  return Object.entries(data).some(([key, value]) => {
    const rendered = Array.isArray(value)
      ? value.join(' ')
      : value === null || value === undefined
        ? ''
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value);
    return key.toLowerCase().includes(normalized) || rendered.toLowerCase().includes(normalized);
  });
}

function escapeCsvCell(value: unknown): string {
  const rendered = Array.isArray(value)
    ? value.join(', ')
    : value === null || value === undefined
      ? ''
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value);
  const escaped = rendered.replace(/"/g, '""');
  return `"${escaped}"`;
}

function buildCsv(rows: Array<{ submittedAt: Date; data: Record<string, unknown> }>): string {
  const fieldIds = Array.from(new Set(rows.flatMap((row) => Object.keys(row.data))));
  const headers = ['submittedAt', ...fieldIds];
  const lines = [headers.map(escapeCsvCell).join(',')];

  for (const row of rows) {
    lines.push([
      escapeCsvCell(row.submittedAt.toISOString()),
      ...fieldIds.map((fieldId) => escapeCsvCell(row.data[fieldId])),
    ].join(','));
  }

  return lines.join('\n');
}

export const responsesRouter = router({
  // ── Public: submit a response (no auth required) ─────────────────────
  submit: publicProc
    .input(SubmitResponseInput)
    .mutation(async ({ input, ctx }) => {
      const form = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.published, true), eq(forms.archived, false)),
      });
      if (!form) throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found.' });

      if (form.expiresAt && form.expiresAt.getTime() <= Date.now()) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'This form has expired.' });
      }

      if (form.responseLimit) {
        const totalResponses = await countResponsesForForm(ctx.db, input.formId);
        if (totalResponses >= form.responseLimit) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'This form is no longer accepting responses.' });
        }
      }

      if (form.accessPasswordHash && !verifyAccessPassword(input.accessPassword, form.accessPasswordHash, ctx.env.PASSWORD_SALT)) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid form password.' });
      }

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

      const submittedAt = response.submittedAt.toUTCString();
      const respondentEmail = findRespondentEmail(fields, parsed.data);
      const respondentName = findRespondentName(fields, parsed.data);

      // Fire-and-forget email notification to form creator
      const creator = await ctx.db.query.users.findFirst({
        where: eq(users.id, form.creatorId),
        columns: { email: true },
      });

      const notificationTasks: Promise<void>[] = [];

      if (creator?.email) {
        notificationTasks.push(sendSubmissionAlert(ctx.env, {
          creatorEmail: creator.email,
          formTitle: form.title,
          responseId: response.id,
          formId: input.formId,
          submittedAt,
        }));
      }

      if (respondentEmail) {
        notificationTasks.push(sendRespondentConfirmation(ctx.env, {
          respondentEmail,
          respondentName,
          formTitle: form.title,
          responseId: response.id,
          submittedAt,
          formSlug: form.slug,
        }));
      }

      if (notificationTasks.length) {
        void Promise.allSettled(notificationTasks);
      }

      return { success: true, id: response.id };
    }),

  // ── Creator: list responses for own form ──────────────────────────────
  list: authProc
    .input(ResponseListInput)
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.creatorId, ctx.userId)),
      });
      if (!form) throw new TRPCError({ code: 'NOT_FOUND' });

      const rows = await ctx.db.query.responses.findMany({
        where: eq(responses.formId, input.formId),
        orderBy: [desc(responses.submittedAt)],
      });

      const normalizedQuery = input.query?.trim().toLowerCase() ?? '';
      const parsedRows = rows.map(r => ({
        id:          r.id,
        data:        JSON.parse(r.data),
        submittedAt: r.submittedAt,
      }));

      const filteredRows = normalizedQuery
        ? parsedRows.filter((row) => matchesResponseQuery(row.data, normalizedQuery))
        : parsedRows;

      const total = filteredRows.length;
      const start = (input.page - 1) * input.pageSize;
      const items = filteredRows.slice(start, start + input.pageSize);

      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
      };
    }),

  exportCsv: authProc
    .input(ResponseExportInput)
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.creatorId, ctx.userId)),
      });
      if (!form) throw new TRPCError({ code: 'NOT_FOUND' });

      const rows = await ctx.db.query.responses.findMany({
        where: eq(responses.formId, input.formId),
        orderBy: [desc(responses.submittedAt)],
      });

      const normalizedQuery = input.query?.trim().toLowerCase() ?? '';
      const parsedRows = rows
        .map((row) => ({ submittedAt: row.submittedAt, data: JSON.parse(row.data) as Record<string, unknown> }))
        .filter((row) => !normalizedQuery || matchesResponseQuery(row.data, normalizedQuery));

      return {
        fileName: `${form.slug}-responses.csv`,
        csv: buildCsv(parsedRows),
        total: parsedRows.length,
      };
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

      const latestRows = await ctx.db.query.responses.findMany({
        where: eq(responses.formId, input.formId),
        orderBy: [desc(responses.submittedAt)],
        limit: 200,
      });

      const timelineMap = new Map<string, number>();
      for (const row of latestRows) {
        const key = row.submittedAt.toISOString().slice(0, 10);
        timelineMap.set(key, (timelineMap.get(key) ?? 0) + 1);
      }

      const timeline = Array.from(timelineMap.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([date, count]) => ({ date, count }));

      return {
        formId:         input.formId,
        totalResponses: total,
        published:      form.published,
        visibility:     form.visibility,
        archived:       form.archived,
        responseLimit:  form.responseLimit,
        expiresAt:      form.expiresAt,
        updatedAt:      form.updatedAt,
        createdAt:      form.createdAt,
        timeline,
      };
    }),
});
