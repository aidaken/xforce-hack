# CURSOR.md

Living notes for Cursor (and humans). **Product truth lives in [`product_info.md`](product_info.md).** Update that after every finished task. Update this file when agent conventions change (git, cloud IDs, secrets).

Last updated: 2026-09-18

Cursor also loads `.cursor/rules/*.mdc`. Keep those short; put the product story in `product_info.md`.

## Closeout (do this before you stop)

After you finish the work — not later, not only if asked:

1. Update [`product_info.md`](product_info.md) so shipped vs not, API, limits, and next gaps match reality. Bump **Last updated** and **Changelog**.
2. Update this file and [`CLAUDE.md`](CLAUDE.md) only if agent conventions changed.
3. Never put secrets in any of these files.

## Project

TAPIA / Capital One 2026 hackathon. We are on challenge **[2] Generative AI Neurodiversity-Adaptive Study Workspace**.

**Live product record:** [`product_info.md`](product_info.md). Pitch / MVP draft: `README.md`. Product name: **ADDY**.

**Frontend (friends):** start at [`docs/frontend.md`](docs/frontend.md). The app
is now a **React SPA in `app/`** (Vite), built into `public/app.html` +
`public/assets/` — both are gitignored build output, so edit `app/src/`, never
`public/app.html`. Charlotte’s portable guided reading + play widgets live under
`public/study-activities/` — mount them, don’t rewrite. Run `npm run build` once
before `npm run dev`, or use `npm run dev:web` for HMR on :5173. The SPA serves
at both `/` and `/app`; there is no separate landing page any more.
Keep calling `/api/ingest` and `/api/chat`.

**Backend:** `server/` (ingest + OpenRouter). Wrappers: `api/`. Prompts: `server/llm/prompts.js`. Ingest: paste, PDF (text or scanned OCR), Word `.docx`, public Google Doc URL / `.gdoc`, URL, samples.

Learner toggle is ADHD / Dyslexia. OpenRouter key: local `secrets.toml` (`[openrouter] api_key`) or `.env` / Vercel — never in git, never in this file. Model: `deepseek/deepseek-v4.1-flash`. Copy `secrets.toml.example` → `secrets.toml`.

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

1. **Always:** [`product_info.md`](product_info.md) (date + changelog + the section that changed).
2. **If conventions changed:** both `CURSOR.md` and `CLAUDE.md`. Examples: locked product combo, new tables, chosen web stack, branch rename.
