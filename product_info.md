# ADDY — product info

**This is the live product record.** Agents and humans update it **after every finished task**, before they stop. Do not wait for someone to ask. If the code, API, deploy, limits, or a locked decision changed, this file must match reality.

Last updated: 2026-09-18 (add-a-reading rebuilt: one inline panel, client-side PDF text extraction, computed fidelity check; merged the alpaca lockup, self-hosted OpenDyslexic and the Playful study-video buddy)

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
- The reading-alpaca lockup it carried lives on: `app/public/addy-logo.png` (Vite copies it to `/addy-logo.png` on build, with a copy in `public/` for the node static server) is the logo on Login, the app header and the favicon.

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
| Login | `app/src/screens/Login.jsx` | Demo form only — no Supabase auth. Reading-alpaca ADDY lockup at the top |
| Onboarding | `Onboarding.jsx` | ~9 steps: name, ADHD/dyslexia reason, struggles, prefs, focus, sound, buddy |
| Dashboard | `Dashboard.jsx` | Quick settings (left) · continue-reading card · **My folders + “Add a reading”** (no separate drop box, no “Coming up” list) |
| Folder | `Folder.jsx` | Readings in a class folder |
| Reading | `Reading.jsx` | **Guided** (Charlotte’s reading-coach after ingest) · Flowchart · Checklist · Quest. **This isn’t working** POSTs `/api/chat` |
| Profile | `Profile.jsx` | Theme, font, size, reduce-motion |
| Focus | `Focus.jsx` | Timer + read-aloud-style walk |

Themes: paper / sage / dusk. Fonts include Lexend and OpenDyslexic. Deep-link: `/app?screen=reading&theme=dusk`.

#### Add a reading (rebuilt 2026-09-18)

**One** entry point: the **Add a reading** button beside the *My folders* heading on the dashboard. It opens [`AddReading.jsx`](app/src/components/AddReading.jsx) as an **inline panel**, never a modal. The old dashboard `IngestDrop.jsx` drop card is **deleted** — do not bring back a second ingest surface.

Three modes on a segmented row; each keeps its own slot in the store, so switching modes (or closing the panel) never discards what is already entered.

| Mode | Input | Submit label | Sent to `/api/ingest` |
| --- | --- | --- | --- |
| Paste text | Textarea + live word count and ~180 wpm read time | Restructure this | `{ type: "text", text }` (a bare `http…` paste becomes `type: "url"`) |
| Upload a PDF | Drag-drop zone / file picker, **`.pdf` only, up to 40 MB** | Upload and restructure | `{ type: "text", title, text }` — the text layer is pulled out **in the browser** |
| Paste a link | URL field, amber hint if it does not start with `http` | Fetch and restructure | `{ type: "url", url }` |

- **PDFs never leave the browser.** [`app/src/lib/pdfText.js`](app/src/lib/pdfText.js) runs pdf.js (via `unpdf`, dynamic-imported into its own ~1.6 MB lazy chunk) on the file: it rebuilds lines from glyph positions, rejoins wrapped lines into paragraphs, de-hyphenates, and drops running heads/feet and page numbers (repeat-across-pages + page-number patterns in the top/bottom 8% band). First **80 pages**. That is why the UI cap is 40 MB while the server upload cap is still 8 MB — only the words go over the wire.
- **Scanned PDF** (no text layer, under ~40 chars/page): the panel says plainly that the file is page images and offers **Switch to paste text**, plus **Let Addy try to read the pictures** when the file is ≤ 8 MB, which falls back to the server's vision OCR (`type: "pdf"`, first 3 pages).
- **Processing state** lists the real stages — Reading the text → Choosing a format → Checking nothing was lost — then routes to the Reading screen.
- Submit is disabled (50% opacity, `not-allowed`) until the active mode has valid input.
- Folder select uses `FOLDER_NAMES`, i.e. the folders that actually exist.
- Uploading `.docx` / `.gdoc` / `.txt` from the panel is **gone** (PDF-only by design). Those still ingest through **Paste a link** (public Google Doc, remote `.docx`/`.pdf`) or by pasting the text, and `/api/ingest` still accepts every type.

Shared path: [`app/src/lib/ingestReading.js`](app/src/lib/ingestReading.js) builds the payload, calls `/api/ingest`, and reports `extract` → `plan` → `check` back to the panel. Concept types map to UI formats in `FORMAT_BY_CONCEPT`. Seed readings live in `app/src/data/readings.js`. Ingested passages have no generated quiz; Quest uses read-through beats.

#### Format planner + fidelity check

- [`app/src/lib/adapt.js`](app/src/lib/adapt.js) turns a document into a reading. Beats follow the source's **paragraphs** (sentences are cut inside each paragraph, so a heading with no full stop stays its own beat), merged down to at most 6 steps. The one-line rationale names the shape it chose — "This passage describes a step-by-step process, so I made it a flowchart." — and the classifier's longer sentence becomes the **Why?** detail.
- [`app/src/lib/fidelity.js`](app/src/lib/fidelity.js) is a real, offline, lexical check: per source sentence it measures content-word overlap against the remake steps (covered ≥ 0.65, compressed ≥ 0.3, otherwise dropped), counts remake claims no source sentence backs, and flags truncation and crowded steps. The Reading screen shows `Fidelity check · N of N ideas covered · 0 added that weren't in the source`, green tick when clean and an amber warning icon when not. Seed readings keep their hand-written `flags`; ingested readings carry a computed `fidelity`.

**Seed class folders** (`FOLDER_NAMES` / `FOLDER_TINTS` in `app/src/data/readings.js`, 7 readings):

| Folder | Reading | Format | Source |
| --- | --- | --- | --- |
| Biology 101 | Cellular respiration | Flowchart | Addy design copy (verbatim, do not edit) |
| Biology 101 | Moving things across the cell membrane | Checklist | Addy design copy (verbatim, do not edit) |
| Calculus I | The chain rule | Flowchart | OpenStax Calculus Vol. 1 § 3.6 |
| Physics II | Applying Gauss's law | Flowchart | OpenStax University Physics Vol. 2 § 6.3 |
| Physics II | Choosing a Gaussian surface | Checklist | same § 6.3 (the three symmetry cases) |
| Web Development | useEffect | Checklist | react.dev `useEffect` reference |
| US History | The Americas before 1492 | Quest | OpenStax U.S. History § 1.1 |

Each non-Biology entry carries `source: { id, conceptType, url }`, so “This isn’t working” sends the right `conceptType` to `/api/chat` instead of defaulting to `process`. Hand-written seeds follow the design's contract: `sents` stays faithful to the source, `steps` is the remake, `flags` names what the remake dropped or compressed.

After ingest (Add a reading), ADDY opens the **Guided** tab: Charlotte’s `<reading-coach>` walks the passage one idea at a time. A basketball sits on the floor as a fidget (drag to bounce; click twice to put it away). The hoop unlocks only after the whole reading is finished. Alpaca house also opens on finish. **Playful** study buddy mounts her `<study-video>` Subway Surfers sidekick (Calm/Off leave it off). Widgets otherwise mount on Guided. Her files live as-is under [`public/study-activities/`](public/study-activities/) — we only adapt ADDY readings into her lesson schema ([`app/src/lib/coachLesson.js`](app/src/lib/coachLesson.js)). Standalone demos stay at `/study-activities/`. See [`docs/study-activities.md`](docs/study-activities.md). [PR #6](https://github.com/aidaken/xforce-hack/pull/6) is not merged wholesale (avoids README conflicts); the portable components are copied in.

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
| Server-side Source Guard | The fidelity check is real but **client-side and lexical** (`app/src/lib/fidelity.js`): no server claim map, no model-graded entailment, no fidelity API |
| Login / saved profiles | Login + onboarding UI exist; **not** wired to Supabase. Refresh loses the session |
| Persistence | Remakes, documents, streaks not stored in Supabase |
| Private Google Docs | Will not ingest (by design unless we add OAuth later) |
| Old `.doc` (not docx) | Not supported |
| OCR page cap | Vision OCR is first 3 pages only, and only reachable from the scanned-PDF fallback button (≤ 8 MB) |
| PDF page cap | Client-side extraction reads the first 80 pages; the panel says so when a file is longer |
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
| 2026-09-18 | Add-a-reading rebuilt as one inline panel (paste / PDF / link), `IngestDrop.jsx` deleted; client-side PDF text extraction (40 MB, paragraph-preserving, headers/footers stripped, scanned files named as such); computed fidelity check; AA-safe `--warn-text` amber |
| 2026-09-18 | Dashboard “Coming up” section (fake due dates) removed with its `UPCOMING` data |
| 2026-09-18 | Seed folders rebuilt from real sources: Calculus I, Physics II, Web Development, US History (5 new readings). Biology 101 left verbatim; Economics + History Essay retired |
| 2026-09-18 | SPA now serves at `/` and `/app`; `public/index.html` landing page deleted (`public/study-activities/` kept; its alpaca lockup stays on login, header and favicon) |
| 2026-09-18 | Self-hosted OpenDyslexic; Playful buddy mounts Charlotte’s study-video sidekick |
| 2026-09-18 | Reading-alpaca ADDY lockup as the logo (login, header, landing, favicon); `app/public/addy-logo.png` so prod builds include it |
| 2026-09-18 | Llama ADDY logo on login, app header, landing, and favicon |
| 2026-09-18 | Basketball sits on the floor as a fidget; hoop unlocks after a finished reading; double-click puts the ball away |
| 2026-09-18 | Play widgets only on Guided; ball hidden until a throw; demo earn button off |
| 2026-09-18 | PR #6 study activities copied (no README merge); Guided tab + hoops/alpaca after ingest |
| 2026-09-18 | Dashboard ingest box between Quick settings and continue-reading; drop/paste/URL ingest opens Reading |
| 2026-09-18 | Merged React + Vite SPA from `dev` (`3bd65dd` created screens; `9d3e357` merged ingest). Stub `app.html` retired |
| 2026-09-18 | `product_info.md` added; agents must update it after every finished task |
| 2026-09-18 | Ingest: `.docx`, public Google Docs / `.gdoc`, scanned PDF vision OCR; prod deploy |
| 2026-09-18 | OpenRouter via `secrets.toml`; model `deepseek/deepseek-v4.1-flash` |
| 2026-09-18 | Ingest + chat backend, landing, shared Vercel/Supabase docs |
