import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { trpcServer } from '@hono/trpc-server';
import { apiReference } from '@scalar/hono-api-reference';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { router } from './trpc';
import { createContext } from './context';
import type { Env } from './db';
import { authRouter } from './auth/router';
import { formsRouter } from './routers/forms';
import { responsesRouter } from './routers/responses';
import { adminRouter } from './routers/admin';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  CreateFormInput,
  UpdateFormInput,
  PublishFormInput,
  SubmitResponseInput,
  CloneFormInput,
  ResponseListInput,
  ResponseExportInput,
} from './schemas';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:4173',
  'http://localhost:4174',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:4174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

const DOCS_FAVICON_SVG = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ring" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#7c3aed" />
      <stop offset="52%" stop-color="#00e5ff" />
      <stop offset="100%" stop-color="#ff0080" />
    </linearGradient>
    <linearGradient id="sheet" x1="18" y1="10" x2="48" y2="54" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1a0845" />
      <stop offset="100%" stop-color="#021730" />
    </linearGradient>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <rect width="64" height="64" rx="18" fill="#060014" />
  <ellipse cx="32" cy="31.5" rx="25" ry="10" stroke="url(#ring)" stroke-width="2.2" stroke-dasharray="5 4" opacity="0.72" transform="rotate(-28 32 31.5)" />
  <rect x="18" y="12" width="28" height="38" rx="5" fill="url(#sheet)" stroke="url(#ring)" stroke-width="2.1" />
  <line x1="24" y1="22" x2="40" y2="22" stroke="rgba(255,255,255,0.92)" stroke-width="2.4" stroke-linecap="round" />
  <line x1="24" y1="30.5" x2="38" y2="30.5" stroke="rgba(255,255,255,0.58)" stroke-width="2" stroke-linecap="round" />
  <line x1="24" y1="38" x2="33.5" y2="38" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round" />
  <circle cx="48.5" cy="14.5" r="2.8" fill="#00e5ff" filter="url(#glow)" />
  <circle cx="15" cy="46.5" r="3.2" fill="#a78bfa" filter="url(#glow)" />
  <ellipse cx="15" cy="46.5" rx="7" ry="2.4" stroke="#a78bfa" stroke-width="1.1" opacity="0.45" />
  <circle cx="54" cy="24" r="3.5" fill="url(#ring)" filter="url(#glow)" />
  <circle cx="14.5" cy="18.5" r="1.5" fill="#ffd700" opacity="0.8" />
</svg>`;

const OPENAPI_TAGS = [
  {
    name: 'Auth',
    description: 'Authentication and current-session endpoints.',
  },
  {
    name: 'Forms',
    description: 'Create, publish, update, list, and delete forms.',
  },
  {
    name: 'Responses',
    description: 'Submit form responses and view response analytics.',
  },
];

const JSON_CONTENT = {
  'application/json': {
    schema: {
      type: 'object',
      additionalProperties: true,
    },
  },
};

function successResponse(description: string) {
  return {
    description,
    content: JSON_CONTENT,
  };
}

function authErrorResponse() {
  return {
    description: 'Authentication is required or the provided token is invalid.',
    content: JSON_CONTENT,
  };
}

function validationErrorResponse() {
  return {
    description: 'The request payload or query parameters failed validation.',
    content: JSON_CONTENT,
  };
}

function jsonRequestBody(description: string, schema: object, example?: Record<string, unknown>) {
  return {
    required: true,
    description,
    content: {
      'application/json': {
        schema,
        ...(example ? { example } : {}),
      },
    },
  };
}

function toOpenApiSchema(schema: Parameters<typeof zodToJsonSchema>[0]) {
  const jsonSchema = zodToJsonSchema(schema, {
    target: 'openApi3',
    $refStrategy: 'none',
  }) as Record<string, unknown>;

  const { $schema: _schema, ...openApiSchema } = jsonSchema;
  return openApiSchema;
}

const REGISTER_INPUT_SCHEMA = toOpenApiSchema(RegisterInput);
const LOGIN_INPUT_SCHEMA = toOpenApiSchema(LoginInput);
const FORGOT_PASSWORD_INPUT_SCHEMA = toOpenApiSchema(ForgotPasswordInput);
const RESET_PASSWORD_INPUT_SCHEMA = toOpenApiSchema(ResetPasswordInput);
const CREATE_FORM_INPUT_SCHEMA = toOpenApiSchema(CreateFormInput);
const UPDATE_FORM_INPUT_SCHEMA = toOpenApiSchema(UpdateFormInput);
const PUBLISH_FORM_INPUT_SCHEMA = toOpenApiSchema(PublishFormInput);
const SUBMIT_RESPONSE_INPUT_SCHEMA = toOpenApiSchema(SubmitResponseInput);
const CLONE_FORM_INPUT_SCHEMA = toOpenApiSchema(CloneFormInput);
const RESPONSE_LIST_INPUT_SCHEMA = toOpenApiSchema(ResponseListInput);
const RESPONSE_EXPORT_INPUT_SCHEMA = toOpenApiSchema(ResponseExportInput);

const REGISTER_EXAMPLE = {
  name: 'Ava Carter',
  email: 'ava@example.com',
  password: 'QuestRunner2026',
};

const LOGIN_EXAMPLE = {
  email: 'ava@example.com',
  password: 'QuestRunner2026',
};

const FORGOT_PASSWORD_EXAMPLE = {
  email: 'ava@example.com',
};

const RESET_PASSWORD_EXAMPLE = {
  token: 'reset_token_from_email',
  password: 'QuestRunner2027',
};

const CREATE_FORM_EXAMPLE = {
  title: 'Traveler Intake Form',
  description: 'Collects arrival details and destination notes.',
  worldTheme: 'globe',
};

const UPDATE_FORM_EXAMPLE = {
  id: 'form_123456',
  title: 'Traveler Intake Form',
  description: 'Updated intake form for international arrivals.',
  visibility: 'public',
  archived: false,
  slug: 'traveler-intake-form',
  responseLimit: 500,
  schema: [
    {
      id: 'fullName',
      type: 'text',
      label: 'Full name',
      required: true,
      placeholder: 'Enter your name',
      options: [],
      fieldWidth: 'full',
      hidden: false,
      prefix: '',
      suffix: '',
      sectionColor: '',
      sectionDescription: '',
      helperText: '',
      customPattern: '',
    },
  ],
  worldTheme: 'globe',
};

const PUBLISH_FORM_EXAMPLE = {
  id: 'form_123456',
  published: true,
};

const CLONE_FORM_EXAMPLE = {
  id: 'form_123456',
  title: 'Traveler Intake Form Copy',
};

const DELETE_FORM_EXAMPLE = {
  id: 'form_123456',
};

const SUBMIT_RESPONSE_EXAMPLE = {
  formId: 'form_123456',
  data: {
    fullName: 'Ava Carter',
    email: 'ava@example.com',
  },
};

const RESPONSE_LIST_EXAMPLE = {
  formId: 'form_123456',
  query: 'ava',
  page: 1,
  pageSize: 12,
};

const RESPONSE_EXPORT_EXAMPLE = {
  formId: 'form_123456',
  query: 'visa',
};

function operation(summary: string, tags: string[], description: string, options?: {
  successCode?: '200' | '201';
  successDescription?: string;
  secured?: boolean;
  requestBody?: ReturnType<typeof jsonRequestBody>;
}) {
  const successCode = options?.successCode ?? '200';
  const responses: Record<string, ReturnType<typeof successResponse>> = {
    [successCode]: successResponse(options?.successDescription ?? 'Request completed successfully.'),
    '400': validationErrorResponse(),
  };

  if (options?.secured) {
    responses['401'] = authErrorResponse();
  }

  return {
    summary,
    description,
    tags,
    ...(options?.requestBody ? { requestBody: options.requestBody } : {}),
    ...(options?.secured ? { security: [{ bearerAuth: [] }] } : {}),
    responses,
  };
}

function getAllowedOrigins(rawOrigins?: string): Set<string> {
  const values = rawOrigins
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set(values?.length ? values : DEFAULT_ALLOWED_ORIGINS);
}

// ── Root tRPC router ───────────────────────────────────────────────────────
export const appRouter = router({
  auth:      authRouter,
  forms:     formsRouter,
  responses: responsesRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

// ── Hono app (typed with Worker Bindings) ─────────────────────────────────
const app = new Hono<{ Bindings: Env }>();

app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'no-referrer');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
});

app.use('*', cors({
  origin: (origin, c) => {
    if (!origin) return '';
    const allowedOrigins = getAllowedOrigins(c.env.ALLOWED_ORIGINS);
    return allowedOrigins.has(origin) ? origin : '';
  },
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
      title: 'FormVerse API',
      version: '1.0.0',
      description: 'API reference for FormVerse. Explore authentication, form management, and response submission endpoints exposed through the backend worker. The live app runs at https://formverse-web.pages.dev, interactive docs are served from /docs, and authenticated endpoints expect a Bearer JWT returned by auth.login.',
    },
    servers: [{ url: base }],
    tags: OPENAPI_TAGS,
    paths: {
      '/trpc/auth.register': {
        post: operation('Register a new user', ['Auth'], 'Creates a FormVerse account and returns the authenticated session payload.', {
          successCode: '201',
          successDescription: 'Account created successfully.',
          requestBody: jsonRequestBody('Registration payload.', REGISTER_INPUT_SCHEMA, REGISTER_EXAMPLE),
        }),
      },
      '/trpc/auth.login': {
        post: operation('Login', ['Auth'], 'Authenticates an existing user and returns the current session payload.', {
          requestBody: jsonRequestBody('Login payload.', LOGIN_INPUT_SCHEMA, LOGIN_EXAMPLE),
        }),
      },
      '/trpc/auth.me': {
        get: operation('Get current user', ['Auth'], 'Returns the currently authenticated user profile.', {
          secured: true,
          successDescription: 'Current user profile returned successfully.',
        }),
      },
      '/trpc/auth.forgotPassword': {
        post: operation('Request password reset', ['Auth'], 'Issues a password reset email when the account exists. Always returns a generic success payload.', {
          requestBody: jsonRequestBody('Password reset request payload.', FORGOT_PASSWORD_INPUT_SCHEMA, FORGOT_PASSWORD_EXAMPLE),
        }),
      },
      '/trpc/auth.resetPassword': {
        post: operation('Reset password', ['Auth'], 'Resets the user password using a valid one-time reset token.', {
          requestBody: jsonRequestBody('Password reset submission payload.', RESET_PASSWORD_INPUT_SCHEMA, RESET_PASSWORD_EXAMPLE),
        }),
      },
      '/trpc/forms.create': {
        post: operation('Create a form', ['Forms'], 'Creates a new form draft for the authenticated user.', {
          secured: true,
          successCode: '201',
          successDescription: 'Form created successfully.',
          requestBody: jsonRequestBody('New form payload.', CREATE_FORM_INPUT_SCHEMA, CREATE_FORM_EXAMPLE),
        }),
      },
      '/trpc/forms.myForms': {
        get: operation('List my forms', ['Forms'], 'Lists the authenticated user\'s forms and drafts.', {
          secured: true,
          successDescription: 'Forms returned successfully.',
        }),
      },
      '/trpc/forms.getById': {
        get: operation('Get form by ID (owner)', ['Forms'], 'Returns a specific form owned by the authenticated user.', {
          secured: true,
          successDescription: 'Form returned successfully.',
        }),
      },
      '/trpc/forms.update': {
        post: operation('Update form schema or visibility', ['Forms'], 'Updates form title, schema, theme, or other editable metadata.', {
          secured: true,
          successDescription: 'Form updated successfully.',
          requestBody: jsonRequestBody('Form update payload.', UPDATE_FORM_INPUT_SCHEMA, UPDATE_FORM_EXAMPLE),
        }),
      },
      '/trpc/forms.setPublished': {
        post: operation('Publish or unpublish a form', ['Forms'], 'Toggles the published state of a form owned by the authenticated user.', {
          secured: true,
          successDescription: 'Form publication state updated successfully.',
          requestBody: jsonRequestBody('Publish state payload.', PUBLISH_FORM_INPUT_SCHEMA, PUBLISH_FORM_EXAMPLE),
        }),
      },
      '/trpc/forms.delete': {
        post: operation('Delete a form', ['Forms'], 'Deletes a form owned by the authenticated user.', {
          secured: true,
          successDescription: 'Form deleted successfully.',
          requestBody: jsonRequestBody('Delete payload.', {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string' },
            },
          }, DELETE_FORM_EXAMPLE),
        }),
      },
      '/trpc/forms.clone': {
        post: operation('Clone a form', ['Forms'], 'Duplicates an existing creator-owned form into a new draft copy.', {
          secured: true,
          successCode: '201',
          successDescription: 'Form cloned successfully.',
          requestBody: jsonRequestBody('Clone payload.', CLONE_FORM_INPUT_SCHEMA, CLONE_FORM_EXAMPLE),
        }),
      },
      '/trpc/forms.getBySlug': {
        get: operation('Get published form by slug', ['Forms'], 'Fetches a published form for public sharing and submissions.', {
          successDescription: 'Published form returned successfully.',
        }),
      },
      '/trpc/forms.listPublic': {
        get: operation('List public published forms', ['Forms'], 'Lists forms that have been published publicly and are visible in discovery surfaces.', {
          successDescription: 'Public forms returned successfully.',
        }),
      },
      '/trpc/responses.submit': {
        post: operation('Submit a response', ['Responses'], 'Submits a public response for a published form.', {
          successCode: '201',
          successDescription: 'Response submitted successfully.',
          requestBody: jsonRequestBody('Response submission payload.', SUBMIT_RESPONSE_INPUT_SCHEMA, SUBMIT_RESPONSE_EXAMPLE),
        }),
      },
      '/trpc/responses.list': {
        post: operation('List responses for my form', ['Responses'], 'Returns searchable, paginated submissions associated with a form owned by the authenticated user.', {
          secured: true,
          successDescription: 'Responses returned successfully.',
          requestBody: jsonRequestBody('Response list payload.', RESPONSE_LIST_INPUT_SCHEMA, RESPONSE_LIST_EXAMPLE),
        }),
      },
      '/trpc/responses.exportCsv': {
        post: operation('Export responses as CSV', ['Responses'], 'Returns CSV content for a creator-owned form response export.', {
          secured: true,
          successDescription: 'CSV export returned successfully.',
          requestBody: jsonRequestBody('CSV export payload.', RESPONSE_EXPORT_INPUT_SCHEMA, RESPONSE_EXPORT_EXAMPLE),
        }),
      },
      '/trpc/responses.analytics': {
        get: operation('Response analytics for my form', ['Responses'], 'Returns aggregate analytics for submissions tied to a form owned by the authenticated user.', {
          secured: true,
          successDescription: 'Response analytics returned successfully.',
        }),
      },
      '/trpc/admin.overview': {
        get: operation('Admin overview', ['Auth'], 'Returns admin-only platform totals and recent activity.', {
          secured: true,
          successDescription: 'Admin overview returned successfully.',
        }),
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  });
});

app.get('/favicon.svg', (c) => c.body(DOCS_FAVICON_SVG, 200, {
  'content-type': 'image/svg+xml; charset=utf-8',
  'cache-control': 'public, max-age=86400',
}));

app.get('/favicon.ico', (c) => c.redirect('/favicon.svg', 302));

// Scalar interactive API docs
app.get('/docs', apiReference({
  pageTitle: 'FormVerse API Reference',
  favicon: '/favicon.svg',
  layout: 'modern',
  showSidebar: true,
  hideDownloadButton: false,
  hideTestRequestButton: false,
  spec: {
    url: '/openapi.json',
  },
  customCss: `
    :root {
      --scalar-color-1: #f4efe2;
      --scalar-color-2: #d9c7a6;
      --scalar-color-3: #b68b3a;
      --scalar-color-accent: #d97706;
      --scalar-background-1: #100b08;
      --scalar-background-2: #18110d;
      --scalar-background-3: #241811;
      --scalar-sidebar-background-1: #120d09;
      --scalar-sidebar-item-hover-background: rgba(217, 119, 6, 0.14);
      --scalar-sidebar-color-1: #f6ecd9;
    }

    .scalar-app {
      font-family: 'Inter', sans-serif;
    }
  `,
}));

// ── Cloudflare Workers export ──────────────────────────────────────────────
export default app;
