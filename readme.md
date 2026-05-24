# FormVerse

FormVerse is a cinematic, full-stack form builder in a Turborepo monorepo. It combines themed form-building experiences with a Cloudflare Workers API, D1 persistence, public sharing, creator dashboards, and Scalar API docs.

## Hackathon Submission Snapshot

FormVerse turns form creation into a themed product experience instead of a plain admin tool. Builders can create, publish, protect, share, and analyze forms through cinematic flows, while respondents get clean public submission links with support for passwords, expiry, custom slugs, response limits, and optional edit access.


### Why This Stands Out

- Three distinct themed creation experiences instead of a single generic builder UI.
- Full-stack delivery with live deployment, real persistence, auth, sharing controls, analytics, and API docs.
- Public-form safety features including visibility rules, password protection, expiry windows, rate limiting, and single-submission protection.
- A demo-ready product surface with seeded data, demo credentials, and verifiable live links.

---

### Problem

Most form builders are functionally strong but emotionally flat. They help teams collect data, but they rarely feel differentiated, memorable, or demo-worthy. For creators, the experience often becomes a sequence of generic panels; for respondents, the final form link feels disconnected from the brand or story behind it.

### Solution

FormVerse rebuilds the form-builder experience as a themed product journey. Creators can enter one of three distinct worlds, build forms with structured controls, publish them with guardrails like visibility settings, passwords, expiry dates, and response limits, and then manage results through analytics, CSV export, response dashboards, paid public submissions, and premium creator-plan checkout. Respondents get clean public flows with no-login submission support, optional Razorpay payment before submit, while the backend stays fully typed, documented, and production-deployed.

### Key Features

- Three cinematic creation experiences: Realm Runner, Globe Explorer, and The Library.
- Protected creator dashboard with publish, unpublish, clone, archive, analytics, and response-management tools.
- Public and unlisted sharing with custom slugs, passwords, expiry dates, response limits, and optional response edits.
- Optional paid public forms with Razorpay order creation and payment verification before response submission.
- Premium creator checkout for Adventurer and Legend plans from the landing-page pricing flow.
- Public form gallery, guided landing-page walkthrough, pricing surface, and QR-based sharing.
- Live API docs generated from the deployed backend.
- Cloudflare-backed, full-stack deployment with D1 persistence, JWT auth, and typed tRPC procedures.

### What We Built

We built a full monorepo application with a React frontend, a Cloudflare Workers API, a D1 database, shared types across apps, live API documentation, seeded demo data, and an end-to-end product flow from form creation to public submission to analytics review.

### How It Works

1. A creator logs in and chooses a themed experience.
2. The form is created and configured with fields, validation, layout, conditional logic, and optional payment requirements.
3. The creator publishes the form with public or unlisted access, plus optional safeguards.
4. Respondents open a live link, complete payment if the form requires it, and submit without needing an account.
5. The creator can also upgrade through the premium pricing flow for platform plans.
6. The creator returns to the dashboard to inspect responses, analytics, and exports.

### Tech Stack Summary

- **Frontend:** React, Vite, TypeScript
- **Backend:** Hono, tRPC, Zod
- **Database:** Cloudflare D1 with Drizzle ORM
- **Deployment:** Cloudflare Pages and Cloudflare Workers
- **Documentation:** Scalar with generated OpenAPI output

### Demo Instructions for Judges

1. Open the live app at the URL below.
2. Log in with the demo credentials.
3. Inspect the dashboard and open any published form.
4. Submit a response through a public link.
5. Open the API docs and review the live backend surface.



## Common Submission Answers

### What Did You Build?

We built FormVerse — a full-stack cinematic form builder that combines expressive themed creation flows with real production features: authentication, publishing controls, protected public sharing, analytics, CSV export, QR sharing, and live API documentation. Instead of making form building feel like a generic admin panel, we designed it as a product experience with three distinct worlds: Realm Runner, Globe Explorer, and The Library.

### How Does It Work?

Creators log in, choose a themed experience, and build forms with configurable fields, validation, helper text, layout controls, and conditional logic. Once a form is ready, they can publish it publicly or as unlisted, apply safeguards like passwords, expiry dates, response limits, and optional response editing, and share it through direct links or QR codes. Responses are stored in Cloudflare D1 and surfaced back in the creator dashboard through analytics, search, pagination, and CSV export. The backend is exposed through typed tRPC procedures and documented via live Scalar API docs.

### What Problem Does It Solve?

Most form tools are functional but forgettable. The creation experience, the published experience, and the overall product identity often feel disconnected. FormVerse addresses this by combining practical form-builder workflows with a differentiated frontend experience and a real backend system, so the product feels intentional for both creators and respondents.

### What Challenges Did We Run Into?

- Making the product feel visually distinctive without sacrificing real builder functionality.
- Keeping the frontend and backend fully connected in production across Cloudflare Pages and Workers.
- Hardening public-sharing flows with visibility checks, passwords, expiry logic, response limits, and single-submission protection.
- Integrating Razorpay cleanly for both public paid-form submissions and authenticated creator-plan checkout.
- Fixing production issues during release, including API base resolution, CORS verification, docs favicon caching, Cloudflare auth/deploy friction, and registration rate-limit edge cases.

### What Are We Most Proud Of?

FormVerse is not just a design prototype or a backend demo — it is a live, end-to-end product with real persistence, real publishing flows, public respondent journeys, analytics, admin tooling, API documentation, and seeded demo data.
### What Did We Learn?

We learned how much stronger a hackathon submission becomes when product design and systems engineering are treated as the same problem. We also deepened our understanding of deploying and debugging a real Cloudflare stack, particularly around Worker configuration, Pages integration, API routing, caching behavior, and production-safe defaults.

### What Is Next for FormVerse?

- Collaborative, multi-user form editing.
- Richer template packs and industry-specific starter forms.
- Stronger response visualization and dashboard filtering.
- Improved respondent-side flows such as partial saves and multi-step recovery.
- Expanded integrations for notifications, automation, and external data sync.

---

## Live Deployment

| Surface  | URL |
|----------|-----|
| Web app  | https://formverse-web.pages.dev |
| API      | https://formverse-api.renuka-khirwadkarr.workers.dev |
| API docs | https://formverse-api.renuka-khirwadkarr.workers.dev/docs |

## Demo Credentials

| Item          | Value              |
|---------------|--------------------|
| Demo email    | `demo@formverse.io` |
| Demo password | `Demo1234!`        |

---

## Product Highlights

- Three themed creation experiences: Realm Runner, Globe Explorer, and The Library.
- Protected creator dashboard with form CRUD, publishing, sharing, analytics, and response management.
- Public and unlisted sharing flows with password protection, expiry dates, custom slugs, and response limits.
- Single-submission protection per browser for shared forms, with optional creator-controlled response editing.
- Paid public forms powered by Razorpay with server-side order verification before storing a response.
- Premium pricing flow with creator checkout for Adventurer and Legend plans.
- Creator and respondent email notifications through Resend.
- Scalar OpenAPI docs generated from the live backend.

## Demo Flow

### Recommended Judge Path

1. Log in with the demo account.
2. Open the dashboard and inspect existing forms, publish states, response counts, analytics, and sharing actions.
3. Copy a public form link or QR code and open it in a fresh session.
4. Submit a response, then return to the dashboard to verify analytics and response management.
5. Open the API docs to review the live backend contract.

### Core Capabilities Demonstrated

- Authentication and protected creator flows.
- Draft-to-publish lifecycle for forms.
- Public, unlisted, and protected sharing modes.
- Response collection, analytics, filtering, and CSV export.
- API documentation generated from the deployed backend.

---

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
| Payments | Razorpay |
| Docs | Scalar + generated OpenAPI |
| Email | Resend |

## Experiences

| Experience     | Focus |
|----------------|-------|
| Realm Runner   | Adventure-styled cinematic builder with worlds, avatars, and story framing |
| Globe Explorer | Country-themed travel and intake form creation |
| The Library    | Lore, archives, records, and world-building form creation |

---

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

---

## Local Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Secrets

```bash
cd apps/api
cp .dev.vars.example .dev.vars
```

Set at least the following values in `apps/api/.dev.vars`:

```env
JWT_SECRET=change-me-to-a-long-random-secret
IP_SALT=change-me-to-another-random-string
PASSWORD_SALT=change-me-to-yet-another-random-string
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RESEND_API_KEY=re_your_key_here
```

Razorpay is used in two places: paid public form submissions and creator-plan checkout from the premium pricing flow. Local development should use test-mode keys. Production should use live keys stored as Cloudflare Worker secrets.

### 3. Run local migrations

```bash
cd apps/api
npm run db:migrate:local
```

`db:migrate:local` applies the full migration chain in `apps/api/migrations`, including seeded demo data and later schema updates. Do not manually re-run those files afterward unless you first reset the local D1 state.

### 4. Start the API

```bash
npm run dev:api
```

The API dev server runs on `http://localhost:3001`.

### 5. Start the Web App

```bash
cd apps/web
echo "VITE_API_URL=http://localhost:3001" > .env
cd ../..
npm run dev:web
```

The web app runs on `http://localhost:5173` by default.

---

## Deployment Workflow

### Apply Production Migrations

```bash
cd apps/api
npm run db:migrate:prod
```

This script uses `--remote` explicitly so production migrations cannot be accidentally applied to the local D1 database.

### Deploy the API Worker

```bash
cd apps/api
npx wrangler deploy --env production
```

Before deploying payment or email flows to production, make sure the Worker has the required secrets:

```bash
cd apps/api
printf '%s' "$JWT_SECRET" | npx wrangler secret put JWT_SECRET --env production
printf '%s' "$RESEND_API_KEY" | npx wrangler secret put RESEND_API_KEY --env production
printf '%s' "$RAZORPAY_KEY_ID" | npx wrangler secret put RAZORPAY_KEY_ID --env production
printf '%s' "$RAZORPAY_KEY_SECRET" | npx wrangler secret put RAZORPAY_KEY_SECRET --env production
```

You can confirm the production secret inventory with:

```bash
cd apps/api
npx wrangler secret list --env production
```

### Build and deploy the web app

```bash
cd apps/web
VITE_API_URL=https://formverse-api.renuka-khirwadkarr.workers.dev npm run build
npx wrangler pages deploy dist --project-name formverse-web
```

---

## Important Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/?screen=premiumPayment` | Creator premium checkout entry |
| `/?slug=<slug>` | Live published form view |
| `/?share=<encoded>` | Encoded share payload form view |
| `/docs` on API | Scalar API docs |

---

## Feature Coverage

FormVerse covers the main hackathon-ready product requirements end to end:

- Authenticated creator workspace with dashboard access.
- Form create, edit, clone, archive, publish, and unpublish flows.
- Public form access through slugs and encoded share links.
- Visibility controls for public and unlisted forms.
- Password protection, expiry dates, response limits, and optional response edits.
- Optional paid-form collection with Razorpay checkout and backend payment verification.
- Dynamic field configuration, validation rules, helper text, layout controls, and conditional logic.
- Response collection, search, pagination, analytics, and CSV export.
- Premium creator-plan checkout, QR sharing, public explore/gallery surface, pricing page, and admin tooling.
- Shared package for cross-app types and router contracts.

---

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
| `billing.createCreatorPlanOrder` | Create a Razorpay order for a creator premium plan |
| `billing.verifyCreatorPlanPayment` | Verify a creator premium plan payment after Razorpay checkout |
| `responses.createPaymentOrder` | Create a Razorpay order for a paid public form |
| `responses.submit` | Submit or update a public response when edits are allowed |
| `responses.list` | Search and paginate creator responses |
| `responses.exportCsv` | Export responses as CSV |
| `responses.analytics` | Get response analytics and timeline |

---

## Validation Commands

```bash
npm run build
npm run test:web
npm run test:e2e
npm run test:preview-videos
```

For local end-to-end runs, ensure both `npm run dev:api` and `npm run dev:web` are already running; otherwise Playwright will fail with connection or API fetch errors.

---

## Notes

- Public APIs are rate-limited by IP; duplicate shared-form submissions are tracked per browser respondent token.
- Public, unlisted, unpublished, and archived visibility checks are enforced on the backend.
- Paid forms and premium creator checkout both require valid `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` bindings on the API Worker.
- Response notification emails are best-effort and depend on a valid `RESEND_API_KEY`.
- Cloudflare Workers rejected PBKDF2 iteration counts above `100000` in production, so auth hashing is tuned for that runtime.
