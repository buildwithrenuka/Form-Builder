import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ── Users ──────────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id:           text('id').primaryKey(),
  name:         text('name').notNull(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
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
