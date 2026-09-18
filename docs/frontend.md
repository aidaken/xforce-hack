# Frontend — start here

The **real UI is not this stub.** Replace `public/app.html` (and restyle `public/index.html` if you want). Keep talking to the existing API so ingest + OpenRouter keep working.

## What to edit

| You are changing | Go here | Do not |
| --- | --- | --- |
| Chat workspace UI (toggle, drop zone, messages, ADHD motion, dyslexia type) | [`public/app.html`](../public/app.html) | Do not fork a second API |
| Marketing / landing page | [`public/index.html`](../public/index.html) | |
| Ingest, classify, OpenRouter, prompts | [`server/`](../server/) | Backend owns this |
| Vercel function entrypoints | [`api/`](../api/) | Thin wrappers only |
| Product + API notes for agents | [`CLAUDE.md`](../CLAUDE.md), [`CURSOR.md`](../CURSOR.md) | Never put secrets here |

You can later swap `public/app.html` for Next.js/Vite. Point the new app at the same routes below.

## Learner toggle

`learner` is `"adhd"` or `"dyslexia"`. The stub uses a two-button switch. ADHD should feel like motion + one-step cards; dyslexia should be large type, extra spacing, no bounce.

## API (already live)

Base: same origin (`/api/...`) locally on `http://localhost:3000` and on Vercel.

| Method | Path | Body / result |
| --- | --- | --- |
| `GET` | `/api/health` | `{ ok, name: "ADDY", llm: "openrouter"\|"heuristic", openrouter: boolean }` |
| `GET` | `/api/samples` | Preloaded demo passages |
| `POST` | `/api/ingest` | `{ type: "text"\|"pdf"\|"url"\|"sample", text?, url?, sampleId?, filename?, base64? }` → `{ document }` |
| `POST` | `/api/chat` | `{ learner, message, documentId, document?, history? }` → `{ text, rationale, llm }` |

After ingest, keep `document` in client memory and send it back on chat (Vercel functions are stateless).

Local:

```bash
cp secrets.toml.example secrets.toml   # put the OpenRouter key in [openrouter] api_key
cp .env.example .env                   # supabase / optional overrides
npm install
npm run dev
# http://localhost:3000/app
```

OpenRouter is server-side only. Local: `secrets.toml`. Prod: Vercel env `OPENROUTER_API_KEY`. Model: `deepseek/deepseek-v4.1-flash`. Never put the key in frontend code.
