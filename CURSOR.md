# CURSOR.md

Living notes for Cursor (and humans). **Update this file as the project progresses** so a new chat on any branch still knows the setup.

Last updated: 2026-09-18

Cursor also loads `.cursor/rules/*.mdc`. Keep those short; put the longer story here.

## Project

TAPIA / Capital One 2026 hackathon. We are on challenge **[2] Generative AI Neurodiversity-Adaptive Study Workspace**.

Ideas to pick from: `ideas/product-directions.md`  
Must-haves: `ideas/challenge-brief.md`

Nothing is locked yet. Do not scaffold a competing app until the team circles a combo.

## Git

- GitHub: https://github.com/aidaken/xforce-hack
- Work on a feature branch (`aidar-be` as of this note). Not `main`.
- Commit / push / PR only when the human asks.

## Supabase — use this one on every branch

| | |
| --- | --- |
| Dashboard | https://supabase.com/dashboard/project/tfmzjvoqsktlzwnrzdzr |
| Ref | `tfmzjvoqsktlzwnrzdzr` |
| API | `https://tfmzjvoqsktlzwnrzdzr.supabase.co` |

Setup: copy `.env.example` → `.env`, run `bash scripts/link-supabase.sh`, then `node scripts/check-supabase.mjs`.

Details: `docs/supabase.md`. IDs: `config/supabase.json`. Client: `lib/supabase.js`.

Anon key may live in `.env.example`. **Service-role key never goes in git, rules, or chat.**

If you need a database, add migrations under `supabase/migrations/` and push to **this** project.

## When you change something durable

Update **both** `CURSOR.md` and `CLAUDE.md` (date + the relevant section). Examples: locked product combo, new tables, chosen web stack, branch rename.
