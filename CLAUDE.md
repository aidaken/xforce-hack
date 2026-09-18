# CLAUDE.md

Living notes for Claude Code / any agent in this repo. **Update this file when something important changes** (stack, branch conventions, Supabase, locked product decisions).

Last updated: 2026-09-18

## What this is

- Hackathon: Capital One @ TAPIA 2026
- Repo: https://github.com/aidaken/xforce-hack
- Challenge **[2]** Neurodiversity-adaptive study workspace. Product name: **ADDY**.
- Working MVP is in `README.md`.
- **Frontend teammates:** [`docs/frontend.md`](docs/frontend.md) — the app is a **React SPA in [`app/`](app/)** (Vite). Edit `app/src/`; `public/app.html` and `public/assets/` are gitignored build output. [`public/index.html`](public/index.html) is still the plain-HTML landing page. Do not rewrite `server/` or `api/` unless you are changing the HTTP contract.
- **Backend:** [`server/`](server/) (ingest, classify, OpenRouter prompts/chat). Vercel wrappers in [`api/`](api/). Ingest types: `text`, `pdf` (text layer or scanned OCR), `docx`, `gdoc`, `url` (including public Google Docs), `sample`. Google Docs must be shared “Anyone with the link”.

## Git

- Default remote branch on GitHub: `dev`
- Current feature branch: `aidar-kenzhebaev`
- Remote: `origin` → `https://github.com/aidaken/xforce-hack.git`
- **Do not checkout `main` to edit files.** Do the work on `aidar-kenzhebaev`.
- **Aidar standing order (2026-09-18):** when he says **push to prod**, that means (1) merge `origin/main` into the feature branch if needed, (2) `git push origin HEAD` and `git push origin HEAD:main`, (3) `vercel --prod --yes` on the shared Vercel project. Never force-push `main`.

## Frontend: React + Vite (landed 2026-09-18)

Ported from the Addy design project into a real SPA. Details:
[`docs/frontend.md`](docs/frontend.md).

- Screens: Login, Onboarding (9 steps), Dashboard, Folder, Reading, Profile, Focus
- All state in `app/src/state/store.jsx`; design tokens in `app/src/styles.css`
- Themes paper / sage / dusk; 6 reading fonts incl. OpenDyslexic; reduce-motion
  toggle **and** `prefers-reduced-motion` are both honoured
- Deep-link a screen while building: `/app?screen=reading&theme=dusk`
- Seed copy in `app/src/data/readings.js` is verbatim from the design — keep it

```bash
npm install
npm run build       # REQUIRED before `npm run dev` — generates public/app.html
npm run dev         # API + built app on :3000
npm run dev:web     # Vite HMR on :5173, proxies /api to :3000
```

Format vocabulary: the server classifies passages as `process` /
`rule_system` / `definition_cluster`; the UI says Flowchart / Checklist /
Quest. That mapping lives in exactly one place — `FORMAT_BY_CONCEPT` in
`app/src/lib/api.js`. Seed readings have hand-written quiz questions; ingested
passages do not, so Quest renders those as read-through beats rather than
inventing questions the source never asked.

## Supabase (mandatory, all branches)

One hosted project. Wire **this**, not a new one.

- Dashboard: https://supabase.com/dashboard/project/tfmzjvoqsktlzwnrzdzr
- Ref: `tfmzjvoqsktlzwnrzdzr`
- URL: `https://tfmzjvoqsktlzwnrzdzr.supabase.co`
- Pinned: `config/supabase.json`
- Guide: `docs/supabase.md`
- Client helper: `lib/supabase.js` (`getSupabase()`)
- After clone: `cp .env.example .env` then `supabase link --project-ref tfmzjvoqsktlzwnrzdzr`
- Never commit `.env` or the service-role key

## Vercel (mandatory, all branches)

One hosted project. GitHub `aidaken/xforce-hack` is already linked. Do **not** create another.

- Dashboard: https://vercel.com/aidars-projects-c6143ce8/xforce-hack
- Project ID: `prj_GXZ75tI8NCSyxSXNFiHanqcIp1Zc`
- Team: `team_XS9LEdNQcwp4cYraijcCL30b` (slug `aidars-projects-c6143ce8`)
- Production: https://xforce-hack.vercel.app
- Pinned: `config/vercel.json`
- Guide: `docs/vercel.md`
- Config: `vercel.json` (static `public/` + serverless `api/`)
- Backend: `server/` ingest + OpenRouter chat. Model: `deepseek/deepseek-v4.1-flash` (`OPENROUTER_MODEL`). Local key: `secrets.toml` (`[openrouter] api_key`, gitignored; copy `secrets.toml.example`). Also accepted: `.env` / Vercel env. Never commit the key. Never put it in CLAUDE.md / CURSOR.md / frontend code.
- Local: `npm run dev` → http://localhost:3000/app
- Frontend map: `docs/frontend.md`
- After clone: `npx vercel link --yes --project xforce-hack --scope aidars-projects-c6143ce8`
- Put anon / `NEXT_PUBLIC_*` Supabase vars on this project. **Never** put `SUPABASE_SERVICE_ROLE_KEY` on Vercel.
- Pushes to GitHub create deployments. Aidar’s “push to prod” updates GitHub `main` and `vercel --prod`.

## Layout

```
ideas/                 challenge 2 brainstorm (pick-list)
config/                cloud project IDs (supabase + vercel)
docs/                  teammate setup (supabase.md, vercel.md, frontend.md)
lib/supabase.js        browser-safe client
app/                   React SPA (Vite) — the real UI, edit here
public/index.html      landing page (plain HTML, outside the Vite build)
public/app.html        BUILD OUTPUT — gitignored, never edit or commit
server/                ingest, classify, OpenRouter, chat
api/                   Vercel serverless wrappers
scripts/               link + connectivity check
supabase/              CLI config.toml (linked to the cloud project)
vercel.json            build: npm run build → public/, plus /api/*
CLAUDE.md / CURSOR.md  living agent docs
```

Product is **ADDY**. Do not invent a second backend or a second Vercel project.

## Agent habits

- Read `ideas/` before proposing a new product shape
- Keep `CLAUDE.md` and `CURSOR.md` in sync when conventions change
- Prefer the shared Supabase for any persistence (remakes, verifier results, sessions)
- Prefer the shared Vercel project for deploys (`prj_GXZ75tI8NCSyxSXNFiHanqcIp1Zc`). Never create a second one.
- OpenRouter key lives in `secrets.toml` (local), `.env`, or Vercel env. Never in git. If a human pastes a key in chat, write it to `secrets.toml` — never into the repo.
