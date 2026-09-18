# Frontend — start here

The app is a **React SPA built with Vite**, living in `app/`. It builds to
`public/app.html` + `public/assets/`, which are **generated — do not edit them
and do not commit them** (both are gitignored). Keep talking to the existing
API so ingest + OpenRouter keep working.

Live product + API record: [`product_info.md`](../product_info.md). Agents update that file after every finished task.

## What to edit

| You are changing | Go here | Do not |
| --- | --- | --- |
| Any app screen or component | [`app/src/`](../app/src/) | Do not edit `public/app.html` or `public/assets/` — build output |
| Shared app state (screen, theme, onboarding answers) | [`app/src/state/store.jsx`](../app/src/state/store.jsx) | Do not add a second store |
| API calls | [`app/src/lib/api.js`](../app/src/lib/api.js) | Do not fork a second API |
| Demo seed readings | [`app/src/data/readings.js`](../app/src/data/readings.js) | Copy is from the design; keep it verbatim |
| Brand logo / favicon | [`app/public/addy-logo.png`](../app/public/addy-logo.png) | Vite copies this to `/addy-logo.png` on build. Keep a copy in [`public/addy-logo.png`](../public/addy-logo.png) for the node static server |
| OpenDyslexic | [`app/public/fonts/`](../app/public/fonts/) | Vite copies to `/fonts/` on build. Keep the same files in [`public/fonts/`](../public/fonts/) for the node static server |
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
app/src/components/       header, add-a-reading panel, reading-coach embed, study play, StudyBuddy, formats
app/src/lib/api.js        /api wrappers + concept→format mapping
app/src/lib/adapt.js      turns an ingested document into a reading
app/src/lib/pdfText.js    client-side PDF text extraction (pdf.js via unpdf)
app/src/lib/fidelity.js   source-vs-remake coverage check
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

## Add a reading

One entry point: the **Add a reading** button beside *My folders* on the
dashboard opens `app/src/components/AddReading.jsx` as an **inline panel**.
There is deliberately no second ingest surface — the old dashboard drop card
was deleted on 2026-09-18.

Three modes on a segmented row, each with its own slot in the store so
switching modes never loses what is typed:

| Mode | Accepts | Posts |
| --- | --- | --- |
| Paste text | any passage; live word count + ~180 wpm estimate | `type: "text"` |
| Upload a PDF | `.pdf` only, up to 40 MB | `type: "text"` — the text layer is extracted **in the browser** |
| Paste a link | article, remote `.pdf` / `.docx`, public Google Doc | `type: "url"` |

`app/src/lib/pdfText.js` does the PDF work client-side with pdf.js (shipped
inside `unpdf`, behind a dynamic `import()` so the 1.6 MB chunk only loads
when someone picks a PDF). It rebuilds lines from glyph positions, rejoins
wrapped lines into paragraphs, de-hyphenates, and strips running heads, feet
and page numbers. Reads the first 80 pages.

**The file never leaves the browser** — only the extracted words are posted.
That is why the panel can accept 40 MB while `/api/ingest` still caps uploads
at 8 MB. A PDF with no text layer is called what it is ("this is pictures of
pages"), with a button to switch to paste-text and, for files under 8 MB, an
opt-in fallback to the server's vision OCR.

`app/src/lib/fidelity.js` then compares the source sentences against the
remake steps and the Reading screen reports `N of N ideas covered · 0 added
that weren't in the source`, listing whatever was dropped, shortened or
crowded into one step.

## Accessibility contract for this panel

Worth keeping when you touch it: every control ≥ 44px tall, 12px corners,
body text ≥ 18px at line-height 1.5–1.6, left-aligned and never justified,
icons always next to a text label, sentence case throughout. **Nothing is ever
red** — problems are warm amber (`--warn` for borders, `--warn-text` for text
and icons, which is the AA-safe tone of the same amber) plus an icon plus
words.

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
- OpenDyslexic is self-hosted (`public/fonts/*.woff2`, SIL OFL). Do not load it
  from a CDN — the old `@fontsource/opendyslexic` jsDelivr URLs 404.
