# ZoneX — AI Product Photography & Model Studio

> Generate professional AI product photos and realistic AI model photoshoots for your e-commerce brand — without a physical photoshoot.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.local.example .env.local

# 3. Fill in your API keys (see section below)
# Then run:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app runs in **mock mode** by default, so no API keys are required to explore the UI.

---

## How to Plug In Real API Keys

### Step 1 — Enable real mode
In `.env.local`, change:
```env
NEXT_PUBLIC_MOCK_MODE=false
```

### Step 2 — fal.ai (Image Generation)
1. Sign up at [https://fal.ai](https://fal.ai)
2. Create an API key at `Settings → API Keys`
3. Add to `.env.local`:
   ```env
   FAL_KEY=your-fal-key-here
   ```

**Models used:**
| Model | Use case | Cost |
|---|---|---|
| `fal-ai/flux-pro/v1.1` | Product photo backgrounds | ~$0.04/image |
| `fal-ai/flux-pro/kontext` | AI model with product | ~$0.05/image |
| `fal-ai/imageutils/rembg` | Background removal | ~$0.001/image |
| `fal-ai/esrgan` | 4× upscaling | ~$0.01/image |

> All FLUX Pro models on fal.ai include **commercial usage rights**.

### Step 3 — Clerk (Authentication)
1. Sign up at [https://clerk.com](https://clerk.com)
2. Create a new application
3. Copy your keys from the Clerk dashboard:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   ```

### Step 4 — Neon Postgres (Database)
1. Sign up at [https://neon.tech](https://neon.tech) (free tier: 512 MB)
2. Create a project and copy the connection string:
   ```env
   DATABASE_URL=postgres://user:password@ep-xxx.neon.tech/neondb?sslmode=require
   ```
3. Run the database migration:
   ```bash
   npx drizzle-kit push
   ```

### Step 5 — Vercel Blob (File Storage)
1. Deploy to Vercel or run `vercel link` locally
2. Create a Blob store at `vercel.com/storage/blob`
3. Add the token:
   ```env
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
   ```

### Step 6 — Stripe (Payments — optional for MVP)
1. Sign up at [https://stripe.com](https://stripe.com)
2. Use **test keys** during development
3. Add to `.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Persistent sidebar layout, Server Components, Server Actions |
| Styling | Tailwind CSS + custom design system | Full control, no runtime overhead |
| Auth | Clerk | Zero-config OAuth, scales to teams |
| Image Gen | fal.ai + FLUX 1.1 Pro | Best photorealism, commercial license, ~$0.04/image |
| Background Removal | fal.ai rembg | SAM-based, fast, API-native |
| Database | Neon Postgres + Drizzle ORM | Type-safe, serverless-friendly |
| Storage | Vercel Blob | Zero-config with Next.js |
| Payments | Stripe | Industry standard |

---

## Project Structure

```
app/
├── (dashboard)/
│   ├── layout.tsx          ← Sidebar + shell
│   └── dashboard/
│       ├── page.tsx        ← Overview
│       ├── product/        ← Product photo flow
│       ├── model/          ← AI model flow
│       ├── projects/       ← Project folders
│       └── settings/       ← Brand presets & billing
├── sign-in/                ← Clerk auth pages
├── sign-up/
└── page.tsx                ← Landing page

lib/
├── fal.ts                  ← fal.ai API wrapper (mock-safe)
├── utils.ts                ← Shared utilities
├── db/
│   ├── schema.ts           ← Drizzle schema
│   └── index.ts            ← DB client
└── actions/
    ├── generate-product.ts ← Server Action
    └── generate-model.ts   ← Server Action

components/
├── dashboard/Sidebar.tsx
├── canvas/BeforeAfterSlider.tsx
└── shared/UploadZone.tsx
```

---

## Features (MVP)

- ✅ **Landing page** with pricing and feature overview
- ✅ **Auth** (sign-up, sign-in, sign-out via Clerk)
- ✅ **Dashboard** with recent generations and stats
- ✅ **Product Photo Flow** — upload → pick scene/angle/ratio → generate → before/after slider → download
- ✅ **AI Model Flow** — upload product → configure synthetic model → generate → download
- ✅ **Mock mode** — full UI demo without any API keys
- ✅ **Settings** — brand presets, billing/plan overview
- ✅ **Projects** — folder organization UI
- ✅ **TypeScript** throughout — `npm run build` passes with zero errors
- ✅ **Next.js 16** — uses `proxy.ts` (not deprecated `middleware.ts`)

---

## Known Limitations & Tradeoffs

### Image Realism
FLUX 1.1 Pro produces excellent results but has known limits:
- **Text on packaging** is reliable but may need regeneration for complex labels
- **Complex scenes** (multiple objects, specific brand props) need detailed custom prompts
- **Consistency across shots** requires careful prompt engineering — LoRA fine-tuning (v2 feature) would give per-brand consistency

### GPU Cost
- ~$0.04–$0.05 per image is very competitive but adds up at scale
- At 1,000 images/day: ~$40–$50/day. Budget accordingly
- 4× upscaling adds ~$0.01/image on top

### No Face Uploads (by design)
The AI Model flow accepts no face photos. All models are 100% synthetic, described only via text descriptors. This is a deliberate safety choice to prevent deepfake/identity misuse.

### Inpainting (v2)
Click-to-regenerate specific regions is not in the MVP. This requires a canvas-based inpainting interface with fal.ai's inpainting endpoint.

---

## Running the Database Migration

```bash
# After setting DATABASE_URL in .env.local:
npx drizzle-kit push

# To inspect the schema:
npx drizzle-kit studio
```

---

## Deployment

### Vercel (recommended)
```bash
npm install -g vercel
vercel link
vercel env pull  # pulls env vars from Vercel dashboard
vercel deploy
```

### Other platforms (Railway, Coolify, DigitalOcean)
Swap `BLOB_READ_WRITE_TOKEN` → S3/MinIO credentials and update `lib/storage.ts` (not included in MVP — add when needed).

---

## License
MIT — build freely, sell commercially.
