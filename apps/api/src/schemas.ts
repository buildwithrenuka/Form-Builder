import { z } from 'zod';

// ── Field Types ────────────────────────────────────────────────────────────
export const FieldTypeEnum = z.enum([
  'text', 'email', 'password', 'phone', 'number',
  'date', 'time', 'url', 'currency', 'textarea',
  'checkbox', 'radio', 'select', 'range', 'rating',
  'file', 'section',
  // Legacy/backward-compatible types
  'section_divider', 'scale', 'pan', 'gst', 'ifsc', 'pincode',
]);
export type FieldType = z.infer<typeof FieldTypeEnum>;

// ── Validation Preset ──────────────────────────────────────────────────────
export const ValidationPresetEnum = z.enum([
  'none', 'letters-only', 'numbers-only', 'alphanumeric', 'pan', 'gst', 'ifsc', 'pincode', 'email', 'phone', 'url', 'custom',
]);

const FieldWidthEnum = z.enum(['full', 'half']);

// ── Single Field Schema ────────────────────────────────────────────────────
export const FieldSchema = z.object({
  id:              z.string().min(1),
  type:            FieldTypeEnum,
  label:           z.string().min(1).max(200),
  placeholder:     z.string().max(200).optional().default(''),
  required:        z.boolean().default(false),
  options:         z.array(z.string().max(100)).optional().default([]),
  min:             z.number().optional(),
  max:             z.number().optional(),
  minLength:       z.number().int().optional(),
  maxLength:       z.number().int().optional(),
  validationPreset: ValidationPresetEnum.optional(),
  customPattern:   z.string().optional(),
  customRegex:     z.string().optional(),
  errorMessage:    z.string().max(500).optional(),
  helperText:      z.string().max(500).optional(),
  helpText:        z.string().max(500).optional(),
  fieldWidth:      FieldWidthEnum.optional().default('full'),
  hidden:          z.boolean().optional().default(false),
  prefix:          z.string().max(20).optional().default(''),
  suffix:          z.string().max(20).optional().default(''),
  sectionColor:    z.string().max(50).optional().default(''),
  sectionDescription: z.string().max(500).optional().default(''),
  // Legacy/backward-compatible display fields
  halfWidth:       z.boolean().optional(),
})
.transform((field) => ({
  ...field,
  helperText: field.helperText ?? field.helpText ?? '',
  fieldWidth: field.fieldWidth ?? (field.halfWidth ? 'half' : 'full'),
  customPattern: field.customPattern ?? field.customRegex ?? '',
}));
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
