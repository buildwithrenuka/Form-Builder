import { Hono } from 'hono';
import { cors } from '@hono/cors';
import { trpcServer } from '@hono/trpc-server';
import { apiReference } from '@scalar/hono-api-reference';
import { router } from './trpc';
import { createContext } from './context';
import type { Env } from './db';
import { authRouter } from './auth/router';
import { formsRouter } from './routers/forms';
import { responsesRouter } from './routers/responses';

// ── Root tRPC router ───────────────────────────────────────────────────────
export const appRouter = router({
  auth:      authRouter,
  forms:     formsRouter,
  responses: responsesRouter,
});

export type AppRouter = typeof appRouter;

// ── Hono app (typed with Worker Bindings) ─────────────────────────────────
const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', '*'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// tRPC handler
app.use('/trpc/*', trpcServer({
  router: appRouter,
  createContext: (_opts, c) => createContext(c as any),
}));

// OpenAPI spec
app.get('/openapi.json', (c) => {
  const base = new URL(c.req.url).origin;
  return c.json({
    openapi: '3.1.0',
    info: {
      title: 'Form Quest API',
      version: '1.0.0',
      description: 'SaaS Form Builder API — tRPC + Zod + Drizzle + D1',
    },
    servers: [{ url: base }],
    paths: {
      '/trpc/auth.register':       { post: { summary: 'Register a new user',                  tags: ['Auth'] } },
      '/trpc/auth.login':          { post: { summary: 'Login',                                tags: ['Auth'] } },
      '/trpc/auth.me':             { get:  { summary: 'Get current user',                     tags: ['Auth'] } },
      '/trpc/forms.create':        { post: { summary: 'Create a form',                        tags: ['Forms'] } },
      '/trpc/forms.myForms':       { get:  { summary: 'List my forms',                        tags: ['Forms'] } },
      '/trpc/forms.getById':       { get:  { summary: 'Get form by ID (owner)',               tags: ['Forms'] } },
      '/trpc/forms.update':        { post: { summary: 'Update form schema/visibility',        tags: ['Forms'] } },
      '/trpc/forms.setPublished':  { post: { summary: 'Publish or unpublish a form',          tags: ['Forms'] } },
      '/trpc/forms.delete':        { post: { summary: 'Delete a form',                        tags: ['Forms'] } },
      '/trpc/forms.getBySlug':     { get:  { summary: 'Get published form by slug (public)',  tags: ['Forms'] } },
      '/trpc/forms.listPublic':    { get:  { summary: 'List all public published forms',      tags: ['Forms'] } },
      '/trpc/responses.submit':    { post: { summary: 'Submit a response (no auth required)', tags: ['Responses'] } },
      '/trpc/responses.list':      { get:  { summary: 'List responses for my form',           tags: ['Responses'] } },
      '/trpc/responses.analytics': { get:  { summary: 'Response analytics for my form',      tags: ['Responses'] } },
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  });
});

// Scalar interactive API docs
app.get('/docs', apiReference({ spec: { url: '/openapi.json' } }));

// ── Cloudflare Workers export ──────────────────────────────────────────────
export default app;
