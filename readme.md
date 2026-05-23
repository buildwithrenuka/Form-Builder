# FormVerse

FormVerse is a cinematic full-stack form builder in a Turborepo monorepo. It combines themed form-building experiences with a Cloudflare Workers API, D1 persistence, public sharing, creator dashboards, and Scalar API docs.

## Live Deployment

| Surface | URL |
| --- | --- |
| Web app | https://formverse-web.pages.dev |
| API | https://formverse-api.renuka-khirwadkarr.workers.dev |
| API docs | https://formverse-api.renuka-khirwadkarr.workers.dev/docs |

## Demo Credentials

| Item | Value |
| --- | --- |
| Demo email | `demo@formverse.io` |
| Demo password | `Demo1234!` |

## Product Highlights

- Three themed creation experiences: Realm Runner, Globe Explorer, and The Library.
- Protected creator dashboard with form CRUD, publishing, sharing, analytics, and response management.
- Public and unlisted sharing flows with password protection, expiry dates, custom slugs, and response limits.
- Single-submission protection per browser for shared forms, with optional creator-controlled response editing.
- Creator and respondent email notifications through Resend.
- Scalar OpenAPI docs generated from the live backend.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Monorepo | Turborepo + npm workspaces |
| Frontend | React 18 + Vite + TypeScript |
| Backend | Hono + tRPC |
| Validation | Zod |
| ORM | Drizzle ORM |
| Database | Cloudflare D1 |
| Auth | JWT |
| Docs | Scalar + generated OpenAPI |
| Email | Resend |

## Experiences

| Experience | Focus |
| --- | --- |
| Realm Runner | Adventure-styled cinematic builder with worlds, avatars, and story framing |
| Globe Explorer | Country-themed travel and intake form creation |
| The Library | Lore, archives, records, and world-building form creation |

## Project Structure

```text
apps/
    api/
        migrations/
        src/
            auth/
            db/
            routers/
            index.ts
    web/
        public/
        src/
            components/
            test/
            utils/
packages/
    shared/
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API secrets

```bash
cd apps/api
cp .dev.vars.example .dev.vars
```

Set at least these values in `apps/api/.dev.vars`:

```env
JWT_SECRET=change-me-to-a-long-random-secret
IP_SALT=change-me-to-another-random-string
PASSWORD_SALT=change-me-to-yet-another-random-string
RESEND_API_KEY=re_your_key_here
```

### 3. Run local migrations

```bash
cd apps/api
npm run db:migrate:local
```

`db:migrate:local` applies the full migration chain in `apps/api/migrations`, including the seeded demo data and later schema updates. Do not manually re-run those same files afterward unless you first reset the local D1 state.

### 4. Start the API

```bash
npm run dev:api
```

The API dev server runs on `http://localhost:3001`.

### 5. Start the web app

```bash
cd apps/web
echo "VITE_API_URL=http://localhost:3001" > .env
cd ../..
npm run dev:web
```

The web app runs on `http://localhost:5173` by default.

## Deployment Workflow

### Apply production migrations

```bash
cd apps/api
npm run db:migrate:prod
```

This script now uses `--remote` explicitly so production migrations cannot be applied to the local D1 database by mistake.

### Deploy the API worker

```bash
cd apps/api
npx wrangler deploy --env production
```

### Build and deploy the web app

```bash
cd apps/web
VITE_API_URL=https://formverse-api.renuka-khirwadkarr.workers.dev npm run build
npx wrangler pages deploy dist --project-name formverse-web
```

## Important Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/?slug=<slug>` | Live published form view |
| `/?share=<encoded>` | Encoded share payload form view |
| `/docs` on API | Scalar API docs |

## API Highlights

All procedures are exposed through `/trpc`.

| Procedure | Description |
| --- | --- |
| `auth.register` | Create an account |
| `auth.login` | Login and receive session/token |
| `auth.me` | Fetch current user |
| `forms.create` | Create a draft form |
| `forms.update` | Update metadata, schema, visibility, slug, limits, password, archive state |
| `forms.clone` | Duplicate an existing form into a new draft |
| `forms.setPublished` | Publish or unpublish a form |
| `forms.myForms` | List creator-owned forms |
| `forms.getBySlug` | Fetch a public/shared form |
| `forms.listPublic` | List public explore forms |
| `responses.submit` | Submit or update a public response when edits are allowed |
| `responses.list` | Search and paginate creator responses |
| `responses.exportCsv` | Export responses as CSV |
| `responses.analytics` | Get response analytics and timeline |

## Validation Commands

```bash
npm run build
npm run test:web
npm run test:e2e
npm run test:preview-videos
```

For local end-to-end runs, make sure both `npm run dev:api` and `npm run dev:web` are already running, otherwise Playwright will fail with connection errors or API fetch errors.

## Notes

- Public APIs are rate limited by IP, while duplicate shared-form submissions are tracked per browser respondent token.
- Public, unlisted, unpublished, and archived visibility checks are enforced on the backend.
- Response notification emails are best-effort and depend on a valid `RESEND_API_KEY`.
- Cloudflare Workers rejected PBKDF2 iteration counts above `100000` in production, so auth hashing is tuned for that runtime.