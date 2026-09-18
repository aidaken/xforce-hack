# CLAUDE.md

Living notes for Claude Code / any agent in this repo. **Update this file when something important changes** (stack, branch conventions, Supabase, locked product decisions).

Last updated: 2026-09-18

## What this is

- Hackathon: Capital One @ TAPIA 2026
- Repo: https://github.com/aidaken/xforce-hack
- Challenge **[2]** Neurodiversity-adaptive study workspace. Product name: **ADDY**.
- Working MVP is in `README.md`.
- **Frontend teammates:** [`docs/frontend.md`](docs/frontend.md) — replace [`public/app.html`](public/app.html) (chat stub) and optionally [`public/index.html`](public/index.html) (landing). Do not rewrite `server/` or `api/` unless you are changing the HTTP contract.
- **Backend:** [`server/`](server/) (ingest, classify, OpenRouter prompts/chat). Vercel wrappers in [`api/`](api/).

## Git

- Default remote branch on GitHub: `dev`
- Current feature branch: `aidar-kenzhebaev`
- Remote: `origin` → `https://github.com/aidaken/xforce-hack.git`
- **Do not checkout `main` to edit files.** Do the work on `aidar-kenzhebaev`.
- **Aidar standing order (2026-09-18):** when he says **push to prod**, that means (1) merge `origin/main` into the feature branch if needed, (2) `git push origin HEAD` and `git push origin HEAD:main`, (3) `vercel --prod --yes` on the shared Vercel project. Never force-push `main`.

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
- Backend: `server/` ingest + OpenRouter chat. Set `OPENROUTER_API_KEY` in **local `.env` (gitignored)** and on the Vercel project env. Never commit the key. Never put it in CLAUDE.md / CURSOR.md / frontend code.
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
public/                landing + ADDY chat (`app.html`)
server/                ingest, classify, OpenRouter, chat
api/                   Vercel serverless wrappers
scripts/               link + connectivity check
supabase/              CLI config.toml (linked to the cloud project)
vercel.json            static public/ + /api/*
CLAUDE.md / CURSOR.md  living agent docs
```

Product is **ADDY**. Do not invent a second backend or a second Vercel project.

## Agent habits

- Read `ideas/` before proposing a new product shape
- Keep `CLAUDE.md` and `CURSOR.md` in sync when conventions change
- Prefer the shared Supabase for any persistence (remakes, verifier results, sessions)
- Prefer the shared Vercel project for deploys (`prj_GXZ75tI8NCSyxSXNFiHanqcIp1Zc`). Never create a second one.
- OpenRouter key lives in `.env` + Vercel env only. If a human pastes a key in chat, write it there — never into git.
