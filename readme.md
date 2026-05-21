# FormVerse 🏛️✈️📚

> A cinematic form builder with three radically different experiences — a gamified Temple Run adventure, a Globe Explorer travel experience, and a mystical Library world. Built as a Turborepo monorepo with React + Vite on the frontend and a Cloudflare Workers API on the backend.

---

## 🎯 Demo Credentials

| Field | Value |
|-------|-------|
| **URL** | http://localhost:5173 (local dev) |
| **Demo Email** | `demo@formverse.io` |
| **Demo Password** | `Demo1234!` |
| **API Docs** | http://localhost:3001/docs |

> Pre-seeded demo forms available in **Explore** page (no login required to fill them).

---

## What is FormVerse?

FormVerse is a full-stack cinematic form builder with three distinct experiences:

| Experience | Vibe | Theme |
|---|---|---|
| 🏃 **Temple Run** | Gamified adventure | Choose an avatar runner, pick a legendary world, build forms with cinematic doors, ambient audio, and story intros |
| ✈️ **Globe Explorer** | Classy travel | Choose a destination, get landmark cinematics, build visa/itinerary forms with local currency and locale presets |
| 📚 **The Library** | Mystical academia | Scroll-lit aesthetics, knowledge archetypes, academic and research form templates |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Inline styles — Cinzel Decorative, Rajdhani, Exo 2 fonts |
| Backend | Hono + tRPC + Drizzle ORM on Cloudflare Workers |
| Database | Cloudflare D1 (SQLite at the edge) |
| Auth | JWT (via `jose`) |
| Email | Resend (optional — email notifications on response submit) |
| API Docs | Scalar UI at `/docs` (OpenAPI 3.1) |
| Monorepo | Turborepo + npm Workspaces |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with nav to all experiences |
| `/?share=<encoded>` | Fill a shared form (encoded payload, no backend) |
| `/?slug=<slug>` | Fill a published form via API (live responses saved to DB) |
| Pricing page | Three-tier pricing: Explorer (free), Adventurer ($12/mo), Legend ($49/mo) |
| Explore page | Public forms gallery — browse & fill community forms |
| Dashboard | Creator hub — my forms, publish toggle, view responses, analytics |

---

## Project Structure

```
Form-Builder/
├── apps/
│   ├── web/                    ← React + Vite frontend
│   │   └── src/
│   │       ├── App.tsx         ← Screen router + tRPC provider
│   │       ├── trpc.ts         ← tRPC React client setup
│   │       ├── auth.ts         ← Auth state helpers
│   │       ├── globeData.ts    ← 12 travel destinations data
│   │       ├── soundEngine.ts  ← Ambient audio synthesis
│   │       ├── themes.ts       ← World colour themes
│   │       ├── types.ts        ← Frontend types (Screen union)
│   │       └── components/
│   │           ├── HomePage.tsx          ← Landing page with nav
│   │           ├── PricingPage.tsx        ← Pricing tiers (new)
│   │           ├── ExplorePage.tsx        ← Public forms gallery (new)
│   │           ├── DashboardPage.tsx      ← Creator responses/analytics (new)
│   │           ├── SharedFormView.tsx     ← Fill form (encoded OR slug-based via API)
│   │           ├── FormBuilder.tsx        ← Main builder (17 field types)
│   │           ├── GlobeFormBuilder.tsx   ← Globe experience builder
│   │           ├── LibraryFormBuilder.tsx ← Library experience builder
│   │           └── ... (20+ other components)
│   └── api/                    ← Cloudflare Workers backend
│       ├── .dev.vars.example   ← Environment variable template
│       ├── wrangler.toml       ← Workers config + D1 binding
│       ├── migrations/
│       │   ├── 0001_initial.sql← DB schema migration
│       │   └── 0002_seed.sql   ← Demo data (3 themed forms + 28 responses)
│       └── src/
│           ├── index.ts        ← Hono app, tRPC mount, CORS, Scalar docs
│           ├── email.ts        ← Resend email notification helper
│           ├── trpc.ts         ← tRPC init + context
│           ├── schemas.ts      ← Shared Zod schemas
│           ├── auth/           ← register / login / me routes
│           ├── routers/
│           │   ├── forms.ts    ← CRUD, publish/unpublish, listPublic, getBySlug
│           │   └── responses.ts← Submit (+email alert), list, analytics
│           └── db/
│               └── schema.ts   ← Drizzle schema (users, forms, responses, rateLimits)
└── packages/
    └── shared/src/index.ts     ← Shared types
```

---

## Features

### 🏃 Temple Run Experience
- 11 Avatar Runners · 9 Themed Worlds · Cinematic door transitions
- Mission Map — scaffolds fields by purpose
- Ambient audio synthesized per world
- 17 field types, smart validation (PAN, GST, IFSC, pincode)
- Version history (name & restore snapshots)
- Import/Export `.trform.json`

### ✈️ Globe Explorer Experience
- 12 Travel Destinations with landmark cinematics
- Locale-aware fields (SSN, IBAN, CPF, PAN, TFN…)
- Country-specific regex validation
- Currency symbols per destination

### 📚 The Library Experience
- 6 mystical library worlds with unique aesthetics
- Academic form templates (research, character sheets, surveys)
- Scroll/tome visual language

### 🔐 Backend & API
- JWT Auth (register / login / `/me`)
- tRPC v11 — end-to-end type-safe, Zod-validated
- Cloudflare D1 — SQLite at the edge via Drizzle ORM
- Rate limiting — per-IP, per-form, max 5/hour (D1-backed)
- OpenAPI 3.1 + Scalar docs at `/docs`
- Email notifications via Resend (opt-in, best-effort)

### 🌐 New Pages (Hackathon sprint)
- **Pricing Page** — Explorer (free) / Adventurer ($12) / Legend ($49) with FAQ
- **Explore Page** — public forms gallery, search + filter, fill without account
- **Dashboard** — my forms list, publish toggle, copy share link, responses table, analytics

---

## Running Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the API

```bash
cd apps/api
cp .dev.vars.example .dev.vars
# Edit .dev.vars — set JWT_SECRET, IP_SALT (required), RESEND_API_KEY (optional)

# Apply DB migrations (creates local SQLite via Wrangler)
npm run db:migrate:local

# Apply seed data (demo user + 3 forms + 28 responses)
npx wrangler d1 execute formquest-db --local --file=migrations/0002_seed.sql

# Start API dev server
npx wrangler dev
# → http://localhost:3001
# → http://localhost:3001/docs  (Scalar API explorer)
```

### 3. Start the web app

```bash
cd apps/web
# Optional: create .env if API is not on default port
echo "VITE_API_URL=http://localhost:8787" > .env

npx vite
# → http://localhost:5173
```

---

## Environment Variables

**`apps/api/.dev.vars`** (local dev secrets — gitignored):

```
JWT_SECRET=change-me-to-a-long-random-secret
IP_SALT=change-me-to-another-random-string
PASSWORD_SALT=change-me-to-yet-another-random-string
RESEND_API_KEY=re_your_key_here   # optional – enables email notifications
```

**`apps/web/.env`** (optional):

```
VITE_API_URL=http://localhost:3001
```

---

## Demo Data

Three pre-seeded public forms (run `0002_seed.sql` migration):

| Form | World | Fields | Responses |
|------|-------|--------|-----------|
| Temple Quest Registration | 🏛️ Temple Run | 8 | 10 |
| Japan Visa Application | ✈️ Globe | 10 | 8 |
| Hero Character Sheet | 📚 Library | 12 | 10 |

Login with `demo@formverse.io` / `Demo1234!` to see them in the Dashboard.

---

## API Reference

Interactive docs: http://localhost:8787/docs

Key endpoints (all via tRPC at `/trpc`):

| Procedure | Auth | Description |
|-----------|------|-------------|
| `auth.register` | — | Create account |
| `auth.login` | — | Get JWT token |
| `auth.me` | ✓ | Get current user |
| `forms.create` | ✓ | Create a form |
| `forms.myForms` | ✓ | List my forms |
| `forms.update` | ✓ | Update form schema |
| `forms.setPublished` | ✓ | Publish / unpublish |
| `forms.delete` | ✓ | Delete a form |
| `forms.getBySlug` | — | Fetch published form (for respondents) |
| `forms.listPublic` | — | Browse public forms (Explore page) |
| `responses.submit` | — | Submit a response (rate-limited) |
| `responses.list` | ✓ | List responses for own form |
| `responses.analytics` | ✓ | Response counts + publish status |

---

*Built with patience, caffeine, and a healthy love of over-engineered landing pages. 🏛️*



---

## What is Form Quest?

Form Quest is a full-stack cinematic form builder with two distinct experiences:

| Experience | Vibe | Theme |
|---|---|---|
| 🏃 **Temple Run** | Gamified adventure | Choose an avatar runner, pick a legendary world (jungle, volcano, space…), build forms with cinematic doors, ambient audio, and story intros |
| ✈️ **Globe Explorer** | Classy travel | Choose a destination, get landmark cinematics, build visa/itinerary/customs forms with local currency and locale presets |

---

## Tech Stack

| Layer | Technology |
|---|---|
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
│   │           ├── ExperienceSelector.tsx← Choose Temple Run or Globe Explorer
│   │           ├── LoginScreen.tsx       ← Dual-theme login (jungle vs travel)
│   │           ├── AvatarSelector.tsx    ← Pick runner avatar (Temple Run)
│   │           ├── WorldSelector.tsx     ← Pick one of 9 worlds (Temple Run)
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

### 🏃 Temple Run Experience

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

- **Dual-theme LoginScreen** — jungle/gold for Temple Run, starfield/travel for Globe
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