# CLAUDE.md

Living notes for Claude Code / any agent in this repo. **Update this file when something important changes** (stack, branch conventions, Supabase, locked product decisions).

Last updated: 2026-09-18

## What this is

- Hackathon: Capital One @ TAPIA 2026
- Repo: https://github.com/aidaken/xforce-hack
- Challenge **[2]** Neurodiversity-adaptive study workspace (see `ideas/`)
- Product direction is **not locked**. Options live in `ideas/product-directions.md`

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

## Layout

```
ideas/                 challenge 2 brainstorm (pick-list)
config/supabase.json   cloud project IDs
docs/supabase.md       teammate setup
lib/supabase.js        browser-safe client
scripts/               link + connectivity check
supabase/              CLI config.toml (linked to the cloud project)
CLAUDE.md / CURSOR.md  living agent docs
```

No web app scaffold yet. Do not invent a second backend.

## Agent habits

- Read `ideas/` before proposing a new product shape
- Keep `CLAUDE.md` and `CURSOR.md` in sync when conventions change
- Prefer the shared Supabase for any persistence (remakes, verifier results, sessions)
