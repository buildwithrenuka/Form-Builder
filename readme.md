# Form Quest 🏛️

> A cinematic form builder with two radically different experiences — a gamified Temple Run adventure and a classy Globe Explorer travel experience. Built as a Turborepo monorepo with React + Vite on the frontend and a Cloudflare Workers API on the backend.


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