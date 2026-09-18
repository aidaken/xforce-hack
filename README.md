# XForce Hackathon

Team project for Capital One / TAPIA 2026. Challenge **[2] Generative AI Neurodiversity-Adaptive Study Workspace**.

GitHub: [aidaken/xforce-hack](https://github.com/aidaken/xforce-hack)

## Shared Supabase (all branches)

There is **one** hosted project. Use it on `main`, `dev`, `aidar-be`, and every other branch. Do not spin up a second project.

| | |
| --- | --- |
| Name | `xforce-hack` |
| Dashboard | https://supabase.com/dashboard/project/tfmzjvoqsktlzwnrzdzr |
| Ref | `tfmzjvoqsktlzwnrzdzr` |
| API | `https://tfmzjvoqsktlzwnrzdzr.supabase.co` |

After clone:

```bash
cp .env.example .env
npx supabase link --project-ref tfmzjvoqsktlzwnrzdzr
npm install
node scripts/check-supabase.mjs
```

Teammate guide: [docs/supabase.md](docs/supabase.md)  
Pinned IDs: [config/supabase.json](config/supabase.json)

## Repo map

- `ideas/` — product options for challenge 2 (not locked)
- `supabase/` — CLI config, linked to the hosted project above
- `CLAUDE.md` / `CURSOR.md` — living notes for humans and agents

Do not commit on `main`. Feature work happens on branches.
