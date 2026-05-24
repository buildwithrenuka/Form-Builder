import { z } from 'zod';

// ── Field Types ────────────────────────────────────────────────────────────
export const FieldTypeEnum = z.enum([
  'text', 'email', 'password', 'phone', 'number',
  'date', 'time', 'url', 'currency', 'textarea',
  'checkbox', 'radio', 'select', 'multi_select', 'range', 'rating',
  'file', 'section', 'page_break',
  // Legacy/backward-compatible types
  'section_divider', 'scale', 'pan', 'gst', 'ifsc', 'pincode',
]);
export type FieldType = z.infer<typeof FieldTypeEnum>;

// ── Validation Preset ──────────────────────────────────────────────────────
export const ValidationPresetEnum = z.enum([
  'none', 'letters-only', 'numbers-only', 'alphanumeric', 'pan', 'gst', 'ifsc', 'pincode', 'email', 'phone', 'url', 'custom',
]);

export const ConditionalOperatorEnum = z.enum([
  'equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty',
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
  conditionalParentId: z.string().optional().default(''),
  conditionalOperator: ConditionalOperatorEnum.optional().default('equals'),
  conditionalValue: z.string().max(200).optional().default(''),
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
  conditionalParentId: field.conditionalParentId ?? '',
  conditionalOperator: field.conditionalOperator ?? 'equals',
  conditionalValue: field.conditionalValue ?? '',
}));
export type FieldSchema = z.infer<typeof FieldSchema>;

// ── Form Schema (array of fields) ─────────────────────────────────────────
export const FormFieldsSchema = z.array(FieldSchema);

export const FormPaymentConfigSchema = z.object({
  enabled: z.boolean().default(true),
  amount: z.number().int().min(100).max(100000000),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()).default('INR'),
  description: z.string().trim().max(120).optional(),
});
export type FormPaymentConfig = z.infer<typeof FormPaymentConfigSchema>;

// ── Auth ───────────────────────────────────────────────────────────────────
export const RegisterInput = z.object({
  name:     z.string().min(2).max(60).trim(),
  email:    z.string().email().toLowerCase(),
  password: z.string()
    .min(10, 'Password must be at least 10 characters long.')
    .max(128)
    .regex(/[a-z]/, 'Password must include a lowercase letter.')
    .regex(/[A-Z]/, 'Password must include an uppercase letter.')
    .regex(/\d/, 'Password must include a number.'),
});

export const LoginInput = z.object({
  email:    z.string().email().toLowerCase(),
  password: z.string().min(1).max(128),
});

export const ForgotPasswordInput = z.object({
  email: z.string().email().toLowerCase(),
});

export const ResetPasswordInput = z.object({
  token: z.string().min(20).max(256),
  password: z.string()
    .min(10, 'Password must be at least 10 characters long.')
    .max(128)
    .regex(/[a-z]/, 'Password must include a lowercase letter.')
    .regex(/[A-Z]/, 'Password must include an uppercase letter.')
    .regex(/\d/, 'Password must include a number.'),
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
  archived:    z.boolean().optional(),
  slug:        z.string().min(3).max(60).optional(),
  expiresAt:   z.string().datetime().nullable().optional(),
  responseLimit: z.number().int().min(1).max(100000).nullable().optional(),
  accessPassword: z.string().min(4).max(128).nullable().optional(),
  allowResponseEdits: z.boolean().optional(),
  paymentConfig: FormPaymentConfigSchema.nullable().optional(),
  schema:      FormFieldsSchema.optional(),
  worldTheme:  z.string().max(50).optional(),
});

export const PublishFormInput = z.object({
  id:        z.string(),
  published: z.boolean(),
});

// ── Response Submission ────────────────────────────────────────────────────
export const ResponsePaymentInput = z.object({
  orderId: z.string().min(1).max(128),
  paymentId: z.string().min(1).max(128),
  signature: z.string().min(1).max(256),
});

export const SubmitResponseInput = z.object({
  formId: z.string(),
  accessPassword: z.string().max(128).optional(),
  respondentToken: z.string().min(16).max(256).optional(),
  payment: ResponsePaymentInput.optional(),
  data:   z.record(z.string(), z.unknown()),
});

export const CreatePaymentOrderInput = z.object({
  formId: z.string(),
  accessPassword: z.string().max(128).optional(),
  respondentToken: z.string().min(16).max(256).optional(),
  data: z.record(z.string(), z.unknown()),
});

export const CreatorPlanIdEnum = z.enum(['adventurer', 'legend']);
export type CreatorPlanId = z.infer<typeof CreatorPlanIdEnum>;

export const CreateCreatorPlanOrderInput = z.object({
  planId: CreatorPlanIdEnum,
});

export const VerifyCreatorPlanPaymentInput = z.object({
  planId: CreatorPlanIdEnum,
  payment: ResponsePaymentInput,
});

export const CloneFormInput = z.object({
  id: z.string(),
  title: z.string().min(1).max(200).trim().optional(),
});

export const ResponseListInput = z.object({
  formId: z.string(),
  query: z.string().trim().max(120).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
});

export const ResponseExportInput = z.object({
  formId: z.string(),
  query: z.string().trim().max(120).optional(),
});
