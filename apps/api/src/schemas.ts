import { z } from 'zod';

// ── Field Types ────────────────────────────────────────────────────────────
export const FieldTypeEnum = z.enum([
  'text', 'email', 'phone', 'number', 'textarea',
  'select', 'radio', 'checkbox', 'rating', 'date',
  'url', 'currency', 'file', 'section_divider', 'scale',
  'pan', 'gst', 'ifsc', 'pincode',
]);
export type FieldType = z.infer<typeof FieldTypeEnum>;

// ── Validation Preset ──────────────────────────────────────────────────────
export const ValidationPresetEnum = z.enum([
  'none', 'pan', 'gst', 'ifsc', 'pincode', 'email', 'phone', 'url', 'custom',
]);

// ── Single Field Schema ────────────────────────────────────────────────────
export const FieldSchema = z.object({
  id:              z.string().min(1),
  type:            FieldTypeEnum,
  label:           z.string().min(1).max(200),
  placeholder:     z.string().max(200).optional(),
  required:        z.boolean().default(false),
  halfWidth:       z.boolean().default(false),
  options:         z.array(z.string().max(100)).optional(),
  min:             z.number().optional(),
  max:             z.number().optional(),
  minLength:       z.number().int().optional(),
  maxLength:       z.number().int().optional(),
  validationPreset: ValidationPresetEnum.optional(),
  customRegex:     z.string().optional(),
  helpText:        z.string().max(500).optional(),
});
export type FieldSchema = z.infer<typeof FieldSchema>;

// ── Form Schema (array of fields) ─────────────────────────────────────────
export const FormFieldsSchema = z.array(FieldSchema);

// ── Auth ───────────────────────────────────────────────────────────────────
export const RegisterInput = z.object({
  name:     z.string().min(2).max(60).trim(),
  email:    z.string().email().toLowerCase(),
  password: z.string().min(6).max(128),
});

export const LoginInput = z.object({
  email:    z.string().email().toLowerCase(),
  password: z.string().min(1),
});

// ── Form CRUD ──────────────────────────────────────────────────────────────
export const CreateFormInput = z.object({
  title:       z.string().min(1).max(200).trim(),
  description: z.string().max(1000).optional(),
  worldTheme:  z.string().max(50).optional(),
});

export const UpdateFormInput = z.object({
  id:          z.string(),
  title:       z.string().min(1).max(200).trim().optional(),
  description: z.string().max(1000).optional(),
  visibility:  z.enum(['public', 'unlisted']).optional(),
  schema:      FormFieldsSchema.optional(),
  worldTheme:  z.string().max(50).optional(),
});

export const PublishFormInput = z.object({
  id:        z.string(),
  published: z.boolean(),
});

// ── Response Submission ────────────────────────────────────────────────────
export const SubmitResponseInput = z.object({
  formId: z.string(),
  data:   z.record(z.string(), z.unknown()),
});
