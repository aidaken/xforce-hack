# CURSOR.md

Living notes for Cursor (and humans). **Update this file as the project progresses** so a new chat on any branch still knows the setup.

Last updated: 2026-09-18

Cursor also loads `.cursor/rules/*.mdc`. Keep those short; put the longer story here.

## Project

TAPIA / Capital One 2026 hackathon. We are on challenge **[2] Generative AI Neurodiversity-Adaptive Study Workspace**.

Working MVP: `README.md`. Product name: **ADDY**.

**Frontend (friends):** start at [`docs/frontend.md`](docs/frontend.md). Replace the stub in `public/app.html`. Landing is `public/index.html`. Keep calling `/api/ingest` and `/api/chat`.

**Backend:** `server/` (ingest + OpenRouter). Wrappers: `api/`. Prompts: `server/llm/prompts.js`.

Learner toggle is ADHD / Dyslexia. `OPENROUTER_API_KEY` is in local `.env` and Vercel env — never in git, never in this file. Model slug: `OPENROUTER_MODEL=deepseek/deepseek-v4.1-flash`.

## Git

- GitHub: https://github.com/aidaken/xforce-hack
- Work on a feature branch (`aidar-kenzhebaev` as of this note). Do not checkout `main` to edit files.
- Commit only when the human asks.
- **Aidar standing order (2026-09-18):** “push to prod” = push the current branch to GitHub **`main`** and deploy Vercel **production** (`vercel --prod --yes`). Merge `origin/main` first if the branch has diverged. Never force-push `main`.

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

## Vercel — use this one on every branch

GitHub is already linked. Do not create a second Vercel project.

| | |
| --- | --- |
| Dashboard | https://vercel.com/aidars-projects-c6143ce8/xforce-hack |
| Project ID | `prj_GXZ75tI8NCSyxSXNFiHanqcIp1Zc` |
| Team | `team_XS9LEdNQcwp4cYraijcCL30b` (`aidars-projects-c6143ce8`) |
| Production | https://xforce-hack.vercel.app |

Setup: `npx vercel link --yes --project xforce-hack --scope aidars-projects-c6143ce8`. Details: `docs/vercel.md`. IDs: `config/vercel.json`. Static `public/` + serverless `api/`. Local backend: `npm run dev`.

Mirror `.env.example` anon / `NEXT_PUBLIC_*` vars on Vercel. Put `OPENROUTER_API_KEY` on Vercel too (Production + Preview). **Never** put `SUPABASE_SERVICE_ROLE_KEY` or the OpenRouter key in git, rules, or frontend.

Pushes to GitHub deploy. Preview URLs per branch. Production URL: https://xforce-hack.vercel.app. Aidar’s “push to prod” updates GitHub `main` and runs `vercel --prod`.

## When you change something durable

Update **both** `CURSOR.md` and `CLAUDE.md` (date + the relevant section). Examples: locked product combo, new tables, chosen web stack, branch rename.
