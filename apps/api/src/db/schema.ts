import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ── Users ──────────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id:           text('id').primaryKey(),
  name:         text('name').notNull(),
  email:        text('email').notNull().unique(),
  role:         text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  creatorPlanId: text('creator_plan_id', { enum: ['adventurer', 'legend'] }),
  creatorPlanActivatedAt: integer('creator_plan_activated_at', { mode: 'timestamp' }),
  creatorPlanPaymentId: text('creator_plan_payment_id'),
  creatorPlanOrderId: text('creator_plan_order_id'),
  passwordHash: text('password_hash').notNull(),
  resetTokenHash: text('reset_token_hash'),
  resetTokenExpiresAt: integer('reset_token_expires_at', { mode: 'timestamp' }),
  createdAt:    integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ── Forms ──────────────────────────────────────────────────────────────────
export const forms = sqliteTable('forms', {
  id:          text('id').primaryKey(),
  creatorId:   text('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clonedFromId: text('cloned_from_id'),
  title:       text('title').notNull(),
  description: text('description'),
  slug:        text('slug').notNull().unique(),
  // 'public' | 'unlisted'
  visibility:  text('visibility', { enum: ['public', 'unlisted'] }).notNull().default('unlisted'),
  published:   integer('published', { mode: 'boolean' }).notNull().default(false),
  archived:    integer('archived', { mode: 'boolean' }).notNull().default(false),
  expiresAt:   integer('expires_at', { mode: 'timestamp' }),
  responseLimit: integer('response_limit'),
  accessPasswordHash: text('access_password_hash'),
  allowResponseEdits: integer('allow_response_edits', { mode: 'boolean' }).notNull().default(false),
  paymentConfig: text('payment_config'),
  // JSON array of FieldSchema
  schema:      text('schema').notNull().default('[]'),
  worldTheme:  text('world_theme'),
  createdAt:   integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ── Responses ──────────────────────────────────────────────────────────────
export const responses = sqliteTable('responses', {
  id:          text('id').primaryKey(),
  formId:      text('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  // JSON object: { fieldId: value }
  data:        text('data').notNull(),
  respondentTokenHash: text('respondent_token_hash'),
  paymentOrderId: text('payment_order_id'),
  paymentId:   text('payment_id'),
  paymentAmount: integer('payment_amount'),
  paymentCurrency: text('payment_currency'),
  // sha256 hash of IP for rate limiting (no raw IP stored)
  ipHash:      text('ip_hash'),
  submittedAt: integer('submitted_at', { mode: 'timestamp' }).notNull(),
});

// ── Rate Limits (D1-backed, replaces in-memory map) ──────────────────────
export const rateLimits = sqliteTable('rate_limits', {
  id:        text('id').primaryKey(),
  key:       text('key').notNull(),
  timestamp: integer('timestamp').notNull(),
});

export type User      = typeof users.$inferSelect;
export type Form      = typeof forms.$inferSelect;
export type Response  = typeof responses.$inferSelect;
