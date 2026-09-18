# ADDY — product info

**This is the live product record.** Agents and humans update it **after every finished task**, before they stop. Do not wait for someone to ask. If the code, API, deploy, limits, or a locked decision changed, this file must match reality.

Last updated: 2026-09-18 (SPA serves at `/`; hand-written landing page removed)

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
Workspace: https://xforce-hack.vercel.app/app  
Repo: https://github.com/aidaken/xforce-hack  
Feature branch: `aidar-kenzhebaev`

---

## Shipped (working in production)

### Infra

- **One** Vercel project for every branch: `xforce-hack`, `prj_GXZ75tI8NCSyxSXNFiHanqcIp1Zc`, team `team_XS9LEdNQcwp4cYraijcCL30b`. GitHub already linked. Do not create a second project.
- **One** Supabase project for every branch: `tfmzjvoqsktlzwnrzdzr` / `https://tfmzjvoqsktlzwnrzdzr.supabase.co`. Do not create a second project. **No remake/session tables yet** — ingest/chat are in-memory per serverless instance.
- Vercel `buildCommand`: `npm run build` (Vite) into `public/`. `public/app.html` + `public/assets/` are **gitignored build output**.
- Static `public/` + serverless `api/` (`vercel.json`). `public/app.html` + `public/assets/` are gitignored build output; `public/study-activities/` is checked in. Local: `npm run build` then `npm run dev` → http://localhost:3000 (`/` **and** `/app` both serve the SPA). Vite HMR: `npm run dev:web` on :5173.
- Aidar “push to prod”: merge `origin/main` if needed → `git push origin HEAD` and `git push origin HEAD:main` → `vercel --prod --yes`. Never force-push `main`. Do not checkout `main` to edit.

### Landing

- **Removed 2026-09-18.** The old hand-written `public/index.html` pitch page is gone; the React SPA is the only UI and answers `/` as well as `/app`. First screen is Login (`app/src/screens/Login.jsx`). Recover the old page from git history if it is ever wanted back.

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

**React SPA** ([`app/`](app/), Vite) — this **is** the product UI. Edit `app/src/`, never `public/app.html`.

| Screen | File | Notes |
| --- | --- | --- |
| Login | `app/src/screens/Login.jsx` | Demo form only — no Supabase auth |
| Onboarding | `Onboarding.jsx` | ~9 steps: name, ADHD/dyslexia reason, struggles, prefs, focus, sound, buddy |
| Dashboard | `Dashboard.jsx` | Quick settings (left) · **ingest drop box** · continue-reading card · folders |
| Folder | `Folder.jsx` | Readings in a class folder |
| Reading | `Reading.jsx` | **Guided** (Charlotte’s reading-coach after ingest) · Flowchart · Checklist · Quest. **This isn’t working** POSTs `/api/chat` |
| Profile | `Profile.jsx` | Theme, font, size, reduce-motion |
| Focus | `Focus.jsx` | Timer + read-aloud-style walk |

Themes: paper / sage / dusk. Fonts include Lexend and OpenDyslexic. Deep-link: `/app?screen=reading&theme=dusk`.

Add-a-reading lives in two places and shares [`app/src/lib/ingestReading.js`](app/src/lib/ingestReading.js):

- Dashboard **Drop a file or content** card (`IngestDrop.jsx`) — between Quick settings and Cellular respiration. Drop auto-ingests; paste/URL uses **Restructure this**. Success opens the Reading screen with that document.
- Folders **Add a reading** (`AddReading.jsx`) — same ingest path, then opens Reading.

`ingestTypeForFile` in `app/src/lib/api.js`. Concept types map to UI formats in `FORMAT_BY_CONCEPT`. Seed readings in `app/src/data/readings.js`. Ingested passages have no generated quiz; Quest uses read-through beats.

After ingest (dashboard drop or Add a reading), ADDY opens the **Guided** tab: Charlotte’s `<reading-coach>` walks the passage one idea at a time. Finishing a section earns a basketball throw (`<study-hoops>`); finishing the reading opens the alpaca house (`<alpaca-house>`). Her files live as-is under [`public/study-activities/`](public/study-activities/) — we only adapt ADDY readings into her lesson schema ([`app/src/lib/coachLesson.js`](app/src/lib/coachLesson.js)). Standalone demos stay at `/study-activities/`. See [`docs/study-activities.md`](docs/study-activities.md). [PR #6](https://github.com/aidaken/xforce-hack/pull/6) is not merged wholesale (avoids README conflicts).

The old `public/app.html` chat stub is **gone** (replaced by this SPA).

### Secrets (never in git)

| Where | What |
| --- | --- |
| Local | gitignored `secrets.toml` (`[openrouter] api_key`) — copy `secrets.toml.example` |
| Also local | `.env` `OPENROUTER_API_KEY` (overrides) |
| Vercel | `OPENROUTER_API_KEY` + `OPENROUTER_MODEL` on Production and Preview |
| Never | Frontend, `CLAUDE.md`, `CURSOR.md`, this file, GitHub issues with the raw key |

---

## Not shipped (still the MVP gaps)

| Gap | Notes |
| --- | --- |
| Real fidelity / Source Guard | Reading screen has a fidelity panel, but flags are local/seed — no server claim map, no invented/missing API |
| Login / saved profiles | Login + onboarding UI exist; **not** wired to Supabase. Refresh loses the session |
| Persistence | Remakes, documents, streaks not stored in Supabase |
| Private Google Docs | Will not ingest (by design unless we add OAuth later) |
| Old `.doc` (not docx) | Not supported |
| OCR page cap | Vision OCR is first 3 pages only |
| Mermaid as a library | Flowchart is a custom UI component, not Mermaid.js |

### Open decisions (not locked)

1. Demo slice (no accounts) vs full MVP (login, uploads, lock screen). **UI has login/onboarding/focus; auth is still fake.**
2. Two named modes vs preference toggles + free text as the primary model. **API still `adhd`\|`dyslexia`; UI maps onboarding via `learnerFromProfile`.**
3. Planner picks one renderer vs always show both ADHD checklist and dyslexia flowchart for the judge toggle. **Reading screen has Guided + three remake tabs; “This isn’t working” can switch tab + call chat.**

---

## What we built in this backend slice (2026-09-18)

In order, on `aidar-kenzhebaev`, pushed to GitHub `main` and Vercel production when Aidar said push to prod:

1. Shared Supabase + Vercel IDs pinned; agent docs so nobody spins up a second cloud project.
2. Landing page (`public/index.html`) — later removed, see changelog.
3. Ingest + classify + chat API; ADHD/Dyslexia prompts; `public/app.html` marked as a **stub** for frontend teammates (`docs/frontend.md`).
4. OpenRouter wired. Model locked to **DeepSeek V4.1 Flash**. Key in `secrets.toml` locally and Vercel env in prod.
5. PR #4 `main` → `dev` conflicts resolved (merge-ort, pushed).
6. **This session:** ingest limitations closed (docx / public Google Docs / scanned PDF OCR).
7. Tao’s `3bd65dd` ported the Addy design into a React + Vite SPA (`app/`, 7 screens). `9d3e357` merged that with ingest on `dev` (did **not** create the pages — it merged them). Pulled onto `aidar-kenzhebaev` and deployed.
8. Charlotte’s portable study activities from [PR #6](https://github.com/aidaken/xforce-hack/pull/6) (`charlotte-chen`) copied without her README. Guided reading + hoops + alpaca house open after ingest.

---

## How to run

```bash
cp .env.example .env
cp secrets.toml.example secrets.toml   # put OpenRouter key in [openrouter] api_key
npx supabase link --project-ref tfmzjvoqsktlzwnrzdzr
npx vercel link --yes --project xforce-hack --scope aidars-projects-c6143ce8
npm install
npm run build
npm run dev
# http://localhost:3000/app
# optional HMR: npm run dev:web → :5173
```

Frontend: edit [`app/src/`](app/src/). Keep calling `/api/ingest` and `/api/chat`, always resend `document` on chat. See [`docs/frontend.md`](docs/frontend.md).

---

## Changelog

| Date | What landed |
| --- | --- |
| 2026-09-18 | SPA now serves at `/` and `/app`; `public/index.html` landing page deleted (`public/study-activities/` kept) |
| 2026-09-18 | PR #6 study activities copied (no README merge); Guided tab + hoops/alpaca after ingest |
| 2026-09-18 | Dashboard ingest box between Quick settings and continue-reading; drop/paste/URL ingest opens Reading |
| 2026-09-18 | Merged React + Vite SPA from `dev` (`3bd65dd` created screens; `9d3e357` merged ingest). Stub `app.html` retired |
| 2026-09-18 | `product_info.md` added; agents must update it after every finished task |
| 2026-09-18 | Ingest: `.docx`, public Google Docs / `.gdoc`, scanned PDF vision OCR; prod deploy |
| 2026-09-18 | OpenRouter via `secrets.toml`; model `deepseek/deepseek-v4.1-flash` |
| 2026-09-18 | Ingest + chat backend, landing, shared Vercel/Supabase docs |
