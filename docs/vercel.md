# Shared Vercel

**Every git branch deploys to this project.** Do not create another Vercel project for xforce-hack.

| Field | Value |
| --- | --- |
| Name | `xforce-hack` |
| Dashboard | https://vercel.com/aidars-projects-c6143ce8/xforce-hack |
| Project ID | `prj_GXZ75tI8NCSyxSXNFiHanqcIp1Zc` |
| Team | Aidar's projects (`team_XS9LEdNQcwp4cYraijcCL30b`, slug `aidars-projects-c6143ce8`) |
| Production URL | https://xforce-hack.vercel.app |
| GitHub | `aidaken/xforce-hack` (already linked) |
| Pinned file | `config/vercel.json` |

GitHub integration is on. A push to GitHub creates a deployment. Feature branches get preview URLs like `xforce-hack-git-<branch>-aidars-projects-c6143ce8.vercel.app`. Production URL aliases the latest production deploy (as of 2026-09-18 that was `dev`, not `main`).

## After you clone

```bash
cp .env.example .env
npx vercel link --yes --project xforce-hack --scope aidars-projects-c6143ce8
```

That writes `.vercel/` (gitignored). IDs are also pinned in `config/vercel.json` so agents do not invent a second project.

## Environment variables

The GitHub integration already synced Supabase vars onto this Vercel project (anon + `NEXT_PUBLIC_*` on Production and Preview).

**Do not add `SUPABASE_SERVICE_ROLE_KEY` to Preview or to the client bundle.** If it is already on Vercel, keep it Production-only (or remove it) and never read it in browser code. Prefer `getSupabase()` with the anon key.

| Name | Where it should live |
| --- | --- |
| `SUPABASE_URL` | Production + Preview + Development |
| `SUPABASE_ANON_KEY` | Production + Preview + Development |
| `NEXT_PUBLIC_SUPABASE_URL` | same (for Next.js later) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same |

Dashboard: Project → Settings → Environment Variables.

Or CLI (after `vercel link`):

```bash
npx vercel env ls
```

## Do not

- Create a personal/staging Vercel project “just for my branch”
- Push to `main` to get a deploy — work on a feature branch, PR to `dev`
- Commit `.vercel/` or `.env`
- Deploy a second app under a new Vercel project name
