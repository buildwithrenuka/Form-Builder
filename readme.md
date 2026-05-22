# FormVerse

FormVerse is a cinematic full-stack form builder built in a Turborepo monorepo. It ships three themed creation flows, a public explore surface, a protected creator dashboard, Scalar API docs, and a Cloudflare D1-backed API with tRPC and Zod.

## Demo

| Item | Value |
|---|---|
| Web | http://localhost:5173 |
| API | http://localhost:3001 |
| Scalar docs | http://localhost:3001/docs |
| Demo email | `demo@formverse.io` |
| Demo password | `Demo1234!` |

Seeded public forms are available in Explore, and the demo account can inspect them from the creator dashboard.

## Core Features

- User registration, login, JWT sessions, and protected creator dashboard.
- Create, edit, publish, unpublish, clone, archive, and delete forms.
- Dynamic field schemas with required flags, validation rules, presets, helper text, hidden fields, and layout controls.
- Public and unlisted visibility modes with proper public access checks.
- Public response submission without login.
- Password-protected forms, custom slugs, expiry windows, and response limits.
- Response management with search, pagination, CSV export, copy-link, QR sharing, and analytics timeline cards.
- Creator and respondent email notifications through Resend.
- Landing page, pricing page, explore page, and creator dashboard.
- Scalar OpenAPI docs at `/docs`.

## Experiences

| Experience | Focus |
|---|---|
| Realm Runner | Adventure-styled cinematic builder with worlds, avatars, and story framing |
| Globe Explorer | Country-themed travel and intake form creation |
| The Library | Lore, archives, records, and world-building form creation |

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + npm workspaces |
| Frontend | React 18 + Vite + TypeScript |
| Backend | Hono + tRPC |
| Validation | Zod |
| ORM | Drizzle ORM |
| Database | Cloudflare D1 |
| Auth | JWT |
| Docs | Scalar + generated OpenAPI |
| Email | Resend |

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
        src/
            components/
            App.tsx
            auth.ts
            trpc.ts
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

### 3. Run migrations and seed demo data

```bash
cd apps/api
npm run db:migrate:local
npx wrangler d1 execute formquest-db --local --file=migrations/0002_seed.sql
npx wrangler d1 execute formquest-db --local --file=migrations/0003_gallery_seed.sql
```

### 4. Start the API

```bash
cd apps/api
npx wrangler dev
```

### 5. Start the web app

```bash
cd apps/web
echo "VITE_API_URL=http://localhost:3001" > .env
npm run dev
```

## Important Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/?slug=<slug>` | Live published form view |
| `/?share=<encoded>` | Encoded share payload form view |
| `/docs` on API | Scalar API docs |

## API Highlights

All procedures are exposed through `/trpc`.

| Procedure | Description |
|---|---|
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
| `responses.submit` | Submit a public response |
| `responses.list` | Search and paginate creator responses |
| `responses.exportCsv` | Export responses as CSV |
| `responses.analytics` | Get response analytics and timeline |

## Validation Commands

```bash
cd apps/web && npm run build
cd apps/web && npm test
cd apps/web && npm run test:e2e
```

## Notes

- Public APIs are rate limited.
- Public/unlisted/unpublished/archived visibility checks are enforced on the backend.
- Response notification emails are best-effort and depend on a valid `RESEND_API_KEY`.
| Frontend | React 18 + Vite + TypeScript |
| Styling | Inline styles — Cinzel Decorative, Rajdhani, Exo 2 fonts |
| Backend | Hono + tRPC + Drizzle ORM on Cloudflare Workers |
| Database | Cloudflare D1 (SQLite at the edge) |
| Auth | JWT (via `jose`) |
| Monorepo | Turborepo + npm Workspaces |
| Shared types | `packages/shared` |

---

## Project Structure

```
Form-Builder/
├── apps/
│   ├── web/                    ← React + Vite frontend
│   │   └── src/
│   │       ├── App.tsx         ← Screen router (home → picker → login → experience)
│   │       ├── auth.ts         ← Auth state helpers
│   │       ├── globeData.ts    ← 12 travel destinations data
│   │       ├── soundEngine.ts  ← Ambient audio synthesis
│   │       ├── themes.ts       ← World colour themes
│   │       ├── types.ts        ← Frontend types
│   │       ├── index.css       ← Keyframe animations
│   │       └── components/
│   │           ├── HomePage.tsx          ← Landing page (dual experience showcase)
│   │           ├── ExperienceSelector.tsx← Choose Realm Runner or Globe Explorer
│   │           ├── LoginScreen.tsx       ← Dual-theme login (jungle vs travel)
│   │           ├── AvatarSelector.tsx    ← Pick runner avatar (Realm Runner)
│   │           ├── WorldSelector.tsx     ← Pick one of 9 worlds (Realm Runner)
│   │           ├── WorldDoorTransition.tsx← Cinematic door opening animation
│   │           ├── WorldCinematic.tsx    ← 3-panel story intro per world
│   │           ├── StoryIntro.tsx        ← Avatar's story monologue
│   │           ├── MapPurposeScreen.tsx  ← Mission map — pick form purpose
│   │           ├── FormBuilder.tsx       ← Main form builder (17 field types)
│   │           ├── FormPreview.tsx       ← Themed full-screen preview
│   │           ├── VersionPanel.tsx      ← Version history & snapshots
│   │           ├── SharedFormView.tsx    ← Public form fill page
│   │           ├── GlobeIntro.tsx        ← Globe Explorer cinematic intro
│   │           ├── GlobeSelector.tsx     ← Pick one of 12 travel destinations
│   │           ├── CountryCinematic.tsx  ← Landmark cinematic per country
│   │           ├── GlobeFormBuilder.tsx  ← Locale-aware form builder
│   │           ├── ParticleBackground.tsx← Reusable animated background
│   │           └── TutorialScreen.tsx    ← How It Works walkthrough
│   └── api/                    ← Cloudflare Workers backend
│       ├── wrangler.toml       ← Workers config + D1 binding
│       ├── drizzle.config.ts   ← Drizzle ORM config
│       ├── migrations/
│       │   └── 0001_initial.sql← DB schema migration
│       └── src/
│           ├── index.ts        ← Hono app, tRPC mount, OpenAPI + Scalar docs
│           ├── trpc.ts         ← tRPC init + context
│           ├── context.ts      ← Request context (D1, JWT)
│           ├── schemas.ts      ← Shared Zod schemas
│           ├── auth/
│           │   ├── jwt.ts      ← JWT sign/verify with jose
│           │   └── router.ts   ← register / login / me routes
│           ├── routers/
│           │   ├── forms.ts    ← CRUD, publish/unpublish, getBySlug
│           │   └── responses.ts← Submit, list, analytics, D1 rate-limiting
│           └── db/
│               ├── schema.ts   ← Drizzle schema (users, forms, responses, rateLimits)
│               └── index.ts    ← D1 client init
└── packages/
    └── shared/
        └── src/
            └── index.ts        ← Shared types (User, FormField, FieldType, ApiResponse…)
```

---

## Features Built

### 🏃 Realm Runner Experience

- **11 Avatar Runners** — each with unique name, emoji, colour, and world-entry quote
- **9 Themed Worlds** — Jungle, Snow, Desert, Space, Underwater, Volcano, Heaven, Hell, Flower
- **Cinematic World Doors** — animated door swing-open transition into the chosen world
- **3-Panel Story Cinematics** — avatar speaks, world reacts, mission begins
- **Mission Map** — interactive purpose picker that scaffolds fields automatically
- **Ambient Soundscapes** — synthesised audio per world (jungle chirps, space drones, hellfire)
- **Form Builder** — 17 field types: text, email, phone, number, textarea, select, multi-select, checkbox, radio, date, time, rating, slider, file upload, currency, section divider, URL
- **Smart Validation** — PAN, GST, IFSC, pincode, regex — live error messages
- **Smart Collections** — drop full field groups (Bank, Address, Health, Social Links) in one click
- **Half-Width Grid** — drag fields into two-column layouts
- **Live Preview** — world-themed full-screen preview exactly as respondents see it
- **Version History** — name and publish snapshots, restore any version
- **Import / Export** — `.trform.json` format
- **Shareable Link** — public or unlisted, anyone fills in-browser, no account needed

### ✈️ Globe Explorer Experience

- **12 Travel Destinations** — India, USA, UK, Germany, Japan, Brazil, UAE, Australia, China, France, Canada, South Africa
- **Landmark Cinematics** — each country opens with capital city, landmark, and cultural intro
- **Locale-Aware Fields** — native field types per destination (PAN, SSN, IBAN, CPF, TFN…)
- **Native Validation** — country-specific regex for ID numbers
- **Currency Formatting** — ₹, $, £, €, ¥, R$, د.إ, A$, C$ per destination
- **Travel Form Templates** — visa applications, customs declarations, hotel registrations, itineraries
- **Classy Gold Aesthetic** — warm `#c9a84c` palette, Exo 2 font, no game language

### 🔐 Authentication & API

- **JWT Auth** — register, login, `/me` endpoint via `jose`
- **tRPC** — end-to-end type-safe API with Zod validation
- **Cloudflare D1** — SQLite at the edge via Drizzle ORM
- **Rate Limiting** — per-IP submission limits stored in D1
- **OpenAPI + Scalar** — auto-generated API docs at `/docs`
- **Forms CRUD** — create, read, update, delete, publish/unpublish, get by slug
- **Response Analytics** — submit, list, per-form analytics

### 🎨 UI & Visual Polish

- **Dual-theme LoginScreen** — jungle/gold for Realm Runner, starfield/travel for Globe
- **Aurora background** — radial gradient blobs + grid overlay + shooting stars
- **Runner bar** — animated 🏃 runner scrolls across the bottom of every page
- **Glitch effect** — title glitches on hover and on an interval
- **Scroll-triggered stats** — count-up animation when stats enter viewport
- **Card hover animations** — lift, glow, colour transitions on all cards
- **`card-enter` keyframe** — staggered entrance animation for grids
- **Fonts** — Cinzel Decorative (game titles), Rajdhani (game UI), Exo 2 (Globe + body)

---

## Running Locally

### Web (frontend)

```bash
cd apps/web
npx vite --port 5174
# → http://localhost:5174
```

### API (Cloudflare Workers — local dev)

```bash
cd apps/api
# Create .dev.vars from the example:
cp .dev.vars.example .dev.vars
# Fill in JWT_SECRET, IP_SALT, PASSWORD_SALT
npx wrangler dev
# → http://localhost:3001
```

> **Note:** The API requires `@cloudflare/workers-types` and Wrangler. If your npm registry blocks `@cloudflare` scoped packages, add this to `apps/api/.npmrc`:
> ```
> @cloudflare:registry=https://registry.npmjs.org/
> ```

---

## Environment Variables

**`apps/api/.dev.vars`** (local Workers dev, not committed):

```
JWT_SECRET=your-secret-here
IP_SALT=your-ip-salt-here
PASSWORD_SALT=your-password-salt-here
```

**`apps/web/.env`** (not committed):

```
VITE_API_URL=http://localhost:3001
```

---

## Database

Schema lives in `apps/api/src/db/schema.ts` (Drizzle) and `apps/api/migrations/0001_initial.sql`.

Tables: `users`, `forms`, `responses`, `rateLimits`

To apply migrations locally with Wrangler:

```bash
cd apps/api
npx wrangler d1 execute formquest-db --local --file=migrations/0001_initial.sql
```

---

## What's Next

- [ ] Connect web app to tRPC API (replace mock auth with real JWT calls)
- [ ] Deploy API to Cloudflare Workers production
- [ ] Add form response dashboard
- [ ] Add more Globe destinations
- [ ] Add form embed widget (iframe)

---

*Built with patience, caffeine, and a healthy love of over-engineered landing pages. 🏛️*


---