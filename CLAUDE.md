# CLAUDE.md

Living notes for Claude Code / any agent in this repo. **Update this file when something important changes** (stack, branch conventions, Supabase, locked product decisions).

Last updated: 2026-09-18

## What this is

- Hackathon: Capital One @ TAPIA 2026
- Repo: https://github.com/aidaken/xforce-hack
- Challenge **[2]** Neurodiversity-adaptive study workspace. Working name: **Study Remix**.
- Working MVP is in `README.md`. Earlier options still live in `ideas/`. Scope is **not fully locked** (login vs no-accounts, two modes vs preference toggles).

## Git

- Default remote branch on GitHub: `dev`
- Do **not** commit or push to `main` / `master`
- Current feature branch: `aidar-be`
- Remote: `origin` → `https://github.com/aidaken/xforce-hack.git`

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
- Config: `vercel.json` (static `public/` until the app scaffold lands)
- After clone: `npx vercel link --yes --project xforce-hack --scope aidars-projects-c6143ce8`
- Put anon / `NEXT_PUBLIC_*` Supabase vars on this project. **Never** put `SUPABASE_SERVICE_ROLE_KEY` on Vercel.
- Pushes to GitHub create deployments. PR to `dev`. Do not push `main`.

## Layout

```
ideas/                 challenge 2 brainstorm (pick-list)
config/                cloud project IDs (supabase + vercel)
docs/                  teammate setup (supabase.md, vercel.md)
lib/supabase.js        browser-safe client
public/                static holding page until the app exists
scripts/               link + connectivity check
supabase/              CLI config.toml (linked to the cloud project)
vercel.json            Vercel build: output public/
CLAUDE.md / CURSOR.md  living agent docs
```

No app scaffold yet. Holding page only. Do not invent a second backend or a second Vercel project.

## Agent habits

- Read `ideas/` before proposing a new product shape
- Keep `CLAUDE.md` and `CURSOR.md` in sync when conventions change
- Prefer the shared Supabase for any persistence (remakes, verifier results, sessions)
- Prefer the shared Vercel project for deploys (`prj_GXZ75tI8NCSyxSXNFiHanqcIp1Zc`). Never create a second one.
