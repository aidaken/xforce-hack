# Frontend — start here

The app is a **React SPA built with Vite**, living in `app/`. It builds to
`public/app.html` + `public/assets/`, which are **generated — do not edit them
and do not commit them** (both are gitignored). Keep talking to the existing
API so ingest + OpenRouter keep working.

Live product + API record: [`product_info.md`](../product_info.md). Agents update that file after every finished task.

## What to edit

| You are changing | Go here | Do not |
| --- | --- | --- |
| Any app screen or component | [`app/src/`](../app/src/) | Do not edit `public/app.html` — it is build output |
| Shared app state (screen, theme, onboarding answers) | [`app/src/state/store.jsx`](../app/src/state/store.jsx) | Do not add a second store |
| API calls | [`app/src/lib/api.js`](../app/src/lib/api.js) | Do not fork a second API |
| Demo seed readings | [`app/src/data/readings.js`](../app/src/data/readings.js) | Copy is from the design; keep it verbatim |
| Marketing / landing page | [`public/index.html`](../public/index.html) | Plain HTML, not part of the Vite build |
| Charlotte’s portable widgets | [`public/study-activities/`](../public/study-activities/) | Do not rewrite; ADDY only mounts them |
| Ingest, classify, OpenRouter, prompts | [`server/`](../server/) | Backend owns this |
| Vercel function entrypoints | [`api/`](../api/) | Thin wrappers only |
| Product + API notes for agents | [`product_info.md`](../product_info.md), then [`CLAUDE.md`](../CLAUDE.md) / [`CURSOR.md`](../CURSOR.md) | Never put secrets here |

## App layout

```
app/app.html              Vite entry; builds to public/app.html
app/src/main.jsx          mounts <App>, reads ?screen=/?theme= overrides
app/src/App.jsx           screen router + app shell
app/src/state/store.jsx   all app state, theme/font effects, timers
app/src/styles.css        design tokens (paper/sage/dusk) + component classes
app/src/screens/          Login, Onboarding, Dashboard, Folder, Reading, Profile, Focus
app/src/components/       header, ingest drop, reading-coach embed, study play, formats
app/src/lib/api.js        /api wrappers + concept→format mapping
app/src/lib/adapt.js      turns an ingested document into a reading
app/src/lib/coachLesson.js maps a reading onto Charlotte’s <reading-coach> schema
public/study-activities/  portable guided reading + basketball + alpaca house (do not rewrite)
```

Deep-link any screen while building: `/app?screen=reading`, `?theme=dusk`.

## Two commands

```bash
npm run dev       # API + serves the built app on :3000  (build first)
npm run dev:web   # Vite HMR on :5173; proxies /api and /study-activities to :3000
```

For live reload run both: `npm run dev` in one shell, `npm run dev:web` in another.

## Learner toggle

`learner` is `"adhd"` or `"dyslexia"`. Onboarding maps reason/struggles via `learnerFromProfile` in `app/src/lib/api.js`. ADHD should feel like motion + one-step cards; dyslexia should be large type, extra spacing, no bounce.

## API (already live)

Base: same origin (`/api/...`) locally on `http://localhost:3000` and on Vercel.

| Method | Path | Body / result |
| --- | --- | --- |
| `GET` | `/api/health` | `{ ok, name: "ADDY", llm: "openrouter"\|"heuristic", openrouter: boolean }` |
| `GET` | `/api/samples` | Preloaded demo passages |
| `POST` | `/api/ingest` | `{ type: "text"\|"pdf"\|"docx"\|"gdoc"\|"url"\|"sample", text?, url?, sampleId?, filename?, base64? }` → `{ document }` |
| `POST` | `/api/chat` | `{ learner, message, documentId, document?, history? }` → `{ text, rationale, llm }` |

Ingest sources:

- **text** — pasted or `.txt` / `.md` file (`text`)
- **pdf** — text-layer PDF, or scanned/image-only PDF (vision OCR via OpenRouter, first 3 pages)
- **docx** — Word `.docx` (`base64` or `buffer`)
- **gdoc** — Drive `.gdoc` JSON (`text` or `base64`). The Doc must be **Anyone with the link**
- **url** — article HTML, `.pdf`, `.docx`, or a public `docs.google.com/document/...` link (exported as txt)

After ingest, keep `document` in client memory and send it back on chat (Vercel functions are stateless).

Local:

```bash
cp secrets.toml.example secrets.toml   # put the OpenRouter key in [openrouter] api_key
cp .env.example .env                   # supabase / optional overrides
npm install
npm run build                          # generates public/app.html
npm run dev
# http://localhost:3000/app
```

OpenRouter is server-side only. Local: `secrets.toml`. Prod: Vercel env `OPENROUTER_API_KEY`. Model: `deepseek/deepseek-v4.1-flash`. Never put the key in frontend code.

## Formats

The UI shows four shapes — **Guided**, Flowchart, Checklist, Quest. Ingest opens
Guided (Charlotte’s reading-coach). The server still classifies a passage as
`process` / `rule_system` / `definition_cluster`
(`server/ingest/classify.js`); that mapping still lives in `FORMAT_BY_CONCEPT`
in `app/src/lib/api.js` for the remake tabs. Seed questions are reused in Guided
when present; ingested passages get title-based checks so we never invent source facts.

Seed readings carry hand-written comprehension questions. Ingested passages do
not — the server generates no questions, so Quest renders those as
read-through beats instead of inventing a question the source never asked.

## Accessibility notes worth keeping

- Interactive targets stay at 44px or larger.
- The reduce-motion toggle sets `.rm`, **and** `@media (prefers-reduced-motion)`
  is honoured independently. Don't drop the media query — a tool for
  neurodivergent readers shouldn't need to be asked twice.
- Font, size, line-height and theme are applied to `<html>` from one effect in
  `store.jsx`, so every screen inherits them.
