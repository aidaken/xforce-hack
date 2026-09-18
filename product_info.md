# ADDY — product info

**This is the live product record.** Agents and humans update it **after every finished task**, before they stop. Do not wait for someone to ask. If the code, API, deploy, limits, or a locked decision changed, this file must match reality.

Last updated: 2026-09-18 (ingest: Word / Google Docs / scanned PDF OCR; docs closeout rule)

Companion files (conventions only, not the product record): [`CLAUDE.md`](CLAUDE.md), [`CURSOR.md`](CURSOR.md), [`.cursor/rules/`](.cursor/rules/). Frontend map: [`docs/frontend.md`](docs/frontend.md). Pitch/MVP draft: [`README.md`](README.md).

## Agent closeout (mandatory)

When a task is done — code, docs, deploy, or a product decision — **before you stop**:

1. Edit **this file** so shipped vs not, API, limits, env, and next gaps are true.
2. Bump **Last updated** (date + one-line what changed).
3. Append a row to **Changelog** if you shipped or locked something.
4. Update `CLAUDE.md` / `CURSOR.md` / `.cursor/rules` **only** if agent conventions changed (git, cloud IDs, secrets, branch names).
5. Never put `OPENROUTER_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `.env` values here.

---

## What this product is

**ADDY** (TAPIA / Capital One 2026, challenge **[2]**). Neurodiversity-adaptive study workspace.

One passage in. Remake it for the active learner:

| Learner | Goal | Current remake shape |
| --- | --- | --- |
| `adhd` | Cut working-memory load | Numbered checklist, “do this next,” ~12 words/bullet, rationale line first |
| `dyslexia` | Cut decoding load | Short labeled stages (flowchart-in-text), extra spacing, no walls of prose |

We are **not** diagnosing anyone. Copy must stay “designed around common ADHD / dyslexia study preferences,” not clinically proven.

Production: https://xforce-hack.vercel.app  
Workspace stub: https://xforce-hack.vercel.app/app  
Repo: https://github.com/aidaken/xforce-hack  
Feature branch for this backend work: `aidar-kenzhebaev`

---

## Shipped (working in production)

### Infra

- **One** Vercel project for every branch: `xforce-hack`, `prj_GXZ75tI8NCSyxSXNFiHanqcIp1Zc`, team `team_XS9LEdNQcwp4cYraijcCL30b`. GitHub already linked. Do not create a second project.
- **One** Supabase project for every branch: `tfmzjvoqsktlzwnrzdzr` / `https://tfmzjvoqsktlzwnrzdzr.supabase.co`. Do not create a second project. **No remake/session tables yet** — ingest/chat are in-memory per serverless instance.
- Static `public/` + serverless `api/` (`vercel.json`). Local: `npm run dev` → http://localhost:3000 (`/` landing, `/app` workspace).
- Aidar “push to prod”: merge `origin/main` if needed → `git push origin HEAD` and `git push origin HEAD:main` → `vercel --prod --yes`. Never force-push `main`. Do not checkout `main` to edit.

### Landing

- [`public/index.html`](public/index.html) — pitch + **Remix a passage** → `/app`. Friends may restyle.

### Ingest + chat backend

Core: [`server/`](server/). Thin Vercel wrappers: [`api/`](api/). Router: [`server/router.js`](server/router.js).

| Method | Path | What it does |
| --- | --- | --- |
| `GET` | `/api/health` | `{ ok, name: "ADDY", llm: "openrouter"\|"heuristic", openrouter }` |
| `GET` | `/api/samples` | Three preloaded passages (id, title, excerpt) |
| `POST` | `/api/ingest` | Extract + classify + chunk → `{ document }` |
| `POST` | `/api/chat` | ADHD or dyslexia remake via OpenRouter (or local heuristic if no key) |

**Ingest `type` values**

| `type` | How | Notes |
| --- | --- | --- |
| `text` | `{ text }` or `.txt` / `.md` file | Pasted or uploaded |
| `pdf` | `{ filename, base64 }` | Text layer via `unpdf`. If empty, scanned-PDF path: render pages (`@napi-rs/canvas` optional) or embedded images (`pngjs`) → DeepSeek **vision OCR**, first **3 pages** |
| `docx` | `{ filename, base64 }` | `mammoth` raw text |
| `gdoc` | `{ filename, text }` of Drive `.gdoc` JSON | Reads `url` or `doc_id`, then same as Google Doc URL |
| `url` | `{ url }` | Article HTML, remote `.pdf` / `.docx`, or `docs.google.com/document/...` exported as `txt` |
| `sample` | `{ sampleId }` | `cellular-respiration`, `useeffect`, `chain-rule` |

Google Docs must be **Anyone with the link can view** (or published to the web). Restricted docs → `GDOC_PRIVATE` (403). Invalid `.gdoc` JSON → `GDOC_INVALID` (400).

Caps: **8 MB** file, **80k** characters (truncated with a marker), URL fetch ~12s, SSRF blocks localhost / link-local / RFC1918.

After ingest the client **must keep `document` in memory** and send it back on every `/api/chat`. Vercel functions are stateless; `documentId` alone is not enough on a new instance.

**Chat**

- Body: `{ learner: "adhd"\|"dyslexia", message, documentId, document, history? }`
- OpenRouter model: `deepseek/deepseek-v4.1-flash` (`OPENROUTER_MODEL`)
- Prompts: [`server/llm/prompts.js`](server/llm/prompts.js) — never invent facts, keep scientific terms, start with `I chose [format] because…`
- Cheap classifier before the LLM: `process` / `rule_system` / `definition_cluster` ([`server/ingest/classify.js`](server/ingest/classify.js))
- If the key is missing, [`server/llm/heuristic.js`](server/llm/heuristic.js) still returns a remake so the UI can be built
- `ingest` and `chat` functions set `maxDuration` 60s in `vercel.json`

**Stub UI** ([`public/app.html`](public/app.html)) — **not** the real product UI. Friends replace it. It has ADHD/Dyslexia toggle, sample buttons, drop zone (PDF / Word / Google Doc / txt), paste, URL, chat. Ingest does **not** auto-chat; user still sends “remake this”. ADHD stub has bouncing pup (hidden for dyslexia / reduced motion). Fonts: Lexend, OpenDyslexic, Atkinson Hyperlegible.

### Secrets (never in git)

| Where | What |
| --- | --- |
| Local | gitignored `secrets.toml` (`[openrouter] api_key`) — copy `secrets.toml.example` |
| Also local | `.env` `OPENROUTER_API_KEY` (overrides) |
| Vercel | `OPENROUTER_API_KEY` + `OPENROUTER_MODEL` on Production and Preview |
| Never | Frontend, `CLAUDE.md`, `CURSOR.md`, this file, GitHub issues with the raw key |

---

## Not shipped (still the MVP gaps)

These are the judge-facing product pieces that are **not** in production yet:

| Gap | Notes |
| --- | --- |
| Real workspace UI | Side-by-side source / remake, Mermaid flowchart, gamified step-reveal. Stub chat only. |
| Fidelity / Source Guard | No claim decomposition, no supported/missing/invented report, no linked highlighting |
| Adapt loop | No **This isn’t working** → re-plan to another format |
| Auto-remake after ingest | Stub only ingests; student must send a chat message |
| Login / saved profiles | Skippable for demo; Supabase not used for sessions yet |
| Preference profile | Color, music, fonts, interests, free-text “what trips me up” — not wired |
| Lock / focus screen | Explicitly TBD |
| Persistence | Remakes, verifier results, documents not stored in Supabase |
| Private Google Docs | Will not ingest (by design unless we add OAuth later) |
| Old `.doc` (not docx) | Not supported |
| OCR page cap | Vision OCR is first 3 pages only |

### Open decisions (not locked)

1. Demo slice (no accounts) vs full MVP (login, uploads, lock screen).
2. Two named modes vs preference toggles + free text as the primary model. **Current code: two named modes.**
3. Planner picks one renderer vs always show both ADHD checklist and dyslexia flowchart for the judge toggle. **Current code: one remake per `learner` on each chat call; toggle = new chat.**

---

## What we built in this backend slice (2026-09-18)

In order, on `aidar-kenzhebaev`, pushed to GitHub `main` and Vercel production when Aidar said push to prod:

1. Shared Supabase + Vercel IDs pinned; agent docs so nobody spins up a second cloud project.
2. Landing page (`public/index.html`).
3. Ingest + classify + chat API; ADHD/Dyslexia prompts; `public/app.html` marked as a **stub** for frontend teammates (`docs/frontend.md`).
4. OpenRouter wired. Model locked to **DeepSeek V4.1 Flash**. Key in `secrets.toml` locally and Vercel env in prod.
5. PR #4 `main` → `dev` conflicts resolved (merge-ort, pushed).
6. **This session:** ingest limitations closed —
   - Word `.docx` (`mammoth`)
   - Public Google Doc URLs (`/export?format=txt`) and Drive `.gdoc` files
   - Scanned / image-only PDFs (page render or embedded images → vision OCR)
   - Stub file picker accepts those types
   - Verified: local docx/pdf/text/error paths; prod `POST /api/ingest` docx `201`; DeepSeek OCR smoke test returned `Hello ADDY mitochondria` from a rendered page in ~3s

---

## How to run

```bash
cp .env.example .env
cp secrets.toml.example secrets.toml   # put OpenRouter key in [openrouter] api_key
npx supabase link --project-ref tfmzjvoqsktlzwnrzdzr
npx vercel link --yes --project xforce-hack --scope aidars-projects-c6143ce8
npm install
npm run dev
# http://localhost:3000/app
```

Frontend teammates: replace `public/app.html`, keep calling `/api/ingest` and `/api/chat`, always resend `document` on chat. See [`docs/frontend.md`](docs/frontend.md).

---

## Changelog

| Date | What landed |
| --- | --- |
| 2026-09-18 | `product_info.md` added; agents must update it after every finished task |
| 2026-09-18 | Ingest: `.docx`, public Google Docs / `.gdoc`, scanned PDF vision OCR; stub drop zone updated; prod deploy |
| 2026-09-18 | OpenRouter via `secrets.toml`; model `deepseek/deepseek-v4.1-flash` |
| 2026-09-18 | Ingest + chat backend, ADHD/Dyslexia toggle, stub `app.html`, landing, shared Vercel/Supabase docs |
