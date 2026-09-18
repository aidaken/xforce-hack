# Shared Supabase

**Every git branch uses this project.** Do not create another Supabase project for xforce-hack.

| Field | Value |
| --- | --- |
| Name | `xforce-hack` |
| Dashboard | https://supabase.com/dashboard/project/tfmzjvoqsktlzwnrzdzr |
| Project ref | `tfmzjvoqsktlzwnrzdzr` |
| API URL | `https://tfmzjvoqsktlzwnrzdzr.supabase.co` |
| Region | West US (Oregon) |
| Pinned file | `config/supabase.json` |

The anon / publishable keys live in `.env.example` (safe for the client; RLS is what protects data). The **service_role / secret key must never be committed**.

## After you clone (any branch)

```bash
cp .env.example .env
# If you need server-side admin: paste service_role into SUPABASE_SERVICE_ROLE_KEY from
# Dashboard → Project Settings → API

npx supabase link --project-ref tfmzjvoqsktlzwnrzdzr
# or: bash scripts/link-supabase.sh

npm install
node scripts/check-supabase.mjs
```

`supabase link` writes into `supabase/.temp/` (gitignored). That is why the ref is also pinned in `config/supabase.json`, `.env.example`, `CLAUDE.md`, and `CURSOR.md`.

## App code

Import `getSupabase()` from `lib/supabase.js`. It reads `SUPABASE_URL` + `SUPABASE_ANON_KEY` (or the `NEXT_PUBLIC_*` aliases).

Use the **anon** key in the browser. Use **service_role** only on a trusted server, never in client code.

## Schema / migrations

When we add tables, put SQL in `supabase/migrations/` and push with `supabase db push` against **this** project. Until then the cloud DB is empty by design.

## Do not

- Create a personal/staging Supabase “just for my branch”
- Commit `.env`
- Put `SUPABASE_SERVICE_ROLE_KEY` in client bundles, Cursor rules, or chat logs
