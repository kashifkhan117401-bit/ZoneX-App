

# ✨ ZoneX — AI Product Photography & Model Studio 📸


<figure align="center">
   <img src="zonex_landing_1786716005791.jpg" alt="ZoneX landing preview — AI product photography and model studio" width="1000" style="max-width:100%; height:auto; max-height:520px; object-fit:cover; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.12);" />
   <figcaption style="font-size:14px; color:#666; margin-top:8px;">🖼️ Hero preview — ZoneX landing (work in progress)</figcaption>
</figure>

> Create photorealistic product photos and synthetic model photoshoots for e-commerce — no physical studio required.

[![Preview](https://img.shields.io/badge/preview-View-brightgreen.svg)](https://zonex-virid.vercel.app) [![Status](https://img.shields.io/badge/status-WIP-orange.svg)]

---

## 🚀 Quick Highlights

- 🎛️ Mock/demo mode for UI exploration without API keys
- 🖼️ Pluggable image generation (fal.ai / FLUX), background removal, upscaling
- 🔐 Built-in auth, project management, and billing-ready flows

## ✨ Quick Start

1. Install dependencies

```bash
npm install
```

2. Create local env file and configure keys

```bash
cp .env.local.example .env.local
# set NEXT_PUBLIC_MOCK_MODE=false to enable live providers
```

3. Run locally

```bash
npm run dev
```

Open http://localhost:3000 to view the app locally.

## 🧾 Recommended scripts

```bash
# development
npm run dev

# build
npm run build

# start (after build)
npm run start
```

## 🧩 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + custom styles
- **Image Gen:** fal.ai (FLUX), rembg, ESRGAN
- **Auth:** Clerk
- **DB:** Neon Postgres + Drizzle ORM
- **Storage:** Vercel Blob
- **Payments:** Stripe (optional)

## 🗂️ Project Layout (high level)

- `app/` — Next.js routes & layouts
- `components/` — UI components
- `lib/` — API wrappers, utilities, server actions
- `db/` — Drizzle schema + client

## ✅ Features (MVP)

- Landing & marketing pages
- Auth (sign-up / sign-in)
- Dashboard with Recent generations & Projects
- Product photo generation flow (upload → generate → before/after → download)
- Synthetic model photoshoot flow
- Mock mode for demoing without API keys

## 📦 Deploy & Preview

Deploy to Vercel for instant previews. Example preview for this branch: https://zonex-virid.vercel.app

## 🤝 Contributing

- Contributions welcome — open an issue or PR with details and a reproducible change.
- Follow existing TypeScript and linting rules.

## 👤 Author

- **Location:** Lahore, Pakistan
- **Email:** [kashifkhan117401@gmail.com](mailto:kashifkhan117401@gmail.com)
- **Portfolio:** https://kashifhafeez-portfolio1.vercel.app/
- **ORCID:** https://orcid.org/0009-0002-5604-3264
- **LinkedIn:** https://linkedin.com/in/kashif-hafeez-545794330
- **Instagram:** https://www.instagram.com/i_kashiif?igsh=MTUwaTEzNTFocWs2eQ==
- **Facebook:** https://www.facebook.com/share/1AZ6rpfhxb/

> ⚠️ Status: This project is not complete — still a work in progress.

## 📜 License

- MIT
