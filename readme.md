# FormVerse

FormVerse is a cinematic full-stack form builder in a Turborepo monorepo. It combines themed form-building experiences with a Cloudflare Workers API, D1 persistence, public sharing, creator dashboards, and Scalar API docs.

## Hackathon Submission Snapshot

FormVerse turns form creation into a themed product experience instead of a plain admin tool. Builders can create, publish, protect, share, and analyze forms through cinematic flows, while respondents get clean public submission links with support for passwords, expiry, custom slugs, response limits, and optional edit access.

### What judges can verify quickly

1. Open the live web app and sign in with the demo credentials.
2. Review the creator dashboard, publishing controls, analytics, sharing links, QR sharing, and response tools.
3. Open a published form through `?slug=<slug>` and submit a response as a public user.
4. Open the live API docs and inspect the generated tRPC-backed API surface.

### Why this stands out

- Three distinct themed creation experiences instead of a single generic builder UI.
- Full-stack delivery with live deployment, real persistence, auth, sharing controls, analytics, and API docs.
- Public-form safety features including visibility rules, password protection, expiry windows, rate limiting, and single-submission protection.
- Demo-ready product surface with seeded data, demo credentials, and verifiable live links.

## Submission Copy

### One-line pitch

FormVerse is a cinematic full-stack form builder that turns form creation, sharing, and analytics into a polished product experience instead of a plain admin workflow.

### Problem

Most form builders are functionally strong but emotionally flat. They help teams collect data, but they rarely feel differentiated, memorable, or demo-worthy. For creators, the experience often becomes a sequence of generic panels, and for respondents, the final form link feels disconnected from the brand or story behind it.

### Solution

FormVerse rebuilds the form-builder experience as a themed product journey. Creators can enter one of three distinct worlds, build forms with structured controls, publish them with guardrails like visibility settings, passwords, expiry dates, and response limits, and then manage results through analytics, CSV export, and response dashboards. Respondents get clean public flows with no-login submission support, while the backend stays fully typed, documented, and production-deployed.

### Key features

- Three cinematic creation experiences: Realm Runner, Globe Explorer, and The Library.
- Protected creator dashboard with publish, unpublish, clone, archive, analytics, and response-management tools.
- Public and unlisted sharing with custom slugs, passwords, expiry dates, response limits, and optional response edits.
- Public form gallery, guided landing-page walkthrough, pricing surface, and QR-based sharing.
- Live API docs generated from the deployed backend.
- Cloudflare-backed full-stack deployment with D1 persistence, JWT auth, and typed tRPC procedures.

### What we built

We built a full monorepo application with a React frontend, a Cloudflare Workers API, a D1 database, shared types across apps, live API documentation, seeded demo data, and an end-to-end product flow from form creation to public submission to analytics review.

### How it works

1. A creator logs in and chooses a themed experience.
2. The form is created and configured with fields, validation, layout, and conditional logic.
3. The creator publishes the form with public or unlisted access, plus optional safeguards.
4. Respondents open a live link, fill the form, and submit without needing an account.
5. The creator returns to the dashboard to inspect responses, analytics, and exports.

### Tech stack summary

- Frontend: React, Vite, TypeScript.
- Backend: Hono, tRPC, Zod.
- Database: Cloudflare D1 with Drizzle ORM.
- Deployment: Cloudflare Pages and Cloudflare Workers.
- Documentation: Scalar with generated OpenAPI output.

### Demo instructions for judges

1. Open the live app at the web URL below.
2. Login with the demo credentials.
3. Inspect the dashboard and open any published form.
4. Submit a response through a public link.
5. Open the API docs and review the live backend surface.

### What makes this hackathon-ready

- It is live, deployed, and demoable right now.
- It covers both product design and backend engineering depth.
- It goes beyond CRUD by focusing on experience design, publishing controls, and public respondent flows.
- It includes documentation, seeded demo data, and a clear path for judges to verify functionality quickly.

## Common Submission Answers

### What did you build?

We built FormVerse, a full-stack cinematic form builder that combines expressive themed creation flows with real production features like authentication, publishing controls, protected public sharing, analytics, CSV export, QR sharing, and live API documentation. Instead of making form building feel like a generic admin panel, we designed it as a product experience with three distinct worlds: Realm Runner, Globe Explorer, and The Library.

### How does it work?

Creators log in, choose a themed experience, and build forms with configurable fields, validation, helper text, layout controls, and conditional logic. Once a form is ready, they can publish it publicly or as unlisted, apply safeguards like passwords, expiry dates, response limits, and optional response editing, and then share it through direct links or QR codes. Responses are stored in Cloudflare D1 and surfaced back in the creator dashboard through analytics, search, pagination, and CSV export. The backend is exposed through typed tRPC procedures and documented through live Scalar API docs.

### What problem does it solve?

Most form tools are functional but forgettable. They help users collect data, but the creation experience, the published experience, and the overall product identity often feel disconnected. FormVerse solves that by combining practical form-builder workflows with a differentiated front-end experience and a real backend system, so the product feels intentional for both creators and respondents.

### What challenges did you run into?

- Making the product feel visually distinctive without sacrificing real builder functionality.
- Keeping the frontend and backend fully connected in production across Cloudflare Pages and Workers.
- Hardening public-sharing flows with visibility checks, passwords, expiry logic, response limits, and single-submission protection.
- Fixing production issues during release, including API base resolution, CORS verification, docs favicon caching, Cloudflare auth/deploy friction, and registration rate-limit edge cases.

### What are you most proud of?

We are most proud that FormVerse is not just a design prototype or a backend demo. It is a live end-to-end product with real persistence, real publishing flows, public respondent journeys, analytics, admin tooling, API documentation, and seeded demo data. The strongest part is that the product presentation and the engineering depth both hold up under a real judge walkthrough.

### What did you learn?

We learned how much stronger a hackathon submission becomes when product design and systems engineering are treated as the same problem. We also learned a lot about deploying and debugging a real Cloudflare stack, especially around Worker configuration, Pages integration, API routing, caching behavior, and production-safe defaults.

### What is next for FormVerse?

- Collaborative multi-user form editing.
- Richer template packs and industry-specific starter forms.
- Stronger response visualization and dashboard filtering.
- Better respondent-side flows like partial saves and multi-step recovery.
- Expanded integrations for notifications, automation, and external data sync.

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

## Demo Flow

### Recommended judge path

1. Login with the demo account.
2. Open the dashboard and inspect existing forms, publish states, response counts, analytics, and sharing actions.
3. Copy a public form link or QR code and open it in a fresh session.
4. Submit a response and return to the dashboard to verify analytics and response management.
5. Open the API docs to review the live backend contract.

### Core capabilities demonstrated

- Authentication and protected creator flows.
- Draft to publish lifecycle for forms.
- Public, unlisted, and protected sharing modes.
- Response collection, analytics, filtering, and CSV export.
- API documentation generated from the deployed backend.

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

## Feature Coverage

FormVerse currently covers the main hackathon-ready product requirements end to end:

- Authenticated creator workspace with dashboard access.
- Form create, edit, clone, archive, publish, and unpublish flows.
- Public form access through slugs and encoded share links.
- Visibility controls for public and unlisted forms.
- Password protection, expiry dates, response limits, and optional response edits.
- Dynamic field configuration, validation rules, helper text, layout controls, and conditional logic.
- Response collection, search, pagination, analytics, and CSV export.
- QR sharing, public explore/gallery surface, pricing page, and admin tooling.
- Shared package for cross-app types and router contracts.

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